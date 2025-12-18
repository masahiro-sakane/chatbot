// Content block types for multimodal support
export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  source: {
    type: 'base64';
    media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    data: string;
  };
}

export type ContentBlock = TextContent | ImageContent;

// Message type for chat conversations
export interface Message {
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
}

// Request body for /api/chat endpoint
export interface ChatRequest {
  message: string;
  conversationHistory?: Message[];
  images?: Array<{
    data: string;
    mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  }>;
  systemPrompt?: string;
}

// Response body for /api/chat endpoint
export interface ChatResponse {
  response: string;
  model: string;
}

// Health check response
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
}
