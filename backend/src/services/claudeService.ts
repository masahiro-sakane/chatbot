import Anthropic from '@anthropic-ai/sdk';
import { Message } from '../types';

const MODEL = 'claude-3-7-sonnet-20250219';
const MAX_TOKENS = 1024;

// Lazy initialization of Anthropic client
let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
    }

    client = new Anthropic({
      apiKey: apiKey.trim(),
    });
  }
  return client;
}

/**
 * Send a message to Claude API and get a response
 * @param messages - Array of conversation messages
 * @param systemPrompt - Optional system prompt to customize Claude's behavior
 * @returns Claude's response text
 */
export async function sendMessage(messages: Message[], systemPrompt?: string): Promise<string> {
  try {
    // Get or initialize client
    const anthropicClient = getClient();

    // Build request parameters
    const requestParams: any = {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: messages,
    };

    // Add system prompt if provided
    if (systemPrompt) {
      requestParams.system = systemPrompt;
    }

    // Call Claude API
    const response = await anthropicClient.messages.create(requestParams);

    // Extract text from response
    const textContent = response.content.find((block) => block.type === 'text');

    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude API response');
    }

    return textContent.text;
  } catch (error) {
    // Handle Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      console.error('Claude API Error:', {
        status: error.status,
        message: error.message,
      });

      // Provide user-friendly error messages
      if (error.status === 401) {
        throw new Error('Invalid API key. Please check your ANTHROPIC_API_KEY.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.status === 500) {
        throw new Error('Claude API server error. Please try again later.');
      }

      throw new Error(`Claude API error: ${error.message}`);
    }

    // Handle other errors
    console.error('Unexpected error in sendMessage:', error);
    throw error;
  }
}

/**
 * Stream a message to Claude API and return a stream
 * @param messages - Array of conversation messages
 * @param systemPrompt - Optional system prompt to customize Claude's behavior
 * @returns MessageStream from Claude API
 */
export async function streamMessage(messages: Message[], systemPrompt?: string) {
  try {
    // Get or initialize client
    const anthropicClient = getClient();

    // Build request parameters
    const requestParams: any = {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: messages,
    };

    // Add system prompt if provided
    if (systemPrompt) {
      requestParams.system = systemPrompt;
    }

    // Create streaming request
    const stream = anthropicClient.messages.stream(requestParams);

    return stream;
  } catch (error) {
    // Handle Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      console.error('Claude API Error:', {
        status: error.status,
        message: error.message,
      });

      // Provide user-friendly error messages
      if (error.status === 401) {
        throw new Error('Invalid API key. Please check your ANTHROPIC_API_KEY.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.status === 500) {
        throw new Error('Claude API server error. Please try again later.');
      }

      throw new Error(`Claude API error: ${error.message}`);
    }

    // Handle other errors
    console.error('Unexpected error in streamMessage:', error);
    throw error;
  }
}

/**
 * Get the model being used
 * @returns Model identifier
 */
export function getModel(): string {
  return MODEL;
}
