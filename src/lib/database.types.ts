// Supabase MCP generate_typescript_types 출력에서 Database 타입만 옮겼다. 스키마를 바꾸면 다시 생성한다.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      payments: {
        Row: {
          amount: number;
          created_at: string;
          payment_id: string;
          raw: Json | null;
          reading_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          payment_id: string;
          raw?: Json | null;
          reading_id: string;
          status: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          payment_id?: string;
          raw?: Json | null;
          reading_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_reading_id_fkey";
            columns: ["reading_id"];
            isOneToOne: false;
            referencedRelation: "readings";
            referencedColumns: ["id"];
          },
        ];
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
          status?: string;
        };
        Update: {
          ai_result?: string | null;
          ai_started_at?: string | null;
          ai_status?: string;
          chart?: Json;
          created_at?: string;
          id?: string;
          input?: Json;
          kind?: string;
          paid_at?: string | null;
          payment_id?: string | null;
          price?: number;
          status?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      claim_ai_generation: { Args: { p_id: string }; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
