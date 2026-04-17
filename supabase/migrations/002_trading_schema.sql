-- ============================================================
-- 002_trading_schema.sql
-- Trading tables: signals and trades with cross-FK traceability
-- ============================================================

-- signals and trades have a circular dependency (each references the other).
-- Resolve with deferrable constraints.

-- ============================================================
-- signals
-- ============================================================
CREATE TABLE signals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset       text NOT NULL,
  direction   text NOT NULL CHECK (direction IN ('long', 'short')),
  signal_type text NOT NULL CHECK (signal_type IN ('entry', 'warning', 'exit')),
  price       numeric NOT NULL,
  timestamp   timestamptz NOT NULL,
  raw_payload jsonb NOT NULL DEFAULT '{}',
  -- Set after matching to the resulting trade
  trade_id    uuid,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER signals_updated_at
  BEFORE UPDATE ON signals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX signals_asset_type_idx ON signals(asset, signal_type, timestamp DESC);

-- ============================================================
-- trades
-- ============================================================
CREATE TABLE trades (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset               text NOT NULL,
  direction           text NOT NULL CHECK (direction IN ('long', 'short')),
  entry_price         numeric NOT NULL,
  entry_time          timestamptz NOT NULL,
  partial_exit_price  numeric,
  partial_exit_time   timestamptz,
  exit_price          numeric,
  exit_time           timestamptz,
  pnl_r               numeric,
  status              text NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open', 'partial', 'closed')),
  notes               text,
  -- The entry signal that created this trade
  signal_id           uuid REFERENCES signals(id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX trades_status_idx ON trades(status, asset, entry_time DESC);
CREATE INDEX trades_asset_open_idx ON trades(asset, direction, entry_time DESC)
  WHERE status IN ('open', 'partial');

-- Now add the FK from signals back to trades (deferred so webhook inserts work in one tx)
ALTER TABLE signals
  ADD CONSTRAINT signals_trade_id_fk
  FOREIGN KEY (trade_id) REFERENCES trades(id)
  DEFERRABLE INITIALLY DEFERRED;

-- Enable RLS (policies in 003)
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECURITY DEFINER function for webhook writes
-- This allows the webhook to write to signals + trades
-- via a single safe function, without full service role exposure.
-- ============================================================
CREATE OR REPLACE FUNCTION process_trading_signal(
  p_asset       text,
  p_direction   text,
  p_signal_type text,
  p_price       numeric,
  p_timestamp   timestamptz,
  p_raw_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_signal_id uuid;
  v_trade_id  uuid;
  v_entry     numeric;
  v_pnl_r     numeric;
  v_result    jsonb;
BEGIN
  -- Insert the signal record
  INSERT INTO signals (asset, direction, signal_type, price, timestamp, raw_payload)
  VALUES (p_asset, p_direction, p_signal_type, p_price, p_timestamp, p_raw_payload)
  RETURNING id INTO v_signal_id;

  IF p_signal_type = 'entry' THEN
    -- Open a new trade
    INSERT INTO trades (asset, direction, entry_price, entry_time, status, signal_id)
    VALUES (p_asset, p_direction, p_price, p_timestamp, 'open', v_signal_id)
    RETURNING id INTO v_trade_id;

    -- Back-link the signal to the trade
    UPDATE signals SET trade_id = v_trade_id WHERE id = v_signal_id;

    v_result := jsonb_build_object('action', 'trade_opened', 'trade_id', v_trade_id, 'signal_id', v_signal_id);

  ELSIF p_signal_type = 'warning' THEN
    -- Update most recent open trade for same asset + direction
    UPDATE trades
    SET partial_exit_price = p_price,
        partial_exit_time  = p_timestamp,
        status             = 'partial',
        updated_at         = now()
    WHERE id = (
      SELECT id FROM trades
      WHERE asset = p_asset
        AND direction = p_direction
        AND status = 'open'
      ORDER BY entry_time DESC
      LIMIT 1
    )
    RETURNING id INTO v_trade_id;

    IF v_trade_id IS NOT NULL THEN
      UPDATE signals SET trade_id = v_trade_id WHERE id = v_signal_id;
    END IF;

    v_result := jsonb_build_object('action', 'trade_partial', 'trade_id', v_trade_id, 'signal_id', v_signal_id);

  ELSIF p_signal_type = 'exit' THEN
    -- Update most recent open or partial trade for same asset + direction
    WITH target AS (
      SELECT id, entry_price, direction FROM trades
      WHERE asset = p_asset
        AND direction = p_direction
        AND status IN ('open', 'partial')
      ORDER BY entry_time DESC
      LIMIT 1
    )
    UPDATE trades t
    SET exit_price = p_price,
        exit_time  = p_timestamp,
        status     = 'closed',
        pnl_r      = CASE
                       WHEN target.direction = 'long'
                         THEN (p_price - target.entry_price) / (target.entry_price * 0.005)
                       ELSE
                         (target.entry_price - p_price) / (target.entry_price * 0.005)
                     END,
        updated_at = now()
    FROM target
    WHERE t.id = target.id
    RETURNING t.id INTO v_trade_id;

    IF v_trade_id IS NOT NULL THEN
      UPDATE signals SET trade_id = v_trade_id WHERE id = v_signal_id;
    END IF;

    v_result := jsonb_build_object('action', 'trade_closed', 'trade_id', v_trade_id, 'signal_id', v_signal_id);

  END IF;

  RETURN v_result;
END;
$$;
