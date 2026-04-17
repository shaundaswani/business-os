-- ============================================================
-- 003_rls_policies.sql
-- Row Level Security policies for all tables
-- ============================================================

-- Helper: get the current user's role from profiles
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Helper: check if current user has access to a business
CREATE OR REPLACE FUNCTION user_has_business_access(p_business_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM business_access
    WHERE user_id = auth.uid() AND business_id = p_business_id
  )
  OR current_user_role() = 'owner';
$$;

-- ============================================================
-- profiles
-- ============================================================
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Owner can read all profiles"
  ON profiles FOR SELECT
  USING (current_user_role() = 'owner');

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Prevent self-escalation: only owner can set role to owner
    AND (role = (SELECT role FROM profiles WHERE id = auth.uid()) OR current_user_role() = 'owner')
  );

-- ============================================================
-- businesses (public read for authenticated users)
-- ============================================================
CREATE POLICY "Authenticated users can read businesses"
  ON businesses FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owner can manage businesses"
  ON businesses FOR ALL
  USING (current_user_role() = 'owner');

-- ============================================================
-- business_access
-- ============================================================
CREATE POLICY "Users can read their own access"
  ON business_access FOR SELECT
  USING (user_id = auth.uid() OR current_user_role() = 'owner');

CREATE POLICY "Owner can manage all access"
  ON business_access FOR ALL
  USING (current_user_role() = 'owner');

-- ============================================================
-- tasks
-- ============================================================
CREATE POLICY "Users can read tasks in their businesses"
  ON tasks FOR SELECT
  USING (
    deleted_at IS NULL
    AND user_has_business_access(business_id)
  );

CREATE POLICY "Contributors and owners can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    user_has_business_access(business_id)
    AND current_user_role() IN ('owner', 'contributor')
  );

CREATE POLICY "Contributors and owners can update tasks"
  ON tasks FOR UPDATE
  USING (
    user_has_business_access(business_id)
    AND current_user_role() IN ('owner', 'contributor')
  );

-- Soft-delete only: set deleted_at, never hard delete
CREATE POLICY "Owner can hard-delete tasks"
  ON tasks FOR DELETE
  USING (current_user_role() = 'owner');

-- ============================================================
-- messages
-- ============================================================
CREATE POLICY "Users can read messages in their businesses"
  ON messages FOR SELECT
  USING (user_has_business_access(business_id));

CREATE POLICY "Contributors and owners can post messages"
  ON messages FOR INSERT
  WITH CHECK (
    user_has_business_access(business_id)
    AND current_user_role() IN ('owner', 'contributor')
    AND author_id = auth.uid()
  );

-- ============================================================
-- documents
-- ============================================================
CREATE POLICY "Users can read documents in their businesses"
  ON documents FOR SELECT
  USING (user_has_business_access(business_id));

CREATE POLICY "Contributors and owners can manage documents"
  ON documents FOR ALL
  USING (
    user_has_business_access(business_id)
    AND current_user_role() IN ('owner', 'contributor')
  );

-- ============================================================
-- goals
-- ============================================================
CREATE POLICY "Users can read goals in their businesses"
  ON goals FOR SELECT
  USING (user_has_business_access(business_id));

CREATE POLICY "Owner can manage goals"
  ON goals FOR ALL
  USING (current_user_role() = 'owner');

-- ============================================================
-- workflows
-- ============================================================
CREATE POLICY "Users can read workflows in their businesses"
  ON workflows FOR SELECT
  USING (user_has_business_access(business_id));

CREATE POLICY "Owner can manage workflows"
  ON workflows FOR ALL
  USING (current_user_role() = 'owner');

-- ============================================================
-- escalation_rules
-- ============================================================
CREATE POLICY "Owner can manage escalation rules"
  ON escalation_rules FOR ALL
  USING (current_user_role() = 'owner');

-- ============================================================
-- audit_log
-- ============================================================
-- Only owner can read. Inserts happen via DB triggers (service role).
CREATE POLICY "Owner can read audit log"
  ON audit_log FOR SELECT
  USING (current_user_role() = 'owner');

-- No direct insert from authenticated users — only via triggers
-- (service role bypasses RLS for trigger-based inserts)

-- ============================================================
-- biometrics
-- ============================================================
CREATE POLICY "Users can manage their own biometrics"
  ON biometrics FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owner can read all biometrics"
  ON biometrics FOR SELECT
  USING (current_user_role() = 'owner');

-- ============================================================
-- notifications
-- ============================================================
CREATE POLICY "Users can read their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications (mark read)"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- signals (trading)
-- No direct insert from authenticated users — webhook only (service role)
-- ============================================================
CREATE POLICY "Authenticated users can read signals"
  ON signals FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Blocks any direct insert/update from authenticated users
CREATE POLICY "No direct insert on signals"
  ON signals FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update on signals"
  ON signals FOR UPDATE
  USING (false);

-- ============================================================
-- trades (trading)
-- No direct insert/update from authenticated users — webhook only
-- ManualTradeModal uses a separate RPC function
-- ============================================================
CREATE POLICY "Authenticated users can read trades"
  ON trades FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "No direct insert on trades"
  ON trades FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update on trades"
  ON trades FOR UPDATE
  USING (false);
