// Supabase MCP generate_typescript_types 출력에서 Database 타입만 옮겼다. 스키마를 바꾸면 다시 생성한다.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Rel = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      daily_fortunes: {
        Row: {
          body: string;
          created_at: string;
          day_gan: string;
          day_ganzhi: string;
          fortune_date: string;
          summary: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          day_gan: string;
          day_ganzhi: string;
          fortune_date: string;
          summary: string;
        };
        Update: Partial<Database["public"]["Tables"]["daily_fortunes"]["Insert"]>;
        Relationships: [];
      };
      daily_subscribers: {
        Row: {
          active: boolean;
          created_at: string;
          day_gan: string;
          id: string;
          last_sent_on: string | null;
          phone: string;
          unsubscribe_token: string;
          verified_at: string | null;
          verify_attempts: number;
          verify_code_hash: string | null;
          verify_expires_at: string | null;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          day_gan: string;
          id?: string;
          last_sent_on?: string | null;
          phone: string;
          unsubscribe_token?: string;
          verified_at?: string | null;
          verify_attempts?: number;
          verify_code_hash?: string | null;
          verify_expires_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["daily_subscribers"]["Insert"]>;
        Relationships: [];
      };
      followups: {
        Row: {
          ai_result: string | null;
          ai_started_at: string | null;
          ai_status: string;
          created_at: string;
          id: string;
          paid_at: string | null;
          payment_id: string | null;
          price: number;
          question: string;
          reading_id: string;
          status: string;
        };
        Insert: {
          ai_result?: string | null;
          ai_started_at?: string | null;
          ai_status?: string;
          created_at?: string;
          id?: string;
          paid_at?: string | null;
          payment_id?: string | null;
          price: number;
          question: string;
          reading_id: string;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["followups"]["Insert"]>;
        Relationships: [Rel];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string;
          followup_id: string | null;
          payment_id: string;
          raw: Json | null;
          reading_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          followup_id?: string | null;
          payment_id: string;
          raw?: Json | null;
          reading_id: string;
          status: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [Rel, Rel];
      };
      readings: {
        Row: {
          ai_result: string | null;
          ai_started_at: string | null;
          ai_status: string;
          chart: Json;
          created_at: string;
          id: string;
          input: Json;
          kind: string;
          paid_at: string | null;
          payment_id: string | null;
          price: number;
          share_id: string;
          status: string;
        };
        Insert: {
          ai_result?: string | null;
          ai_started_at?: string | null;
          ai_status?: string;
          chart: Json;
          created_at?: string;
          id?: string;
          input: Json;
          kind: string;
          paid_at?: string | null;
          payment_id?: string | null;
          price: number;
          share_id?: string;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["readings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      claim_ai_generation: { Args: { p_id: string }; Returns: boolean };
      claim_followup_generation: { Args: { p_id: string }; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
