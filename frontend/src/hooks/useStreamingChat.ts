import { useState, useCallback, useRef } from 'react';
import type { Message } from '../types';

interface StreamingChatOptions {
  apiUrl?: string;
}

interface StreamEvent {
  type: 'model' | 'text' | 'error' | 'done';
  model?: string;
  text?: string;
  error?: string;
}

export function useStreamingChat(options: StreamingChatOptions = {}) {
  const { apiUrl = import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:8080/api' } = options;
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendStreamingMessage = useCallback(
    async (
      message: string,
      conversationHistory: Message[],
      onChunk: (text: string) => void,
      onComplete: (fullResponse: string) => void
    ) => {
      setIsStreaming(true);
      setError(null);

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      let fullResponse = '';

      try {
        const response = await fetch(`${apiUrl}/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            conversationHistory,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get response reader');
        }

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              try {
                const event: StreamEvent = JSON.parse(data);

                if (event.type === 'text' && event.text) {
                  fullResponse += event.text;
                  onChunk(event.text);
                } else if (event.type === 'error') {
                  throw new Error(event.error || 'Stream error');
                } else if (event.type === 'done') {
                  onComplete(fullResponse);
                }
              } catch (parseError) {
                // Skip malformed JSON
                console.warn('Failed to parse SSE data:', data);
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            console.log('Stream aborted');
          } else {
            console.error('Streaming error:', err);
            setError(err.message);
          }
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [apiUrl]
  );

  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    sendStreamingMessage,
    abortStream,
    isStreaming,
    error,
  };
}
