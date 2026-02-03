export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      hearing_screenings: {
        Row: {
          clinical_notes: string | null
          created_at: string | null
          grade_id: string
          id: string
          left_compliance: number | null
          left_ear_compliance_result: string | null
          left_ear_pressure_result: string | null
          left_ear_result: string | null
          left_ear_volume_result: string | null
          left_pressure: number | null
          left_volume_db: number | null
          referral_notes: string | null
          result:
            | Database["public"]["Enums"]["hearing_screening_note_type"]
            | null
          right_compliance: number | null
          right_ear_compliance_result: string | null
          right_ear_pressure_result: string | null
          right_ear_result: string | null
          right_ear_volume_result: string | null
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
          left_ear_compliance_result?: string | null
          left_ear_pressure_result?: string | null
          left_ear_result?: string | null
          left_ear_volume_result?: string | null
          left_pressure?: number | null
          left_volume_db?: number | null
          referral_notes?: string | null
          result?:
            | Database["public"]["Enums"]["hearing_screening_note_type"]
            | null
          right_compliance?: number | null
          right_ear_compliance_result?: string | null
          right_ear_pressure_result?: string | null
          right_ear_result?: string | null
          right_ear_volume_result?: string | null
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
          left_ear_compliance_result?: string | null
          left_ear_pressure_result?: string | null
          left_ear_result?: string | null
          left_ear_volume_result?: string | null
          left_pressure?: number | null
          left_volume_db?: number | null
          referral_notes?: string | null
          result?:
            | Database["public"]["Enums"]["hearing_screening_note_type"]
            | null
          right_compliance?: number | null
          right_ear_compliance_result?: string | null
          right_ear_pressure_result?: string | null
          right_ear_result?: string | null
          right_ear_volume_result?: string | null
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
      monthly_meeting_student_updates: {
        Row: {
          created_at: string | null
          id: string
          meeting_notes: string | null
          monthly_meeting_id: string
          sessions_attended: number | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          meeting_notes?: string | null
          monthly_meeting_id: string
          sessions_attended?: number | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          meeting_notes?: string | null
          monthly_meeting_id?: string
          sessions_attended?: number | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_meeting_student_updates_meeting_fkey"
            columns: ["monthly_meeting_id"]
            isOneToOne: false
            referencedRelation: "monthly_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_meeting_student_updates_student_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_meetings: {
        Row: {
          action_plan: string | null
          additional_notes: string | null
          attendees: string[]
          created_at: string | null
          facilitator_id: string | null
          id: string
          meeting_date: string
          meeting_title: string
          school_id: string | null
          updated_at: string | null
        }
        Insert: {
          action_plan?: string | null
          additional_notes?: string | null
          attendees: string[]
          created_at?: string | null
          facilitator_id?: string | null
          id?: string
          meeting_date: string
          meeting_title: string
          school_id?: string | null
          updated_at?: string | null
        }
        Update: {
          action_plan?: string | null
          additional_notes?: string | null
          attendees?: string[]
          created_at?: string | null
          facilitator_id?: string | null
          id?: string
          meeting_date?: string
          meeting_title?: string
          school_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_meetings_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_meetings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
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
            foreignKeyName: "reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      school_activities: {
        Row: {
          activity_date: string
          activity_type: Database["public"]["Enums"]["activity_type_enum"]
          created_at: string | null
          created_by: string
          id: string
          notes: string | null
          school_id: string
          updated_at: string | null
        }
        Insert: {
          activity_date: string
          activity_type: Database["public"]["Enums"]["activity_type_enum"]
          created_at?: string | null
          created_by: string
          id?: string
          notes?: string | null
          school_id: string
          updated_at?: string | null
        }
        Update: {
          activity_date?: string
          activity_type?: Database["public"]["Enums"]["activity_type_enum"]
          created_at?: string | null
          created_by?: string
          id?: string
          notes?: string | null
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_activities_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
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
      school_staff: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          phone: string | null
          roles: Json
          school_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          phone?: string | null
          roles?: Json
          school_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          phone?: string | null
          roles?: Json
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_staff_school_id_fkey"
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
          primary_slp_id: string | null
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
          primary_slp_id?: string | null
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
          primary_slp_id?: string | null
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
          {
            foreignKeyName: "schools_primary_slp_id_fkey"
            columns: ["primary_slp_id"]
            isOneToOne: false
            referencedRelation: "users"
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
          screening_type:
            | Database["public"]["Enums"]["screening_type_enum"]
            | null
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
          screening_type?:
            | Database["public"]["Enums"]["screening_type_enum"]
            | null
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
          screening_type?:
            | Database["public"]["Enums"]["screening_type_enum"]
            | null
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
      student_notes: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          note_text: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          note_text: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          note_text?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_transfers: {
        Row: {
          created_at: string | null
          from_grade_id: string | null
          from_school_id: string
          id: string
          reason: string | null
          student_id: string
          to_grade_id: string | null
          to_school_id: string
          transfer_date: string
          transferred_by: string
        }
        Insert: {
          created_at?: string | null
          from_grade_id?: string | null
          from_school_id: string
          id?: string
          reason?: string | null
          student_id: string
          to_grade_id?: string | null
          to_school_id: string
          transfer_date?: string
          transferred_by: string
        }
        Update: {
          created_at?: string | null
          from_grade_id?: string | null
          from_school_id?: string
          id?: string
          reason?: string | null
          student_id?: string
          to_grade_id?: string | null
          to_school_id?: string
          transfer_date?: string
          transferred_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_transfers_from_grade_id_fkey"
            columns: ["from_grade_id"]
            isOneToOne: false
            referencedRelation: "school_grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_transfers_from_school_id_fkey"
            columns: ["from_school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_transfers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_transfers_to_grade_id_fkey"
            columns: ["to_grade_id"]
            isOneToOne: false
            referencedRelation: "school_grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_transfers_to_school_id_fkey"
            columns: ["to_school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_transfers_transferred_by_fkey"
            columns: ["transferred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string | null
          current_grade_id: string | null
          date_of_birth: string | null
          first_name: string
          id: string
          last_name: string
          program_status:
            | Database["public"]["Enums"]["speech_program_status"]
            | null
          qualifies_for_program: boolean | null
          school_id: string
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_grade_id?: string | null
          date_of_birth?: string | null
          first_name: string
          id?: string
          last_name: string
          program_status?:
            | Database["public"]["Enums"]["speech_program_status"]
            | null
          qualifies_for_program?: boolean | null
          school_id: string
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_grade_id?: string | null
          date_of_birth?: string | null
          first_name?: string
          id?: string
          last_name?: string
          program_status?:
            | Database["public"]["Enums"]["speech_program_status"]
            | null
          qualifies_for_program?: boolean | null
          school_id?: string
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_current_grade_id_fkey"
            columns: ["current_grade_id"]
            isOneToOne: false
            referencedRelation: "school_grades"
            referencedColumns: ["id"]
          },
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
          is_email_verified: boolean | null
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
          is_email_verified?: boolean | null
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
          is_email_verified?: boolean | null
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
      calculate_ear_compliance_result: {
        Args: { compliance_val: number; notes_val: string }
        Returns: string
      }
      calculate_ear_pressure_result: {
        Args: { notes_val: string; pressure_val: number }
        Returns: string
      }
      calculate_ear_result: {
        Args: {
          compliance_result: string
          notes_val: string
          pressure_result: string
          volume_result: string
        }
        Returns: string
      }
      calculate_ear_volume_result: {
        Args: {
          grade_level_val: string
          notes_val: string
          volume_db_val: number
        }
        Returns: string
      }
      check_email_exists: { Args: { user_email: string }; Returns: boolean }
      check_email_exists_in_auth: {
        Args: { user_email: string }
        Returns: boolean
      }
      find_grade_id: {
        Args: {
          academic_year?: string
          grade_level: string
          school_name: string
        }
        Returns: string
      }
      find_grade_id_corrected: {
        Args: {
          academic_year?: string
          grade_level: string
          school_name: string
        }
        Returns: string
      }
      find_screener_id: { Args: { email_addr: string }; Returns: string }
      find_screener_id_corrected: {
        Args: { email_addr: string }
        Returns: string
      }
      find_student_id: {
        Args: { fname: string; lname: string; school_name: string }
        Returns: string
      }
      find_student_id_corrected: {
        Args: { fname: string; lname: string; school_name: string }
        Returns: string
      }
      get_hearing_screenings_by_school: {
        Args: { school_uuid: string }
        Returns: {
          academic_year: string
          clinical_notes: string
          created_at: string
          grade_id: string
          grade_level: string
          id: string
          left_compliance: number
          left_ear_compliance_result: string
          left_ear_pressure_result: string
          left_ear_result: string
          left_ear_volume_result: string
          left_pressure: number
          left_volume_db: number
          referral_notes: string
          result: string
          right_compliance: number
          right_ear_compliance_result: string
          right_ear_pressure_result: string
          right_ear_result: string
          right_ear_volume_result: string
          right_pressure: number
          right_volume_db: number
          screener_first_name: string
          screener_id: string
          screener_last_name: string
          student_first_name: string
          student_id: string
          student_identifier: string
          student_last_name: string
          updated_at: string
        }[]
      }
      get_school_summary_counts: {
        Args: { p_academic_year: string; p_school_id: string }
        Returns: {
          qualified_students: number
          school_name: string
          students_with_notes: number
          total_students: number
        }[]
      }
      get_speech_screenings_by_school: {
        Args: { target_school_id: string }
        Returns: {
          academic_year: string
          clinical_notes: string
          created_at: string
          error_patterns: Json
          grade_level: string
          referral_notes: string
          screener_first_name: string
          screener_last_name: string
          screening_id: string
          screening_result: string
          screening_type: string
          student_first_name: string
          student_full_name: string
          student_id: string
          student_last_name: string
          suspected_cas: boolean
          updated_at: string
          vocabulary_support: boolean
        }[]
      }
      get_user_organization_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      map_screening_result: {
        Args: { csv_result: string }
        Returns: Database["public"]["Enums"]["speech_screening_result"]
      }
      verify_school_summary_report: {
        Args: { p_academic_year: string; p_school_id: string }
        Returns: {
          clinical_notes: string
          combined_notes: string
          grade_level: string
          has_notes: boolean
          is_qualified: boolean
          referral_notes: string
          result: string
          screening_date: string
          screening_id: string
          student_name: string
        }[]
      }
    }
    Enums: {
      activity_type_enum:
        | "speech_screen"
        | "hearing_screen"
        | "school_visit_training"
        | "school_visit_other"
        | "monthly_meeting"
        | "phone_call"
        | "email"
        | "consult_outside_providers"
      hearing_screening_note:
        | "absent"
        | "non_compliant"
        | "complex_needs"
        | "results_uncertain"
      hearing_screening_note_type:
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
      school_staff_role:
        | "director"
        | "sss_coordinator"
        | "principal"
        | "vice_principal"
        | "inclusive_supports_teacher"
        | "speech_ea"
        | "non_designated_ea"
        | "educator"
        | "ot"
        | "slp_supplemental"
        | "pt"
        | "ed_psych"
        | "jp_liaison"
        | "learning_support_teacher"
      screening_type_enum: "initial" | "progress"
      speech_program_status:
        | "none"
        | "qualified"
        | "sub"
        | "graduated"
        | "paused"
        | "no_consent"
      speech_screening_result:
        | "absent"
        | "passed"
        | "mild_moderate"
        | "severe_profound"
        | "non_registered_no_consent"
        | "complex_needs"
        | "age_appropriate"
        | "monitor"
        | "mild"
        | "moderate"
        | "severe"
        | "profound"
        | "unable_to_screen"
        | "no_errors"
      user_role: "admin" | "slp" | "super_admin" | "hearing_technician"
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
    Enums: {
      activity_type_enum: [
        "speech_screen",
        "hearing_screen",
        "school_visit_training",
        "school_visit_other",
        "monthly_meeting",
        "phone_call",
        "email",
        "consult_outside_providers",
      ],
      hearing_screening_note: [
        "absent",
        "non_compliant",
        "complex_needs",
        "results_uncertain",
      ],
      hearing_screening_note_type: [
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
      school_staff_role: [
        "director",
        "sss_coordinator",
        "principal",
        "vice_principal",
        "inclusive_supports_teacher",
        "speech_ea",
        "non_designated_ea",
        "educator",
        "ot",
        "slp_supplemental",
        "pt",
        "ed_psych",
        "jp_liaison",
        "learning_support_teacher",
      ],
      screening_type_enum: ["initial", "progress"],
      speech_program_status: [
        "none",
        "qualified",
        "sub",
        "graduated",
        "paused",
        "no_consent",
      ],
      speech_screening_result: [
        "absent",
        "passed",
        "mild_moderate",
        "severe_profound",
        "non_registered_no_consent",
        "complex_needs",
        "age_appropriate",
        "monitor",
        "mild",
        "moderate",
        "severe",
        "profound",
        "unable_to_screen",
        "no_errors",
      ],
      user_role: ["admin", "slp", "super_admin", "hearing_technician"],
    },
  },
} as const
