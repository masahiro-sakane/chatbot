import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkEmoji from 'remark-emoji';
import rehypeKatex from 'rehype-katex';
import mermaid from 'mermaid';
import CodeBlock from './CodeBlock';
import 'katex/dist/katex.min.css';

interface MessageContentProps {
  content: string;
}

// Mermaidの初期化
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
});

// Mermaidダイアグラムコンポーネント
function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    const renderDiagram = async () => {
      if (ref.current) {
        try {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          setSvg(svg);
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          setSvg(`<pre>Mermaidダイアグラムのレンダリングエラー: ${error}</pre>`);
        }
      }
    };

    renderDiagram();
  }, [chart]);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export default function MessageContent({ content }: MessageContentProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkEmoji]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // コードブロックのカスタムレンダリング
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            // Mermaidダイアグラムの検出
            if (language === 'mermaid' && !inline) {
              return <MermaidDiagram chart={codeString} />;
            }

            // インラインコード
            if (inline) {
              return (
                <code className="inline-code" {...props}>
                  {children}
                </code>
              );
            }

            // コードブロック
            return <CodeBlock language={language}>{codeString}</CodeBlock>;
          },

          // リンクのカスタムレンダリング（セキュリティ対策）
          a({ node, children, href, ...props }) {
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

          // 画像のカスタムレンダリング（遅延読み込み）
          img({ node, src, alt, ...props }) {
            return (
              <img
                src={src}
                alt={alt}
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
