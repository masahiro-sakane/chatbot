import { useEffect, useRef } from 'react';
import type { Message as MessageType } from '../types/index';
import Message from './Message';

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="message-list">
      {messages.length === 0 && (
        <div className="empty-state">
          <h2>AIチャットボット</h2>
          <p>メッセージを送信して会話を始めましょう</p>
        </div>
      )}

      {messages.map((message, index) => (
        <Message key={index} message={message} />
      ))}

      {isLoading && (
        <div className="message assistant-message">
          <div className="message-role">AI</div>
          <div className="message-content loading">
            <span className="loading-dot">●</span>
            <span className="loading-dot">●</span>
            <span className="loading-dot">●</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
