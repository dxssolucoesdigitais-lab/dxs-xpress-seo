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
          project_name: string // Agora é fornecido diretamente
          product_link: string
          target_country: string
          target_audience: string
        }
        Update: Partial<this['Insert'] & { status: 'in_progress' | 'completed' | 'paused' | 'error', current_step: number }>
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
      chat_messages: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          author: string;
          content: string;
          created_at: string;
          metadata: Json | null; // Adicionada a coluna metadata
        };
        Insert: {
          project_id: string;
          user_id: string;
          author: string;
          content: string;
          metadata?: Json | null; // Adicionada a coluna metadata
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
export type Feedback = Database['public']['Tables']['feedbacks']['Row'];
export type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];

// Nova interface para metadados de arquivo
export interface FileMetadata {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: string; // Alterado para string para armazenar o formato formatado
}