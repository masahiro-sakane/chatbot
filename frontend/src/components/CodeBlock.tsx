import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  language?: string;
  children: string;
}

export default function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // システムのダークモード設定を検出
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-language">{language || 'text'}</span>
        <button
          className="code-copy-button"
          onClick={handleCopy}
          aria-label="コードをコピー"
        >
          {copied ? '✓ コピー済み' : 'コピー'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={isDarkMode ? oneDark : oneLight}
        showLineNumbers={true}
        wrapLines={true}
        customStyle={{
          margin: 0,
          borderRadius: '0 0 8px 8px',
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}
