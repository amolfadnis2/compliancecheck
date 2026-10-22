/**
 * Supabase types for the PF calculator tables — generated with
 * `supabase gen types typescript` against the production project on
 * 2026-10-22 and trimmed to the six tables and one function added by
 * supabase/migrations/20261022000000_pf_calculator.sql. Regenerate rather
 * than hand-edit.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface PfDatabase {
  public: {
    Tables: {
      epf_interest_rates: {
        Row: { cbt_meeting: string | null; decided_on: string | null; fy: string; notified_on: string | null; rate: number; source_url: string | null; status: string }
        Insert: { cbt_meeting?: string | null; decided_on?: string | null; fy: string; notified_on?: string | null; rate: number; source_url?: string | null; status: string }
        Update: { cbt_meeting?: string | null; decided_on?: string | null; fy?: string; notified_on?: string | null; rate?: number; source_url?: string | null; status?: string }
        Relationships: []
      }
      leads: {
        Row: { company: string | null; consent_at: string; consent_text_version: string; created_at: string | null; email: string; id: string; name: string | null; purpose: string | null; source: string; source_session_id: string | null; team_size_band: string | null; withdrawn_at: string | null }
        Insert: { company?: string | null; consent_at: string; consent_text_version: string; created_at?: string | null; email: string; id?: string; name?: string | null; purpose?: string | null; source: string; source_session_id?: string | null; team_size_band?: string | null; withdrawn_at?: string | null }
        Update: { company?: string | null; consent_at?: string; consent_text_version?: string; created_at?: string | null; email?: string; id?: string; name?: string | null; purpose?: string | null; source?: string; source_session_id?: string | null; team_size_band?: string | null; withdrawn_at?: string | null }
        Relationships: [{ foreignKeyName: 'leads_source_session_id_fkey'; columns: ['source_session_id']; isOneToOne: false; referencedRelation: 'pf_calc_sessions'; referencedColumns: ['id'] }]
      }
      pf_calc_saved: {
        Row: { created_at: string | null; id: string; inputs: Json; name: string; user_id: string }
        Insert: { created_at?: string | null; id?: string; inputs: Json; name: string; user_id?: string }
        Update: { created_at?: string | null; id?: string; inputs?: Json; name?: string; user_id?: string }
        Relationships: []
      }
      pf_calc_sessions: {
        Row: { anon_id: string | null; created_at: string | null; engine_version: string | null; expires_at: string | null; id: string; inputs: Json | null; params_version: string | null; results_summary: Json | null; salary_band: string | null; user_id: string | null }
        Insert: { anon_id?: string | null; created_at?: string | null; engine_version?: string | null; expires_at?: string | null; id?: string; inputs?: Json | null; params_version?: string | null; results_summary?: Json | null; salary_band?: string | null; user_id?: string | null }
        Update: { anon_id?: string | null; created_at?: string | null; engine_version?: string | null; expires_at?: string | null; id?: string; inputs?: Json | null; params_version?: string | null; results_summary?: Json | null; salary_band?: string | null; user_id?: string | null }
        Relationships: []
      }
      pf_calc_shares: {
        Row: { created_at: string | null; expires_at: string | null; inputs: Json; slug: string }
        Insert: { created_at?: string | null; expires_at?: string | null; inputs: Json; slug: string }
        Update: { created_at?: string | null; expires_at?: string | null; inputs?: Json; slug?: string }
        Relationships: []
      }
      statutory_params: {
        Row: { effective_from: string; effective_to: string | null; id: string; key: string; notes: string | null; source_name: string; source_ref: string | null; source_url: string | null; status: string; value: Json; verified_at: string }
        Insert: { effective_from: string; effective_to?: string | null; id?: string; key: string; notes?: string | null; source_name: string; source_ref?: string | null; source_url?: string | null; status?: string; value: Json; verified_at?: string }
        Update: { effective_from?: string; effective_to?: string | null; id?: string; key?: string; notes?: string | null; source_name?: string; source_ref?: string | null; source_url?: string | null; status?: string; value?: Json; verified_at?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      get_pf_share: { Args: { p_slug: string }; Returns: Json }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
