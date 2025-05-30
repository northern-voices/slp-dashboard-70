
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
      students: {
        Row: {
          id: string
          first_name: string
          last_name: string
          date_of_birth: string
          grade: string | null
          gender: "male" | "female" | "other" | "prefer_not_to_say" | null
          student_id: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          notes: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          date_of_birth: string
          grade?: string | null
          gender?: "male" | "female" | "other" | "prefer_not_to_say" | null
          student_id: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          notes?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          grade?: string | null
          gender?: "male" | "female" | "other" | "prefer_not_to_say" | null
          student_id?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          notes?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      screenings: {
        Row: {
          id: string
          student_id: string
          type: "speech" | "hearing" | "progress"
          status: "scheduled" | "in_progress" | "completed" | "cancelled"
          notes: string | null
          recommendations: string | null
          follow_up_required: boolean
          follow_up_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          type: "speech" | "hearing" | "progress"
          status?: "scheduled" | "in_progress" | "completed" | "cancelled"
          notes?: string | null
          recommendations?: string | null
          follow_up_required?: boolean
          follow_up_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          type?: "speech" | "hearing" | "progress"
          status?: "scheduled" | "in_progress" | "completed" | "cancelled"
          notes?: string | null
          recommendations?: string | null
          follow_up_required?: boolean
          follow_up_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          screening_id: string
          title: string
          content: string
          recommendations: string | null
          follow_up_required: boolean
          follow_up_date: string | null
          status: "draft" | "final" | "reviewed"
          generated_at: string
        }
        Insert: {
          id?: string
          screening_id: string
          title: string
          content: string
          recommendations?: string | null
          follow_up_required?: boolean
          follow_up_date?: string | null
          status?: "draft" | "final" | "reviewed"
          generated_at?: string
        }
        Update: {
          id?: string
          screening_id?: string
          title?: string
          content?: string
          recommendations?: string | null
          follow_up_required?: boolean
          follow_up_date?: string | null
          status?: "draft" | "final" | "reviewed"
          generated_at?: string
        }
      }
    }
  }
}
