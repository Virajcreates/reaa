export interface Config {
  n8n: {
    baseUrl: string;
    workflowId: string;
    chatEndpoint: string;
    streamEndpoint: string;
  };
  app: {
    title: string;
    subtitle: string;
  };
  fileProcessing: {
    timeout: number;
  };
  languages: string[];
  supabase: {
    url: string;
    anonKey: string;
  };
  gemini: {
    apiKey: string;
    embeddingModel: string;
    chatModel: string;
  };
  pinecone: {
    apiKey: string;
    indexName: string;
    host: string;
  };
  rag: {
    chunkSize: number;
    chunkOverlap: number;
    topK: number;
    maxFiles: number;
    matchThreshold: number;
  };
}

const config: Config = {
  n8n: {
    baseUrl: import.meta.env.VITE_N8N_BASE_URL || 'http://localhost:5678',
    workflowId: import.meta.env.VITE_N8N_WORKFLOW_ID || '1ccf3625-d9b5-4ec2-b73f-ec2e45a2427b',
    get chatEndpoint() {
      return `${this.baseUrl}/webhook/${this.workflowId}/chat`;
    },
    get streamEndpoint() {
      return `${this.baseUrl}/webhook/${this.workflowId}/chat/stream`;
    },
  },
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'Construction AI Assistant',
    subtitle: import.meta.env.VITE_APP_SUBTITLE || 'Ready to help with your construction queries',
  },
  fileProcessing: {
    timeout: parseInt(import.meta.env.VITE_FILE_PROCESSING_TIMEOUT || '30', 10),
  },
  languages: (import.meta.env.VITE_SUPPORTED_LANGUAGES || 'English,Kannada,Hindi').split(','),
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    embeddingModel: 'gemini-embedding-2',
    chatModel: 'gemini-2.0-flash',
  },
  pinecone: {
    apiKey: import.meta.env.VITE_PINECONE_API_KEY || '',
    indexName: import.meta.env.VITE_PINECONE_INDEX_NAME || '',
    host: import.meta.env.VITE_PINECONE_HOST || '',
  },
  rag: {
    chunkSize: 500,
    chunkOverlap: 50,
    topK: 5,
    maxFiles: 4,
    matchThreshold: 0.3,
  },
};

export default config;
