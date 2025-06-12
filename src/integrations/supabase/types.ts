export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      hearing_screenings: {
        Row: {
          clinical_notes: string | null
          created_at: string | null
          grade_id: string
          id: string
          left_compliance: number | null
          left_pressure: number | null
          left_volume_db: number | null
          notes: Database["public"]["Enums"]["hearing_screening_note"] | null
          referral_notes: string | null
          right_compliance: number | null
          right_pressure: number | null
          right_volume_db: number | null
          screener_id: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          clinical_notes?: string | null
          created_at?: string | null
          grade_id: string
          id?: string
          left_compliance?: number | null
          left_pressure?: number | null
          left_volume_db?: number | null
          notes?: Database["public"]["Enums"]["hearing_screening_note"] | null
          referral_notes?: string | null
          right_compliance?: number | null
          right_pressure?: number | null
          right_volume_db?: number | null
          screener_id: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          clinical_notes?: string | null
          created_at?: string | null
          grade_id?: string
          id?: string
          left_compliance?: number | null
          left_pressure?: number | null
          left_volume_db?: number | null
          notes?: Database["public"]["Enums"]["hearing_screening_note"] | null
          referral_notes?: string | null
          right_compliance?: number | null
          right_pressure?: number | null
          right_volume_db?: number | null
          screener_id?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hearing_screenings_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "school_grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hearing_screenings_screener_id_fkey"
            columns: ["screener_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hearing_screenings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          file_key: string
          generated_by: string | null
          hearing_screening_id: string | null
          id: string
          is_bulk: boolean | null
          metadata: Json | null
          report_type: Database["public"]["Enums"]["report_type"]
          school_id: string | null
          speech_screening_id: string | null
          student_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_key: string
          generated_by?: string | null
          hearing_screening_id?: string | null
          id?: string
          is_bulk?: boolean | null
          metadata?: Json | null
          report_type: Database["public"]["Enums"]["report_type"]
          school_id?: string | null
          speech_screening_id?: string | null
          student_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_key?: string
          generated_by?: string | null
          hearing_screening_id?: string | null
          id?: string
          is_bulk?: boolean | null
          metadata?: Json | null
          report_type?: Database["public"]["Enums"]["report_type"]
          school_id?: string | null
          speech_screening_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_hearing_screening_id_fkey"
            columns: ["hearing_screening_id"]
            isOneToOne: false
            referencedRelation: "hearing_screenings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_speech_screening_id_fkey"
            columns: ["speech_screening_id"]
            isOneToOne: false
            referencedRelation: "speech_screenings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      school_grades: {
        Row: {
          academic_year: string
          created_at: string | null
          grade_level: string
          id: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          created_at?: string | null
          grade_level: string
          id?: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string | null
          grade_level?: string
          id?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_grades_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          city: string
          country: string
          created_at: string | null
          id: string
          name: string
          organization_id: string
          phone: string | null
          postal_code: string | null
          principal_email: string | null
          principal_name: string | null
          region: string | null
          street_address: string
          street_address_2: string | null
          updated_at: string | null
        }
        Insert: {
          city: string
          country: string
          created_at?: string | null
          id?: string
          name: string
          organization_id: string
          phone?: string | null
          postal_code?: string | null
          principal_email?: string | null
          principal_name?: string | null
          region?: string | null
          street_address: string
          street_address_2?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string
          phone?: string | null
          postal_code?: string | null
          principal_email?: string | null
          principal_name?: string | null
          region?: string | null
          street_address?: string
          street_address_2?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schools_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      speech_screenings: {
        Row: {
          clinical_notes: string | null
          created_at: string | null
          error_patterns: Json | null
          grade_id: string
          id: string
          referral_notes: string | null
          result: Database["public"]["Enums"]["speech_screening_result"] | null
          screener_id: string
          student_id: string
          suspected_cas: boolean | null
          updated_at: string | null
          vocabulary_support: boolean | null
        }
        Insert: {
          clinical_notes?: string | null
          created_at?: string | null
          error_patterns?: Json | null
          grade_id: string
          id?: string
          referral_notes?: string | null
          result?: Database["public"]["Enums"]["speech_screening_result"] | null
          screener_id: string
          student_id: string
          suspected_cas?: boolean | null
          updated_at?: string | null
          vocabulary_support?: boolean | null
        }
        Update: {
          clinical_notes?: string | null
          created_at?: string | null
          error_patterns?: Json | null
          grade_id?: string
          id?: string
          referral_notes?: string | null
          result?: Database["public"]["Enums"]["speech_screening_result"] | null
          screener_id?: string
          student_id?: string
          suspected_cas?: boolean | null
          updated_at?: string | null
          vocabulary_support?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "speech_screenings_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "school_grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "speech_screenings_screener_id_fkey"
            columns: ["screener_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "speech_screenings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string | null
          first_name: string
          id: string
          last_name: string
          qualifies_for_program: boolean | null
          school_id: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name: string
          id?: string
          last_name: string
          qualifies_for_program?: boolean | null
          school_id: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          qualifies_for_program?: boolean | null
          school_id?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          email_verified_at: string | null
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_verified_at?: string | null
          first_name: string
          id: string
          is_active?: boolean | null
          last_name: string
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_verified_at?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_email_exists: {
        Args: { user_email: string }
        Returns: boolean
      }
      get_user_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      hearing_screening_note:
        | "absent"
        | "non_compliant"
        | "complex_needs"
        | "results_uncertain"
      report_type:
        | "speech_screening_report"
        | "bulk_speech_screening_reports"
        | "speech_goals_report"
        | "bulk_speech_goals_reports"
        | "speech_progress_report"
        | "bulk_speech_progress_reports"
        | "hearing_screening_report"
        | "bulk_hearing_screenings_report"
      speech_screening_result:
        | "absent"
        | "passed"
        | "mild_moderate"
        | "severe_profound"
        | "non_registered_no_consent"
        | "complex_needs"
      user_role: "admin" | "slp"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      hearing_screening_note: [
        "absent",
        "non_compliant",
        "complex_needs",
        "results_uncertain",
      ],
      report_type: [
        "speech_screening_report",
        "bulk_speech_screening_reports",
        "speech_goals_report",
        "bulk_speech_goals_reports",
        "speech_progress_report",
        "bulk_speech_progress_reports",
        "hearing_screening_report",
        "bulk_hearing_screenings_report",
      ],
      speech_screening_result: [
        "absent",
        "passed",
        "mild_moderate",
        "severe_profound",
        "non_registered_no_consent",
        "complex_needs",
      ],
      user_role: ["admin", "slp"],
    },
  },
} as const
