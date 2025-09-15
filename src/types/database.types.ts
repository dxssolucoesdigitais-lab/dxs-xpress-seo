export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          project_name: string
          product_link: string
          target_country: string
          extracted_data: Json | null
          current_step: number
          status: 'in_progress' | 'completed' | 'paused' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          project_name: string
          product_link: string
          target_country: string
        }
        Update: Partial<this['Insert'] & { status: 'in_progress' | 'completed' | 'paused' | 'error', current_step: number }>
      }
      step_results: {
        Row: {
          id: string
          project_id: string
          step_number: number
          step_name: string
          llm_output: Json
          user_selection: Json | null
          approved: boolean
          created_at: string
        }
        Insert: {
          project_id: string
          step_number: number
          step_name: string
          llm_output: Json
        }
        Update: Partial<this['Insert'] & { user_selection: Json, approved: boolean }>
      }
      // Add other tables if needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Project = Database['public']['Tables']['projects']['Row'];
export type NewProject = Database['public']['Tables']['projects']['Insert'];