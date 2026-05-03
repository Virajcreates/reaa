export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
  sources?: DocumentSearchResult[]; // For local RAG responses
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface ChatSession {
  sessionId: string;
  chatId?: string; // Tying to database chat
  messages: Message[];
  isLoading: boolean;
}

export interface User {
  name: string;
  sessionId: string;
}

export type Language = 'English' | 'Kannada' | 'Hindi';

export interface N8nChatResponse {
  sessionId?: string;
  message?: string;
  output?: string;
  text?: string;
  [key: string]: any; // Allow any other fields from n8n
}

export interface StreamEvent {
  type: 'token' | 'agent-end' | 'error';
  data: {
    text?: string;
    error?: string;
  };
}

export interface FileUploadStatus {
  isProcessing: boolean;
  fileName?: string;
  progress?: number;
}

export type ViewType = 'login' | 'chat';

// ── Vector Store / RAG Types ──────────────────────────────────

export interface VectorChunk {
  content: string;
  embedding: number[];
  filename: string;
  chunkIndex: number;
  sessionId: string;
  metadata?: Record<string, any>;
}

export interface UploadedDocument {
  filename: string;
  chunkCount: number;
  uploadedAt: Date;
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
}

export interface DocumentSearchResult {
  id: number;
  content: string;
  filename: string;
  chunkIndex: number;
  similarity: number;
  metadata?: Record<string, any>;
}

export interface ProcessingProgress {
  stage: 'extracting' | 'chunking' | 'embedding' | 'storing' | 'done' | 'error';
  progress: number; // 0-100
  message: string;
}
