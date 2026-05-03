/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_BASE_URL: string;
  readonly VITE_N8N_WORKFLOW_ID: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_SUBTITLE: string;
  readonly VITE_FILE_PROCESSING_TIMEOUT: string;
  readonly VITE_SUPPORTED_LANGUAGES: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
