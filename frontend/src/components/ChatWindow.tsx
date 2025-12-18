import { useState, useRef } from 'react';
import type { Message } from '../types/index';
import { sendMessage } from '../api/chatApi';
import { useStreamingChat } from '../hooks/useStreamingChat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ImageUpload from './ImageUpload';

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingEnabled, setStreamingEnabled] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<Array<{ data: string; mediaType: string }>>([]);
  const streamingResponseRef = useRef<string>('');

  const { sendStreamingMessage, isStreaming } = useStreamingChat();

  const handleSendMessage = async (content: string) => {
    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setError(null);

    if (streamingEnabled) {
      // Use streaming mode
      streamingResponseRef.current = '';

      // Add placeholder for assistant message
      const placeholderMessage: Message = {
        role: 'assistant',
        content: '',
      };
      setMessages((prev) => [...prev, placeholderMessage]);

      await sendStreamingMessage(
        content,
        messages,
        (chunk: string) => {
          // Update the last message with streaming content
          streamingResponseRef.current += chunk;
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: 'assistant',
              content: streamingResponseRef.current,
            };
            return newMessages;
          });
        },
        (fullResponse: string) => {
          // Final update when stream is complete
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: 'assistant',
              content: fullResponse,
            };
            return newMessages;
          });
          streamingResponseRef.current = '';
        }
      );
    } else {
      // Use traditional non-streaming mode
      setIsLoading(true);

      try {
        // Call API with conversation history, images, and system prompt
        const response = await sendMessage(
          content,
          messages,
          selectedImages.length > 0 ? selectedImages : undefined,
          systemPrompt || undefined
        );

        // Add assistant response to chat
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.response,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Clear selected images after sending
        setSelectedImages([]);
      } catch (err) {
        console.error('Failed to send message:', err);
        const errorMessage = err instanceof Error ? err.message : 'メッセージの送信に失敗しました';
        setError(errorMessage);

        // Optionally show error in chat
        const errorResponse: Message = {
          role: 'assistant',
          content: `エラー: ${errorMessage}`,
        };
        setMessages((prev) => [...prev, errorResponse]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="chat-window">
      <header className="chat-header">
        <h1>AIチャットボット</h1>
        <p>Claude APIを使用した会話ボット</p>
        <div className="header-controls">
          <div className="streaming-toggle">
            <label>
              <input
                type="checkbox"
                checked={streamingEnabled}
                onChange={(e) => setStreamingEnabled(e.target.checked)}
              />
              ストリーミングモード
            </label>
          </div>
          <div className="system-prompt-input">
            <input
              type="text"
              placeholder="システムプロンプト (オプション)"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
          </div>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <MessageList messages={messages} isLoading={isLoading || isStreaming} />
      <div className="input-area">
        <ImageUpload
          onImagesSelected={setSelectedImages}
          disabled={isLoading || isStreaming}
        />
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading || isStreaming} />
      </div>
    </div>
  );
}
