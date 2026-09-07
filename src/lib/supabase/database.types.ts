// Keep aligned with supabase/migrations/202609060001_accounts.sql.
// Replace with CLI-generated types when the hosted migration is applied.
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; public_id: string; display_name: string; created_at: string; updated_at: string };
        Insert: { id: string; public_id?: string; display_name?: string; created_at?: string; updated_at?: string };
        Update: { display_name?: string };
        Relationships: [];
      };
      admin_memberships: {
        Row: { user_id: string; created_at: string };
        Insert: { user_id: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
      service_instances: {
        Row: { id: string; customer_id: string; service_slug: string; service_title: string; completed_at: string; verification_note: string | null; verified_by: string; revoked_at: string | null; created_at: string };
        Insert: { id?: string; customer_id: string; service_slug: string; service_title: string; completed_at?: string; verification_note?: string | null; verified_by: string; revoked_at?: string | null; created_at?: string };
        Update: { customer_id?: string; service_slug?: string; service_title?: string; completed_at?: string; verification_note?: string | null; verified_by?: string; revoked_at?: string | null };
        Relationships: [];
      };
      reviews: {
        Row: { id: string; service_instance_id: string; customer_id: string; rating: number; status: 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'hidden'; approved_revision_id: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; service_instance_id: string; customer_id: string; rating?: number; status?: 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'hidden'; approved_revision_id?: string | null; created_at?: string; updated_at?: string };
        Update: { status?: 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'hidden'; approved_revision_id?: string | null; updated_at?: string };
        Relationships: [];
      };
      review_revisions: {
        Row: { id: string; review_id: string; author_id: string; body: string; moderation_status: 'pending' | 'approved' | 'rejected'; moderation_note: string | null; moderated_by: string | null; created_at: string };
        Insert: { id?: string; review_id: string; author_id: string; body: string; moderation_status?: 'pending' | 'approved' | 'rejected'; moderation_note?: string | null; moderated_by?: string | null; created_at?: string };
        Update: { body?: string; moderation_status?: 'pending' | 'approved' | 'rejected'; moderation_note?: string | null; moderated_by?: string | null };
        Relationships: [];
      };
      moderation_events: {
        Row: { id: string; review_id: string; revision_id: string | null; actor_id: string; decision: string; reason: string | null; created_at: string };
        Insert: { id?: string; review_id: string; revision_id?: string | null; actor_id: string; decision: string; reason?: string | null; created_at?: string };
        Update: { reason?: string | null };
        Relationships: [];
      };
    };
    Views: {
      public_review_services: {
        Row: { review_id: string; service_title: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      public_profile_names: {
        Row: { id: string; public_id: string; display_name: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Functions: {
      submit_review: { Args: { instance_id: string; review_body: string; review_rating?: number }; Returns: string };
      moderate_review: { Args: { target_review: string; target_revision: string; decision: string; reason?: string | null }; Returns: undefined };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
