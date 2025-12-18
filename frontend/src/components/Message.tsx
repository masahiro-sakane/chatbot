import type { Message as MessageType } from '../types/index';

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-role">{isUser ? 'You' : 'AI'}</div>
      <div className="message-content">{message.content}</div>
    </div>
  );
}
