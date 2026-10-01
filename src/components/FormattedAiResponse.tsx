import React, { useState } from 'react';
import { Copy, Check, Terminal, Lightbulb, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface FormattedAiResponseProps {
  content: string;
  className?: string;
  isStreaming?: boolean;
}

export const FormattedAiResponse: React.FC<FormattedAiResponseProps> = ({
  content,
  className = '',
  isStreaming = false
}) => {
  const [copiedSnippetIdx, setCopiedSnippetIdx] = useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetIdx(idx);
    setTimeout(() => setCopiedSnippetIdx(null), 2000);
  };

  // Parse markdown content into structured blocks (code blocks, tables, blockquotes, lists, paragraphs)
  const renderBlocks = () => {
    // Split by code fences first
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts: { type: 'code' | 'text'; lang?: string; content: string }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: content.substring(lastIndex, match.index) });
      }
      parts.push({
        type: 'code',
        lang: match[1]?.trim() || 'code',
        content: match[2]?.trim() || ''
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({ type: 'text', content: content.substring(lastIndex) });
    }

    let codeBlockCount = 0;

    return parts.map((part, partIdx) => {
      if (part.type === 'code') {
        const snippetIdx = codeBlockCount++;
        const isCopied = copiedSnippetIdx === snippetIdx;

        return (
          <div
            key={`code-${partIdx}`}
            style={{
              margin: '16px 0',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)'
            }}
          >
            {/* Code Block Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono, monospace)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <Terminal size={13} style={{ color: 'var(--accent-terracotta)' }} />
                <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{part.lang}</span>
              </div>

              <button
                type="button"
                onClick={() => handleCopyCode(part.content, snippetIdx)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: isCopied ? 'rgba(5, 150, 105, 0.15)' : 'var(--bg-card)',
                  color: isCopied ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                  border: isCopied ? '1px solid var(--accent-emerald)' : '1px solid var(--border-medium)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              >
                {isCopied ? (
                  <>
                    <Check size={12} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <pre
              style={{
                margin: 0,
                padding: '14px 16px',
                overflowX: 'auto',
                fontSize: '0.85rem',
                lineHeight: 1.55,
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                color: 'var(--text-primary)',
                background: 'var(--bg-card)'
              }}
            >
              <code>{part.content}</code>
            </pre>
          </div>
        );
      }

      // Format rich text: paragraphs, headings, blockquotes, lists, tables
      return (
        <div key={`text-${partIdx}`}>
          {renderTextMarkdown(part.content)}
        </div>
      );
    });
  };

  const renderTextMarkdown = (rawText: string) => {
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let listBuffer: { type: 'bullet' | 'number'; items: string[] } | null = null;
    let tableBuffer: string[] = [];

    const flushList = (keyPrefix: number) => {
      if (!listBuffer) return;
      if (listBuffer.type === 'bullet') {
        elements.push(
          <div key={`list-${keyPrefix}`} style={{ margin: '8px 0', paddingLeft: '4px' }}>
            {listBuffer.items.map((item, itemIdx) => (
              <div
                key={itemIdx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  margin: '5px 0',
                  fontSize: '0.92rem',
                  lineHeight: 1.55,
                  color: 'var(--text-primary)'
                }}
              >
                <span style={{
                  color: 'var(--accent-terracotta)',
                  fontSize: '1rem',
                  lineHeight: 1.2,
                  marginTop: '1px'
                }}>•</span>
                <div style={{ flex: 1 }}>{renderInlineTokens(item)}</div>
              </div>
            ))}
          </div>
        );
      } else {
        elements.push(
          <div key={`numlist-${keyPrefix}`} style={{ margin: '10px 0', paddingLeft: '4px' }}>
            {listBuffer.items.map((item, itemIdx) => (
              <div
                key={itemIdx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  margin: '6px 0',
                  fontSize: '0.92rem',
                  lineHeight: 1.55,
                  color: 'var(--text-primary)'
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: 'var(--accent-terracotta)',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  {itemIdx + 1}
                </span>
                <div style={{ flex: 1 }}>{renderInlineTokens(item)}</div>
              </div>
            ))}
          </div>
        );
      }
      listBuffer = null;
    };

    const flushTable = (keyPrefix: number) => {
      if (tableBuffer.length < 2) {
        tableBuffer = [];
        return;
      }
      const rows = tableBuffer
        .filter(l => !l.includes('---'))
        .map(l => l.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim()));

      if (rows.length > 0) {
        const header = rows[0];
        const bodyRows = rows.slice(1);

        elements.push(
          <div
            key={`table-${keyPrefix}`}
            style={{
              margin: '14px 0',
              overflowX: 'auto',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-card)'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-medium)' }}>
                  {header.map((col, cIdx) => (
                    <th key={cIdx} style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--text-highlight)' }}>
                      {renderInlineTokens(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((r, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: rIdx < bodyRows.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    {r.map((cell, cellIdx) => (
                      <td key={cellIdx} style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>
                        {renderInlineTokens(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      tableBuffer = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Markdown Table Row
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        flushList(i);
        tableBuffer.push(line.trim());
        continue;
      } else if (tableBuffer.length > 0) {
        flushTable(i);
      }

      // Headings
      if (line.startsWith('# ')) {
        flushList(i);
        elements.push(
          <h3
            key={i}
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-highlight)',
              margin: '20px 0 10px',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ width: '5px', height: '18px', borderRadius: '2px', background: 'var(--accent-terracotta)' }} />
            <span>{line.replace(/^#\s+/, '')}</span>
          </h3>
        );
        continue;
      }

      if (line.startsWith('## ')) {
        flushList(i);
        elements.push(
          <h4
            key={i}
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: 'var(--text-highlight)',
              margin: '18px 0 8px',
              letterSpacing: '-0.02em',
              borderBottom: '1px solid var(--border-hairline)',
              paddingBottom: '4px'
            }}
          >
            {line.replace(/^##\s+/, '')}
          </h4>
        );
        continue;
      }

      if (line.startsWith('### ')) {
        flushList(i);
        elements.push(
          <h5
            key={i}
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--text-highlight)',
              margin: '16px 0 6px',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ width: '4px', height: '14px', borderRadius: '2px', background: 'var(--accent-terracotta)' }} />
            <span>{line.replace(/^###\s+/, '')}</span>
          </h5>
        );
        continue;
      }

      if (line.startsWith('#### ')) {
        flushList(i);
        elements.push(
          <h6
            key={i}
            style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: 'var(--accent-terracotta)',
              margin: '12px 0 4px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            {line.replace(/^####\s+/, '')}
          </h6>
        );
        continue;
      }

      // Blockquotes / Callout Highlights
      if (line.startsWith('> ')) {
        flushList(i);
        const quoteText = line.replace('> ', '');
        const lowerQuote = quoteText.toLowerCase();

        let calloutBorder = 'var(--accent-terracotta)';
        let calloutBg = 'linear-gradient(135deg, rgba(235, 94, 52, 0.08) 0%, var(--bg-secondary) 100%)';
        let CalloutIcon = Lightbulb;
        let iconColor = 'var(--accent-terracotta)';

        if (lowerQuote.includes('warning') || lowerQuote.includes('caution') || lowerQuote.includes('danger')) {
          calloutBorder = 'var(--accent-amber)';
          calloutBg = 'linear-gradient(135deg, rgba(244, 190, 67, 0.12) 0%, var(--bg-secondary) 100%)';
          CalloutIcon = AlertTriangle;
          iconColor = 'var(--accent-amber)';
        } else if (lowerQuote.includes('best practice') || lowerQuote.includes('security') || lowerQuote.includes('success')) {
          calloutBorder = 'var(--accent-emerald)';
          calloutBg = 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, var(--bg-secondary) 100%)';
          CalloutIcon = ShieldCheck;
          iconColor = 'var(--accent-emerald)';
        }

        elements.push(
          <div
            key={i}
            style={{
              borderLeft: `3px solid ${calloutBorder}`,
              background: calloutBg,
              padding: '10px 14px',
              margin: '10px 0',
              borderRadius: '0 8px 8px 0',
              fontSize: '0.9rem',
              lineHeight: 1.55,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              borderTop: '1px solid var(--border-hairline)',
              borderRight: '1px solid var(--border-hairline)',
              borderBottom: '1px solid var(--border-hairline)'
            }}
          >
            <CalloutIcon size={16} style={{ color: iconColor, marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>{renderInlineTokens(quoteText)}</div>
          </div>
        );
        continue;
      }

      // Bullet lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        if (!listBuffer || listBuffer.type !== 'bullet') {
          flushList(i);
          listBuffer = { type: 'bullet', items: [] };
        }
        listBuffer.items.push(line.substring(2));
        continue;
      }

      // Numbered lists
      const numberMatch = line.match(/^(\d+)\.\s(.*)/);
      if (numberMatch) {
        if (!listBuffer || listBuffer.type !== 'number') {
          flushList(i);
          listBuffer = { type: 'number', items: [] };
        }
        listBuffer.items.push(numberMatch[2]);
        continue;
      }

      // Normal paragraph text
      flushList(i);
      if (line.trim()) {
        elements.push(
          <p
            key={i}
            style={{
              margin: '8px 0',
              lineHeight: 1.62,
              fontSize: '0.92rem',
              color: 'var(--text-primary)'
            }}
          >
            {renderInlineTokens(line)}
          </p>
        );
      } else {
        elements.push(<div key={i} style={{ height: '4px' }} />);
      }
    }

    flushList(lines.length);
    flushTable(lines.length);

    return elements;
  };

  // Helper for inline tokens: **bold**, `inline code`, *italic*, [link](url)
  const renderInlineTokens = (text: string) => {
    // Regex splits by: **bold**, `code`, *italic*, [text](url)
    const tokens = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*|\[.*?\]\(.*?\))/g);

    return tokens.map((tok, idx) => {
      if (tok.startsWith('**') && tok.endsWith('**')) {
        return (
          <strong
            key={idx}
            style={{
              fontWeight: 800,
              color: 'var(--text-highlight)'
            }}
          >
            {tok.slice(2, -2)}
          </strong>
        );
      }

      if (tok.startsWith('`') && tok.endsWith('`')) {
        return (
          <code
            key={idx}
            style={{
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '0.84rem',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(235, 94, 52, 0.1)',
              border: '1px solid rgba(235, 94, 52, 0.25)',
              color: 'var(--accent-terracotta)',
              margin: '0 2px'
            }}
          >
            {tok.slice(1, -1)}
          </code>
        );
      }

      if (tok.startsWith('*') && tok.endsWith('*')) {
        return (
          <em key={idx} style={{ color: 'var(--text-secondary)' }}>
            {tok.slice(1, -1)}
          </em>
        );
      }

      // Link match [label](url)
      const linkMatch = tok.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        return (
          <a
            key={idx}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--accent-terracotta)',
              textDecoration: 'underline',
              fontWeight: 600
            }}
          >
            {linkMatch[1]}
          </a>
        );
      }

      return tok;
    });
  };

  return (
    <div className={`formatted-ai-response ${className}`} style={{ color: 'var(--text-primary)' }}>
      {renderBlocks()}
      {isStreaming && (
        <span
          className="streaming-cursor"
          style={{
            display: 'inline-block',
            width: '8px',
            height: '14px',
            background: 'var(--accent-terracotta)',
            marginLeft: '4px',
            verticalAlign: 'middle',
            animation: 'blink 0.8s infinite'
          }}
        />
      )}
    </div>
  );
};
