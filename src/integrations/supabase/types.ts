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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      diet_food_consumption: {
        Row: {
          consumed_at: string | null
          consumption_date: string
          created_at: string
          diet_id: string
          diet_meal_food_id: string
          id: string
          is_consumed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          consumed_at?: string | null
          consumption_date: string
          created_at?: string
          diet_id: string
          diet_meal_food_id: string
          id?: string
          is_consumed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          consumed_at?: string | null
          consumption_date?: string
          created_at?: string
          diet_id?: string
          diet_meal_food_id?: string
          id?: string
          is_consumed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diet_food_consumption_diet_id_fkey"
            columns: ["diet_id"]
            isOneToOne: false
            referencedRelation: "diets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diet_food_consumption_diet_meal_food_id_fkey"
            columns: ["diet_meal_food_id"]
            isOneToOne: false
            referencedRelation: "diet_meal_foods"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_meal_foods: {
        Row: {
          carbs: number | null
          created_at: string
          diet_meal_id: string
          fat: number | null
          food_name: string
          id: string
          protein_animal: number | null
          protein_vegetable: number | null
          quantity: string
          updated_at: string
        }
        Insert: {
          carbs?: number | null
          created_at?: string
          diet_meal_id: string
          fat?: number | null
          food_name: string
          id?: string
          protein_animal?: number | null
          protein_vegetable?: number | null
          quantity: string
          updated_at?: string
        }
        Update: {
          carbs?: number | null
          created_at?: string
          diet_meal_id?: string
          fat?: number | null
          food_name?: string
          id?: string
          protein_animal?: number | null
          protein_vegetable?: number | null
          quantity?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diet_meal_foods_diet_meal_id_fkey"
            columns: ["diet_meal_id"]
            isOneToOne: false
            referencedRelation: "diet_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_meals: {
        Row: {
          created_at: string
          diet_id: string
          id: string
          name: string
          order_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          diet_id: string
          id?: string
          name: string
          order_number: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          diet_id?: string
          id?: string
          name?: string
          order_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diet_meals_diet_id_fkey"
            columns: ["diet_id"]
            isOneToOne: false
            referencedRelation: "diets"
            referencedColumns: ["id"]
          },
        ]
      }
      diets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_expired: boolean
          name: string
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_expired?: boolean
          name: string
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_expired?: boolean
          name?: string
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exercise_observations: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          is_completed: boolean
          observations: string | null
          updated_at: string
          week_number: number
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          is_completed?: boolean
          observations?: string | null
          updated_at?: string
          week_number: number
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          is_completed?: boolean
          observations?: string | null
          updated_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "exercise_observations_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_sets: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          reps: number | null
          set_number: number
          updated_at: string
          week_number: number
          weight: number | null
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          reps?: number | null
          set_number: number
          updated_at?: string
          week_number: number
          weight?: number | null
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          reps?: number | null
          set_number?: number
          updated_at?: string
          week_number?: number
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          name: string
          progression_type: string
          reps: string
          rpe: number
          sets: number
          technique: string | null
          technique_description: string | null
          training_day_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          name: string
          progression_type: string
          reps: string
          rpe: number
          sets: number
          technique?: string | null
          technique_description?: string | null
          training_day_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          name?: string
          progression_type?: string
          reps?: string
          rpe?: number
          sets?: number
          technique?: string | null
          technique_description?: string | null
          training_day_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_training_day_id_fkey"
            columns: ["training_day_id"]
            isOneToOne: false
            referencedRelation: "training_days"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      training_days: {
        Row: {
          created_at: string
          day_number: number
          id: string
          name: string
          training_week_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_number: number
          id?: string
          name: string
          training_week_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_number?: number
          id?: string
          name?: string
          training_week_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_days_training_week_id_fkey"
            columns: ["training_week_id"]
            isOneToOne: false
            referencedRelation: "training_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plans: {
        Row: {
          created_at: string
          current_week: number
          description: string | null
          end_date: string | null
          id: string
          is_expired: boolean
          name: string
          start_date: string | null
          total_weeks: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_week?: number
          description?: string | null
          end_date?: string | null
          id?: string
          is_expired?: boolean
          name: string
          start_date?: string | null
          total_weeks: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_week?: number
          description?: string | null
          end_date?: string | null
          id?: string
          is_expired?: boolean
          name?: string
          start_date?: string | null
          total_weeks?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      training_weeks: {
        Row: {
          created_at: string
          id: string
          is_deload: boolean
          training_plan_id: string
          updated_at: string
          week_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_deload?: boolean
          training_plan_id: string
          updated_at?: string
          week_number: number
        }
        Update: {
          created_at?: string
          id?: string
          is_deload?: boolean
          training_plan_id?: string
          updated_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_weeks_training_plan_id_fkey"
            columns: ["training_plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      mark_password_changed: {
        Args: { user_id: string }
        Returns: undefined
      }
      user_needs_password_change: {
        Args: { user_id: string }
        Returns: boolean
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
