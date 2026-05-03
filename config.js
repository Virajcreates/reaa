// Configuration Module for Construction RAG Chat
// ===============================================

// Environment Configuration
// In a real deployment, these would be loaded from environment variables
// For client-side applications, you might use build-time environment variable injection

const CONFIG = {
    // n8n Configuration
    N8N_BASE_URL: process?.env?.N8N_BASE_URL || 'http://localhost:5678',
    N8N_WORKFLOW_ID: process?.env?.N8N_WORKFLOW_ID || '1ccf3625-d9b5-4ec2-b73f-ec2e45a2427b',
    
    // Application Settings
    APP_TITLE: process?.env?.APP_TITLE || 'Construction AI Assistant',
    APP_SUBTITLE: process?.env?.APP_SUBTITLE || 'Ready to help with your construction queries',
    
    // File Processing
    FILE_PROCESSING_TIMEOUT: parseInt(process?.env?.FILE_PROCESSING_TIMEOUT || '30'),
    
    // Language Support
    SUPPORTED_LANGUAGES: (process?.env?.SUPPORTED_LANGUAGES || 'English,Kannada,Hindi').split(','),
    
    // Computed endpoints
    get CHAT_ENDPOINT() {
        return `${this.N8N_BASE_URL}/webhook/${this.N8N_WORKFLOW_ID}/chat`;
    },
    
    get STREAM_ENDPOINT() {
        return `${this.N8N_BASE_URL}/webhook/${this.N8N_WORKFLOW_ID}/chat/stream`;
    }
};

// For browser environments without process.env support
if (typeof process === 'undefined' || !process.env) {
    // Fallback configuration for client-side
    Object.assign(CONFIG, {
        N8N_BASE_URL: 'http://localhost:5678',
        N8N_WORKFLOW_ID: '1ccf3625-d9b5-4ec2-b73f-ec2e45a2427b',
        APP_TITLE: 'Construction AI Assistant',
        APP_SUBTITLE: 'Ready to help with your construction queries',
        FILE_PROCESSING_TIMEOUT: 30,
        SUPPORTED_LANGUAGES: ['English', 'Kannada', 'Hindi']
    });
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Global variable for browser use
if (typeof window !== 'undefined') {
    window.APP_CONFIG = CONFIG;
}