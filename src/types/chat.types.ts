import { ReactNode } from 'react';
import { FileMetadata } from './database.types'; // Importar FileMetadata

// Define tipos para o conteúdo estruturado que pode vir na chat_message
export interface LlmOption {
  number: number;
  content: string;
  charCount?: number;
}

export interface WorkflowProgress {
  completed: string[];
  in_progress: string;
    upcoming: string[];
}

export interface StructuredChatContent {
  type: 'options' | 'progress' | 'text' | 'error' | 'structured_response';
  data?: string | LlmOption[] | WorkflowProgress | { title: string; message: string };
  messages?: { type: 'text' | 'options' | 'progress' | 'error'; data: any }[]; // Adicionado para structured_response
}

export interface ChatMessage {
  id: string;
  author: 'user' | 'ai';
  createdAt: string;
  content: ReactNode; // Pode ser string ou um objeto ReactNode (para componentes)
  rawContent: string; // Para armazenar a string JSON original se for estruturado, sempre uma string
  metadata?: { // Adicionada a propriedade metadata
    current_step?: number;
    file?: FileMetadata; // Para um único arquivo
    files?: FileMetadata[]; // Para múltiplos arquivos
    gscAnalysis?: boolean;
  };
}