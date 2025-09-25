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
      announcements: {
        Row: {
          id: string
          content: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          content: Json
          is_active?: boolean
        }
        Update: Partial<this['Insert']>
      }
      feedbacks: {
        Row: {
          id: string
          user_id: string
          content: string
          created_at: string
          status: 'unread' | 'read' | 'replied'
          admin_response: string | null
          responded_at: string | null
        }
        Insert: {
          user_id: string
          content: string
        }
        Update: Partial<this['Row']>
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          plan_type: string | null
          credits_remaining: number | null
          created_at: string | null
          updated_at: string | null
          role: string | null
          last_seen_ip: string | null
          last_seen_at: string | null
          subscription_expires_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
        }
        Update: Partial<this['Insert'] & { role: string, credits_remaining: number, subscription_expires_at: string | null }>
      }
      projects: {
        Row: {
          id: string
          user_id: string
          project_name: string
          product_link: string
          target_country: string
          target_audience: string | null
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
          target_audience: string
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
      usage_history: {
        Row: {
            id: string;
            user_id: string;
            project_id: string | null;
            action_type: string;
            credits_used: number;
            timestamp: string;
        };
        Insert: {
            user_id: string;
            project_id?: string | null;
            action_type: string;
            credits_used?: number;
        };
        Update: Partial<this['Insert']>;
      }
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

export type User = Database['public']['Tables']['users']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type NewProject = Database['public']['Tables']['projects']['Insert'];
export type StepResult = Database['public']['Tables']['step_results']['Row'];
export type Announcement = Database['public']['Tables']['announcements']['Row'];
export type Feedback = Database['public']['Tables']['feedbacks']['Row'];