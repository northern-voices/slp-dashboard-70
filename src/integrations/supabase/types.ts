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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          content: string
          follow_up_date: string | null
          follow_up_required: boolean
          generated_at: string
          id: string
          recommendations: string | null
          screening_id: string
          status: Database["public"]["Enums"]["report_status"]
          title: string
        }
        Insert: {
          content: string
          follow_up_date?: string | null
          follow_up_required?: boolean
          generated_at?: string
          id?: string
          recommendations?: string | null
          screening_id: string
          status?: Database["public"]["Enums"]["report_status"]
          title: string
        }
        Update: {
          content?: string
          follow_up_date?: string | null
          follow_up_required?: boolean
          generated_at?: string
          id?: string
          recommendations?: string | null
          screening_id?: string
          status?: Database["public"]["Enums"]["report_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_screening_id_fkey"
            columns: ["screening_id"]
            isOneToOne: false
            referencedRelation: "screenings"
            referencedColumns: ["id"]
          },
        ]
      }
      school_assignments: {
        Row: {
          created_at: string
          id: string
          school_id: string
          slp_profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          school_id: string
          slp_profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          school_id?: string
          slp_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_assignments_slp_profile_id_fkey"
            columns: ["slp_profile_id"]
            isOneToOne: false
            referencedRelation: "slp_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          organization_id: string
          phone: string | null
          principal_email: string | null
          principal_name: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          organization_id: string
          phone?: string | null
          principal_email?: string | null
          principal_name?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          phone?: string | null
          principal_email?: string | null
          principal_name?: string | null
          updated_at?: string
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
      screenings: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          screening_date: string
          screening_type: Database["public"]["Enums"]["screening_type"]
          slp_id: string
          status: Database["public"]["Enums"]["screening_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          screening_date: string
          screening_type: Database["public"]["Enums"]["screening_type"]
          slp_id: string
          status?: Database["public"]["Enums"]["screening_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          screening_date?: string
          screening_type?: Database["public"]["Enums"]["screening_type"]
          slp_id?: string
          status?: Database["public"]["Enums"]["screening_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "screenings_slp_id_fkey"
            columns: ["slp_id"]
            isOneToOne: false
            referencedRelation: "slp_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screenings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      slp_profiles: {
        Row: {
          active: boolean
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          license_number: string | null
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          license_number?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          license_number?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slp_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          active: boolean
          created_at: string
          date_of_birth: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          grade: string | null
          id: string
          last_name: string
          notes: string | null
          school_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          date_of_birth: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          grade?: string | null
          id?: string
          last_name: string
          notes?: string | null
          school_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          date_of_birth?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          grade?: string | null
          id?: string
          last_name?: string
          notes?: string | null
          school_id?: string
          student_id?: string
          updated_at?: string
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
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
      [_ in never]: never
    }
    Enums: {
      gender_type: "male" | "female" | "other" | "prefer_not_to_say"
      report_status: "draft" | "final" | "reviewed"
      screening_status: "scheduled" | "in_progress" | "completed" | "cancelled"
      screening_type: "initial" | "follow_up" | "annual" | "referral"
      user_role: "admin" | "supervisor" | "slp"
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
      gender_type: ["male", "female", "other", "prefer_not_to_say"],
      report_status: ["draft", "final", "reviewed"],
      screening_status: ["scheduled", "in_progress", "completed", "cancelled"],
      screening_type: ["initial", "follow_up", "annual", "referral"],
      user_role: ["admin", "supervisor", "slp"],
    },
  },
} as const
