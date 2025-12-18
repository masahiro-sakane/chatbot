export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: Message[];
  images?: Array<{
    data: string;
    mediaType: string;
  }>;
  systemPrompt?: string;
}

export interface ChatResponse {
  response: string;
  model: string;
}
