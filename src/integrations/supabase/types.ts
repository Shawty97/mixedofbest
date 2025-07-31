export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agent_calls: {
        Row: {
          agent_id: string | null
          duration: number | null
          ended_at: string | null
          id: string
          metadata: Json | null
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          duration?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          duration?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_calls_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_instances: {
        Row: {
          api_key: string | null
          created_at: string
          deployment_status: string
          endpoint_url: string | null
          environment: string
          id: string
          last_activity: string | null
          metrics: Json
          name: string
          runtime_config: Json
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          deployment_status?: string
          endpoint_url?: string | null
          environment?: string
          id?: string
          last_activity?: string | null
          metrics?: Json
          name: string
          runtime_config?: Json
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string | null
          created_at?: string
          deployment_status?: string
          endpoint_url?: string | null
          environment?: string
          id?: string
          last_activity?: string | null
          metrics?: Json
          name?: string
          runtime_config?: Json
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "agent_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_sessions: {
        Row: {
          cost: number | null
          duration: number | null
          ended_at: string | null
          id: string
          instance_id: string | null
          metadata: Json
          session_type: string
          started_at: string
          status: string
          tokens_used: number | null
          transcript: Json
          user_id: string | null
        }
        Insert: {
          cost?: number | null
          duration?: number | null
          ended_at?: string | null
          id?: string
          instance_id?: string | null
          metadata?: Json
          session_type?: string
          started_at?: string
          status?: string
          tokens_used?: number | null
          transcript?: Json
          user_id?: string | null
        }
        Update: {
          cost?: number | null
          duration?: number | null
          ended_at?: string | null
          id?: string
          instance_id?: string | null
          metadata?: Json
          session_type?: string
          started_at?: string
          status?: string
          tokens_used?: number | null
          transcript?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_sessions_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "agent_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_templates: {
        Row: {
          capabilities: Json
          category: string
          created_at: string
          data_sources: Json
          deployment_config: Json
          description: string | null
          id: string
          is_public: boolean
          metadata: Json
          name: string
          price: number | null
          schema_definition: Json
          status: string
          template_type: string
          tools: Json
          updated_at: string
          user_id: string
          version: string
        }
        Insert: {
          capabilities?: Json
          category?: string
          created_at?: string
          data_sources?: Json
          deployment_config?: Json
          description?: string | null
          id?: string
          is_public?: boolean
          metadata?: Json
          name: string
          price?: number | null
          schema_definition: Json
          status?: string
          template_type?: string
          tools?: Json
          updated_at?: string
          user_id: string
          version?: string
        }
        Update: {
          capabilities?: Json
          category?: string
          created_at?: string
          data_sources?: Json
          deployment_config?: Json
          description?: string | null
          id?: string
          is_public?: boolean
          metadata?: Json
          name?: string
          price?: number | null
          schema_definition?: Json
          status?: string
          template_type?: string
          tools?: Json
          updated_at?: string
          user_id?: string
          version?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          capabilities: Json | null
          created_at: string | null
          description: string | null
          id: string
          instructions: string | null
          metadata: Json | null
          name: string
          status: string | null
          stt_provider: string | null
          tts_provider: string | null
          updated_at: string | null
          user_id: string
          voice_id: string | null
          voice_provider: string | null
          webhook_url: string | null
        }
        Insert: {
          capabilities?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          instructions?: string | null
          metadata?: Json | null
          name: string
          status?: string | null
          stt_provider?: string | null
          tts_provider?: string | null
          updated_at?: string | null
          user_id: string
          voice_id?: string | null
          voice_provider?: string | null
          webhook_url?: string | null
        }
        Update: {
          capabilities?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          instructions?: string | null
          metadata?: Json | null
          name?: string
          status?: string | null
          stt_provider?: string | null
          tts_provider?: string | null
          updated_at?: string | null
          user_id?: string
          voice_id?: string | null
          voice_provider?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      capabilities: {
        Row: {
          category: string
          configuration_schema: Json
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_premium: boolean
          is_system: boolean
          name: string
          provider: string | null
          schema_definition: Json
          version: string
        }
        Insert: {
          category: string
          configuration_schema?: Json
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_premium?: boolean
          is_system?: boolean
          name: string
          provider?: string | null
          schema_definition: Json
          version?: string
        }
        Update: {
          category?: string
          configuration_schema?: Json
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_premium?: boolean
          is_system?: boolean
          name?: string
          provider?: string | null
          schema_definition?: Json
          version?: string
        }
        Relationships: []
      }
      knowledge_chunks: {
        Row: {
          content: string
          created_at: string | null
          document_id: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          position: number
        }
        Insert: {
          content: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          position: number
        }
        Update: {
          content?: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_documents: {
        Row: {
          content: string
          content_type: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          content_type?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          content_type?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          category: string
          created_at: string
          demo_url: string | null
          description: string
          documentation: string | null
          downloads: number | null
          featured: boolean
          id: string
          price: number
          rating: number | null
          seller_id: string
          status: string
          tags: Json
          template_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          demo_url?: string | null
          description: string
          documentation?: string | null
          downloads?: number | null
          featured?: boolean
          id?: string
          price?: number
          rating?: number | null
          seller_id: string
          status?: string
          tags?: Json
          template_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          demo_url?: string | null
          description?: string
          documentation?: string | null
          downloads?: number | null
          featured?: boolean
          id?: string
          price?: number
          rating?: number | null
          seller_id?: string
          status?: string
          tags?: Json
          template_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "agent_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      quantum_jobs: {
        Row: {
          completed_at: string | null
          cost: number | null
          created_at: string
          error_message: string | null
          id: string
          input_data: Json
          instance_id: string | null
          job_id: string
          job_type: string
          provider: string
          result_data: Json | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data: Json
          instance_id?: string | null
          job_id: string
          job_type: string
          provider: string
          result_data?: Json | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json
          instance_id?: string | null
          job_id?: string
          job_type?: string
          provider?: string
          result_data?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "quantum_jobs_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "agent_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          category: string
          configuration_schema: Json
          created_at: string
          description: string | null
          display_name: string
          id: string
          implementation_code: string | null
          is_system: boolean
          name: string
          schema_definition: Json
          version: string
        }
        Insert: {
          category: string
          configuration_schema?: Json
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          implementation_code?: string | null
          is_system?: boolean
          name: string
          schema_definition: Json
          version?: string
        }
        Update: {
          category?: string
          configuration_schema?: Json
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          implementation_code?: string | null
          is_system?: boolean
          name?: string
          schema_definition?: Json
          version?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_chunks: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
          filter_user_id?: string
        }
        Returns: {
          id: string
          document_id: string
          content: string
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
