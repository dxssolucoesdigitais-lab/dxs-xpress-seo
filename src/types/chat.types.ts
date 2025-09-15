import { ReactNode } from 'react';
import { StepResult } from './database.types';

export interface ChatMessage {
  id: string;
  author: 'user' | 'ai';
  createdAt: string;
  content?: ReactNode;
  stepResult?: StepResult;
}

export interface LlmOption {
  number: number;
  content: string;
  charCount?: number;
}