// ============================================================
// Supabase database types
// Run `supabase gen types typescript --local > src/lib/supabase/types.ts`
// to regenerate after schema changes.
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'owner' | 'contributor' | 'viewer'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'owner' | 'contributor' | 'viewer'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          role?: 'owner' | 'contributor' | 'viewer'
          avatar_url?: string | null
          updated_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          name: string
          color: string
          icon: string
          description: string | null
          sort_order: number
        }
        Insert: {
          id: string
          name: string
          color: string
          icon: string
          description?: string | null
          sort_order?: number
        }
        Update: {
          name?: string
          color?: string
          icon?: string
          description?: string | null
          sort_order?: number
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          business_id: string
          assignee_id: string | null
          from_id: string | null
          priority: 'urgent' | 'high' | 'normal' | 'low'
          due_date: string | null
          done: boolean
          cognitive_load: number | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          business_id: string
          assignee_id?: string | null
          from_id?: string | null
          priority?: 'urgent' | 'high' | 'normal' | 'low'
          due_date?: string | null
          done?: boolean
          cognitive_load?: number | null
        }
        Update: {
          title?: string
          priority?: 'urgent' | 'high' | 'normal' | 'low'
          due_date?: string | null
          done?: boolean
          cognitive_load?: number | null
          deleted_at?: string | null
        }
      }
      signals: {
        Row: {
          id: string
          asset: string
          direction: 'long' | 'short'
          signal_type: 'entry' | 'warning' | 'exit'
          price: number
          timestamp: string
          raw_payload: Json
          trade_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: never // write-only via SECURITY DEFINER function
        Update: never
      }
      trades: {
        Row: {
          id: string
          asset: string
          direction: 'long' | 'short'
          entry_price: number
          entry_time: string
          partial_exit_price: number | null
          partial_exit_time: string | null
          exit_price: number | null
          exit_time: string | null
          pnl_r: number | null
          status: 'open' | 'partial' | 'closed'
          notes: string | null
          signal_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: never // write-only via SECURITY DEFINER function
        Update: never
      }
      biometrics: {
        Row: {
          id: string
          user_id: string
          date: string
          sleep_hours: number | null
          hrv_ms: number | null
          metabolic_score: number | null
          stress_score: number | null
          recovery_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          sleep_hours?: number | null
          hrv_ms?: number | null
          metabolic_score?: number | null
          stress_score?: number | null
          recovery_score?: number | null
        }
        Update: {
          sleep_hours?: number | null
          hrv_ms?: number | null
          metabolic_score?: number | null
          stress_score?: number | null
          recovery_score?: number | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string | null
          business_id: string | null
          read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body?: string | null
          business_id?: string | null
          read?: boolean
        }
        Update: {
          read?: boolean
          read_at?: string | null
        }
      }
    }
    Functions: {
      process_trading_signal: {
        Args: {
          p_asset: string
          p_direction: string
          p_signal_type: string
          p_price: number
          p_timestamp: string
          p_raw_payload: Json
        }
        Returns: Json
      }
      current_user_role: {
        Args: Record<never, never>
        Returns: string
      }
      user_has_business_access: {
        Args: { p_business_id: string }
        Returns: boolean
      }
    }
  }
}
