import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { HiClipboardCopy, HiCheck, HiRefresh } from 'react-icons/hi';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

export default function MessageBubble({ message, isLast, onRegenerate, isStreaming }) {
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState({});
  const { darkMode } = useStore();

  const isUser = message.role === 'user';
  const isError = message.content?.startsWith('Error:');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content || '');
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCodeCopy = async (code, index) => {
    await navigator.clipboard.writeText(code);
    setCodeCopied((prev) => ({ ...prev, [index]: true }));
    toast.success('Code copied');
    setTimeout(() => {
      setCodeCopied((prev) => ({ ...prev, [index]: false }));
    }, 1500);
  };

  let codeBlockIndex = 0;

  const markdownComponents = {
    p({ children }) {
      return <p className="my-2 leading-7 break-words whitespace-pre-wrap">{children}</p>;
    },

    ul({ children }) {
      return <ul className="my-2 pl-6 list-disc space-y-1">{children}</ul>;
    },

    ol({ children }) {
      return <ol className="my-2 pl-6 list-decimal space-y-1">{children}</ol>;
    },

    li({ children }) {
      return <li className="break-words">{children}</li>;
    },

    blockquote({ children }) {
      return (
        <blockquote className="my-3 border-l-4 border-teal-500/60 pl-4 italic text-gray-700 dark:text-gray-300">
          {children}
        </blockquote>
      );
    },

    a({ href, children }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-teal-500 dark:text-teal-500 underline break-all"
        >
          {children}
        </a>
      );
    },

    hr() {
      return <hr className="my-4 border-gray-200 dark:border-gray-700" />;
    },

    table({ children }) {
      return (
        <div className="my-4 w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full table-fixed border-collapse text-sm">{children}</table>
        </div>
      );
    },

    thead({ children }) {
      return <thead className="bg-gray-50 dark:bg-gray-900/40">{children}</thead>;
    },

    tbody({ children }) {
      return <tbody>{children}</tbody>;
    },

    tr({ children }) {
      return <tr className="border-b border-gray-200 dark:border-gray-700">{children}</tr>;
    },

    th({ children }) {
      return (
        <th className="px-3 py-2 text-left align-top font-semibold break-words whitespace-normal">
          {children}
        </th>
      );
    },

    td({ children }) {
      return (
        <td className="px-3 py-2 align-top break-words whitespace-normal">
          {children}
        </td>
      );
    },

    code({ inline, className, children, ...props }) {
      const text = String(children).replace(/\n$/, '');
      const isBlock = /language-/.test(className || '') || text.includes('\n');

      // Only real fenced/blocked code gets a copy button
      if (isBlock) {
        const match = /language-(\w+)/.exec(className || '');
        const currentIndex = codeBlockIndex;
        codeBlockIndex++;

        return (
          <div className="my-4 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between gap-3 bg-gray-700 dark:bg-gray-900 text-gray-200 text-xs px-4 py-2">
              <span className="truncate">{match ? match[1] : 'code'}</span>

              <button
                onClick={() => handleCodeCopy(text, currentIndex)}
                className="flex items-center gap-1.5 shrink-0 hover:text-white transition-colors"
              >
                {codeCopied[currentIndex] ? (
                  <>
                    <HiCheck className="w-3.5 h-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <HiClipboardCopy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <SyntaxHighlighter
              style={darkMode ? oneDark : oneLight}
              language={match ? match[1] : 'text'}
              PreTag="div"
              wrapLongLines={true}
              customStyle={{
                margin: 0,
                padding: '1rem',
                fontSize: '0.85rem',
                lineHeight: '1.5',
                overflowX: 'auto',
                borderRadius: 0,
                boxSizing: 'border-box',
                width: '100%',
              }}
              codeTagProps={{
                style: {
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                },
              }}
              {...props}
            >
              {text}
            </SyntaxHighlighter>
          </div>
        );
      }

      // Inline code = normal compact code style, NO copy button
      return (
        <code
          className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[0.92em] font-mono break-words"
          {...props}
        >
          {children}
        </code>
      );
    },
  };

  return (
    <div className={`w-full flex py-4 px-4 md:px-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0 mt-1 mr-3">
          C
        </div>
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full max-w-full`}>
        <div
          className={`message-bubble w-full max-w-[min(92vw,52rem)] md:max-w-[min(72vw,46rem)] ${
            isUser
              ? 'bg-teal-600 text-white rounded-br-md'
              : isError
              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-bl-md'
              : 'bg-gray-100 dark:bg-gray-800 rounded-bl-md'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words leading-relaxed text-sm">
              {message.content}
            </p>
          ) : (
            <div className="markdown-content w-full max-w-full overflow-hidden text-[15px] leading-7 break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {message.content || ''}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && message.content && !isStreaming && (
          <div className="flex items-center gap-1 mt-1.5 px-1">
            <button
              onClick={handleCopy}
              className="btn-ghost p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Copy response"
            >
              {copied ? (
                <HiCheck className="w-3.5 h-3.5" />
              ) : (
                <HiClipboardCopy className="w-3.5 h-3.5" />
              )}
            </button>

            {isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="btn-ghost p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Regenerate response"
              >
                <HiRefresh className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {isError && isLast && onRegenerate && (
          <button
            onClick={onRegenerate}
            className="mt-2 text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <HiRefresh className="w-4 h-4" />
            Retry
          </button>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold shrink-0 mt-1 ml-3">
          U
        </div>
      )}
    </div>
  );
}