import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';

interface MessageContentProps {
  content: string;
}

export default function MessageContent({ content }: MessageContentProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeContent = String(children).replace(/\n$/, '');

            return !inline && match ? (
              <CodeBlock language={match[1]}>
                {codeContent}
              </CodeBlock>
            ) : (
              <CodeBlock inline={true}>
                {codeContent}
              </CodeBlock>
            );
          },
          a({ node, children, href, ...props }) {
            // 外部リンクを安全に処理
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            );
          },
          img({ node, src, alt, ...props }) {
            // 画像の安全な読み込み
            return (
              <img
                src={src}
                alt={alt || ''}
                loading="lazy"
                {...props}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
