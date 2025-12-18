import type { ChatRequest, ChatResponse, Message } from '../types/index';

// Base URL for API
// In production, use relative path since frontend and backend are served from the same origin
// In development, use localhost
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production' ? '' : 'http://localhost:8080');

/**
 * Send a message to the backend API
 * @param message - User's message
 * @param conversationHistory - Previous messages in the conversation
 * @param images - Optional array of images to send
 * @param systemPrompt - Optional system prompt
 * @returns Promise with the API response
 */
export async function sendMessage(
  message: string,
  conversationHistory: Message[] = [],
  images?: Array<{ data: string; mediaType: string }>,
  systemPrompt?: string
): Promise<ChatResponse> {
  try {
    const requestBody: ChatRequest = {
      message,
      conversationHistory,
      images,
      systemPrompt,
    };

    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Unknown error',
        message: response.statusText,
      }));

      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}
