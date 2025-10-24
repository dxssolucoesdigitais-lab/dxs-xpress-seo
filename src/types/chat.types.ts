import { ReactNode } from 'react';

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
  type: 'options' | 'progress' | 'text' | 'error';
  data: string | LlmOption[] | WorkflowProgress | { title: string; message: string };
}

export interface ChatMessage {
  id: string;
  author: 'user' | 'ai';
  createdAt: string;
  content: ReactNode; // Pode ser string ou um objeto ReactNode (para componentes)
  rawContent?: string; // Para armazenar a string JSON original se for estruturado
}