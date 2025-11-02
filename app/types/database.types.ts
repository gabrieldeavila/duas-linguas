export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      book_categories: {
        Row: {
          book_id: string
          category_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          book_id: string
          category_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          book_id?: string
          category_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_categories_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_categories_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "vw_book_categories"
            referencedColumns: ["book_id"]
          },
          {
            foreignKeyName: "book_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vw_book_categories"
            referencedColumns: ["category_id"]
          },
        ]
      }
      book_focus: {
        Row: {
          book_id: string
          chapter_id: string | null
          excerpt_id: string | null
          num_quiz_taken: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          book_id: string
          chapter_id?: string | null
          excerpt_id?: string | null
          num_quiz_taken?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          book_id?: string
          chapter_id?: string | null
          excerpt_id?: string | null
          num_quiz_taken?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_focus_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_focus_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "vw_book_categories"
            referencedColumns: ["book_id"]
          },
          {
            foreignKeyName: "book_focus_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_focus_excerpt_id_fkey"
            columns: ["excerpt_id"]
            isOneToOne: false
            referencedRelation: "excerpts"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string
          chapter_end: number
          chapter_start: number
          cover_image_url: string | null
          created_at: string | null
          description: string
          difficulty_level: Database["public"]["Enums"]["difficulty_level"]
          embedding: string | null
          end_chapter: number | null
          error_message: string | null
          id: string
          language: Database["public"]["Enums"]["language"]
          published_date: string | null
          start_chapter: number | null
          status: Database["public"]["Enums"]["status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          author: string
          chapter_end?: number
          chapter_start?: number
          cover_image_url?: string | null
          created_at?: string | null
          description: string
          difficulty_level: Database["public"]["Enums"]["difficulty_level"]
          embedding?: string | null
          end_chapter?: number | null
          error_message?: string | null
          id?: string
          language: Database["public"]["Enums"]["language"]
          published_date?: string | null
          start_chapter?: number | null
          status?: Database["public"]["Enums"]["status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string
          chapter_end?: number
          chapter_start?: number
          cover_image_url?: string | null
          created_at?: string | null
          description?: string
          difficulty_level?: Database["public"]["Enums"]["difficulty_level"]
          embedding?: string | null
          end_chapter?: number | null
          error_message?: string | null
          id?: string
          language?: Database["public"]["Enums"]["language"]
          published_date?: string | null
          start_chapter?: number | null
          status?: Database["public"]["Enums"]["status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          created_at: string | null
          description: string | null
          id: string
          language: Database["public"]["Enums"]["language"]
          name: string
          updated_at: string | null
        }
        Insert: {
          color: string
          created_at?: string | null
          description?: string | null
          id?: string
          language: Database["public"]["Enums"]["language"]
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string | null
          id?: string
          language?: Database["public"]["Enums"]["language"]
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chapters: {
        Row: {
          book_id: string
          created_at: string | null
          description: string | null
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          embedding: string | null
          error_message: string | null
          id: string
          language: Database["public"]["Enums"]["language"] | null
          number: number | null
          status: Database["public"]["Enums"]["status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          book_id: string
          created_at?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          embedding?: string | null
          error_message?: string | null
          id?: string
          language?: Database["public"]["Enums"]["language"] | null
          number?: number | null
          status?: Database["public"]["Enums"]["status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          book_id?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          embedding?: string | null
          error_message?: string | null
          id?: string
          language?: Database["public"]["Enums"]["language"] | null
          number?: number | null
          status?: Database["public"]["Enums"]["status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "vw_book_categories"
            referencedColumns: ["book_id"]
          },
        ]
      }
      excerpts: {
        Row: {
          book_id: string | null
          chapter_id: string
          content: string
          created_at: string | null
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          id: string
          language: Database["public"]["Enums"]["language"] | null
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          book_id?: string | null
          chapter_id: string
          content: string
          created_at?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          id?: string
          language?: Database["public"]["Enums"]["language"] | null
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          book_id?: string | null
          chapter_id?: string
          content?: string
          created_at?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          id?: string
          language?: Database["public"]["Enums"]["language"] | null
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "excerpts_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "excerpts_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "vw_book_categories"
            referencedColumns: ["book_id"]
          },
          {
            foreignKeyName: "excerpts_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_categories: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vw_book_categories"
            referencedColumns: ["category_id"]
          },
        ]
      }
      preferences: {
        Row: {
          created_at: string | null
          did_setup: boolean | null
          embedding: string | null
          id: string
          language_learning: Database["public"]["Enums"]["language"] | null
          language_level: Database["public"]["Enums"]["difficulty_level"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          did_setup?: boolean | null
          embedding?: string | null
          id?: string
          language_learning?: Database["public"]["Enums"]["language"] | null
          language_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          did_setup?: boolean | null
          embedding?: string | null
          id?: string
          language_learning?: Database["public"]["Enums"]["language"] | null
          language_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer: string
          book_id: string | null
          chapter_id: string
          created_at: string | null
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          explanation: string | null
          id: string
          language: Database["public"]["Enums"]["language"] | null
          options: Json
          question: string
          updated_at: string | null
          why: string | null
        }
        Insert: {
          answer: string
          book_id?: string | null
          chapter_id: string
          created_at?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          explanation?: string | null
          id?: string
          language?: Database["public"]["Enums"]["language"] | null
          options: Json
          question: string
          updated_at?: string | null
          why?: string | null
        }
        Update: {
          answer?: string
          book_id?: string | null
          chapter_id?: string
          created_at?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          explanation?: string | null
          id?: string
          language?: Database["public"]["Enums"]["language"] | null
          options?: Json
          question?: string
          updated_at?: string | null
          why?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "vw_book_categories"
            referencedColumns: ["book_id"]
          },
          {
            foreignKeyName: "questions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          attempt_number: number | null
          book_id: string
          chapter_id: string
          correct_answers: number
          created_at: string | null
          id: string
          passed: boolean
          score_percentage: number
          total_questions: number
          user_id: string
        }
        Insert: {
          attempt_number?: number | null
          book_id: string
          chapter_id: string
          correct_answers: number
          created_at?: string | null
          id?: string
          passed: boolean
          score_percentage: number
          total_questions: number
          user_id?: string
        }
        Update: {
          attempt_number?: number | null
          book_id?: string
          chapter_id?: string
          correct_answers?: number
          created_at?: string | null
          id?: string
          passed?: boolean
          score_percentage?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_results_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "vw_book_categories"
            referencedColumns: ["book_id"]
          },
          {
            foreignKeyName: "quiz_results_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          id?: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          id?: number
          permission?: Database["public"]["Enums"]["app_permission"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      user_contributions: {
        Row: {
          book_id: string | null
          chapter_id: string | null
          contribution_type: string
          created_at: string | null
          id: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          book_id?: string | null
          chapter_id?: string | null
          contribution_type: string
          created_at?: string | null
          id?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          book_id?: string | null
          chapter_id?: string | null
          contribution_type?: string
          created_at?: string | null
          id?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_contributions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_contributions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "vw_book_categories"
            referencedColumns: ["book_id"]
          },
          {
            foreignKeyName: "user_contributions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_levels: {
        Row: {
          current_streak: number
          last_activity_date: string | null
          level: number
          longest_streak: number
          updated_at: string | null
          user_id: string
          xp: number
        }
        Insert: {
          current_streak?: number
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          updated_at?: string | null
          user_id: string
          xp?: number
        }
        Update: {
          current_streak?: number
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          updated_at?: string | null
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: number
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      vw_book_categories: {
        Row: {
          book_id: string | null
          book_title: string | null
          category_id: string | null
          category_name: string | null
          created_at: string | null
          id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      anon_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      authorize: {
        Args: {
          requested_permission: Database["public"]["Enums"]["app_permission"]
        }
        Returns: boolean
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      custom_access_token_hook: {
        Args: { event: Json }
        Returns: Json
      }
      get_quiz_questions: {
        Args: { p_book_id: string; p_chapter_id: string }
        Returns: {
          id: string
          options: Json
          question: string
        }[]
      }
      get_quiz_stats: {
        Args: { p_end_date: string; p_start_date: string; p_timezone: string }
        Returns: {
          day: string
          total_quizzes_taken: number
        }[]
      }
      get_recommendations: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          author: string
          cover_image_url: string
          description: string
          difficulty_level: Database["public"]["Enums"]["difficulty_level"]
          id: string
          title: string
        }[]
      }
      get_unfavorited_categories: {
        Args: {
          p_language?: Database["public"]["Enums"]["language"]
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          color: string
          created_at: string | null
          description: string | null
          id: string
          language: Database["public"]["Enums"]["language"]
          name: string
          updated_at: string | null
        }[]
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
      internal_secret_key: {
        Args: Record<PropertyKey, never>
        Returns: string
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
        Returns: string
      }
      match_book_suggestions: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string
          cover_image_url: string
          description: string
          id: string
          similarity: number
          title: string
        }[]
      }
      match_table_embeddings: {
        Args:
          | {
              embedding: string
              lang: Database["public"]["Enums"]["language"]
              table_name: string
            }
          | { embedding: string; lang: string; table_name: string }
        Returns: {
          id: string
          similarity: number
        }[]
      }
      set_book_focus: {
        Args: {
          p_book_id: string
          p_chapter_number?: number
          p_excerpt_id?: string
        }
        Returns: undefined
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
      submit_quiz_answers: {
        Args: { p_answers: Json; p_book_id: string; p_chapter_id: string }
        Returns: {
          attempt_number: number
          correct_answers: number
          current_streak: number
          did_finish_book: boolean
          did_level_up: boolean
          explanation: Json
          longest_streak: number
          new_level: number
          passed: boolean
          score_percentage: number
          total_questions: number
          total_xp: number
          xp_earned: number
        }[]
      }
      supabase_url: {
        Args: Record<PropertyKey, never>
        Returns: string
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
      app_permission: "editor.manage"
      app_role: "admin"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      language: "en" | "es" | "pt"
      status: "preparing" | "processing" | "done" | "error"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_permission: ["editor.manage"],
      app_role: ["admin"],
      difficulty_level: ["beginner", "intermediate", "advanced"],
      language: ["en", "es", "pt"],
      status: ["preparing", "processing", "done", "error"],
    },
  },
} as const

