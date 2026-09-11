import { useState } from 'react';
import { motion } from 'framer-motion';
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
  const isError = typeof message.content === 'string' && message.content.startsWith('Error:');

  // Raw <br> → real line breaks
  const formattedContent = (message.content || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\r\n/g, '\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedContent);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleCodeCopy = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCodeCopied((prev) => ({ ...prev, [index]: true }));
      toast.success('Code copied');
      setTimeout(() => {
        setCodeCopied((prev) => ({ ...prev, [index]: false }));
      }, 1500);
    } catch {
      toast.error('Copy failed');
    }
  };

  let codeBlockIndex = 0;

  // Shared text wrapping — NEVER break mid-word
  const wrap =
    'break-words [overflow-wrap:anywhere] [word-break:normal] [hyphens:none]';

  const markdownComponents = {
    p({ children }) {
      return (
        <p
          className={`my-2.5 leading-7 ${wrap} ${
            darkMode ? 'text-slate-200' : 'text-slate-700'
          }`}
        >
          {children}
        </p>
      );
    },
    strong({ children }) {
      return (
        <strong className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {children}
        </strong>
      );
    },
    em({ children }) {
      return <em className="italic opacity-90">{children}</em>;
    },
    ul({ children }) {
      return (
        <ul
          className={`my-2.5 pl-5 list-disc space-y-1.5 ${wrap} ${
            darkMode ? 'text-slate-200' : 'text-slate-700'
          }`}
        >
          {children}
        </ul>
      );
    },
    ol({ children }) {
      return (
        <ol
          className={`my-2.5 pl-5 list-decimal space-y-1.5 ${wrap} ${
            darkMode ? 'text-slate-200' : 'text-slate-700'
          }`}
        >
          {children}
        </ol>
      );
    },
    li({ children }) {
      return <li className={`leading-7 ${wrap}`}>{children}</li>;
    },
    h1({ children }) {
      return (
        <h1 className={`text-xl font-bold mt-4 mb-2 ${wrap} ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {children}
        </h1>
      );
    },
    h2({ children }) {
      return (
        <h2 className={`text-lg font-bold mt-4 mb-2 ${wrap} ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {children}
        </h2>
      );
    },
    h3({ children }) {
      return (
        <h3 className={`text-base font-semibold mt-3 mb-1.5 ${wrap} ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {children}
        </h3>
      );
    },
    blockquote({ children }) {
      return (
        <blockquote
          className={`my-3 border-l-4 pl-4 italic ${wrap} ${
            darkMode
              ? 'border-teal-500/50 text-slate-300'
              : 'border-teal-400 text-slate-600'
          }`}
        >
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
          className="text-teal-500 hover:text-teal-400 font-medium underline underline-offset-2"
        >
          {children}
        </a>
      );
    },
    hr() {
      return (
        <hr
          className={`my-4 border-t ${
            darkMode ? 'border-slate-700' : 'border-slate-200'
          }`}
        />
      );
    },

    /* ========== TABLES (main fix for broken words) ========== */
    table({ children }) {
      return (
        <div
          className={`w-full max-w-full my-4 overflow-x-auto rounded-xl border custom-scrollbar ${
            darkMode ? 'border-slate-700/70' : 'border-slate-200'
          }`}
        >
          <table className="w-max min-w-full border-collapse text-left text-[13px] sm:text-sm">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }) {
      return (
        <thead
          className={
            darkMode
              ? 'bg-slate-800/90 text-teal-300'
              : 'bg-slate-50 text-slate-800'
          }
        >
          {children}
        </thead>
      );
    },
    tbody({ children }) {
      return <tbody>{children}</tbody>;
    },
    tr({ children }) {
      return (
        <tr
          className={
            darkMode
              ? 'border-b border-slate-700/60 last:border-0'
              : 'border-b border-slate-200 last:border-0'
          }
        >
          {children}
        </tr>
      );
    },
    th({ children }) {
      return (
        <th
          className={`px-3 sm:px-4 py-2.5 font-semibold whitespace-nowrap align-top ${
            darkMode ? 'text-teal-300' : 'text-slate-800'
          }`}
        >
          {children}
        </th>
      );
    },
    td({ children }) {
      return (
        <td
          className={`px-3 sm:px-4 py-2.5 align-top ${wrap} min-w-[8rem] max-w-[28rem] ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {children}
        </td>
      );
    },

    /* ========== CODE ========== */
    code({ className, children, ...props }) {
      const text = String(children).replace(/\n$/, '');
      const match = /language-(\w+)/.exec(className || '');
      const isBlock = Boolean(match) || text.includes('\n');

      if (isBlock) {
        const currentIndex = codeBlockIndex++;
        const lang = match ? match[1] : 'text';
        return (
          <div
            className={`my-3 w-full max-w-full overflow-hidden rounded-xl border shadow-sm ${
              darkMode ? 'border-slate-700/70' : 'border-slate-200'
            }`}
          >
            <div
              className={`flex items-center justify-between gap-3 text-xs px-3 sm:px-4 py-2 ${
                darkMode
                  ? 'bg-slate-900/90 text-slate-400'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <span className="font-mono uppercase tracking-wider">{lang}</span>
              <button
                type="button"
                onClick={() => handleCodeCopy(text, currentIndex)}
                className="flex items-center gap-1.5 hover:text-teal-400 transition-colors shrink-0"
              >
                {codeCopied[currentIndex] ? (
                  <>
                    <HiCheck className="w-3.5 h-3.5 text-teal-400" /> Copied
                  </>
                ) : (
                  <>
                    <HiClipboardCopy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <SyntaxHighlighter
                style={darkMode ? oneDark : oneLight}
                language={lang}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  padding: '0.9rem 1rem',
                  fontSize: '0.82rem',
                  background: darkMode ? '#0f172a' : '#ffffff',
                  whiteSpace: 'pre',
                  wordBreak: 'normal',
                  overflowWrap: 'normal',
                }}
                codeTagProps={{
                  style: {
                    whiteSpace: 'pre',
                    wordBreak: 'normal',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  },
                }}
                {...props}
              >
                {text}
              </SyntaxHighlighter>
            </div>
          </div>
        );
      }

      return (
        <code
          className={`px-1.5 py-0.5 rounded text-[0.85em] font-mono whitespace-nowrap ${
            darkMode
              ? 'bg-slate-800 text-teal-300'
              : 'bg-slate-100 text-teal-700 border border-slate-200'
          }`}
          {...props}
        >
          {children}
        </code>
      );
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`w-full flex py-3 sm:py-4 px-3 sm:px-6 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* AI avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0 mt-1 mr-2.5 sm:mr-3 shadow-md shadow-teal-500/20">
          L
        </div>
      )}

      <div
        className={`flex flex-col min-w-0 ${
          isUser ? 'items-end' : 'items-start'
        } max-w-[calc(100%-2.75rem)] sm:max-w-[min(100%,42rem)] md:max-w-[min(100%,46rem)]`}
      >
        {/* Bubble */}
        <div
          className={`w-full min-w-0 px-3.5 sm:px-5 py-3 sm:py-3.5 rounded-2xl text-[14px] sm:text-[15px] leading-7 ${
            isUser
              ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-tr-md shadow-md shadow-teal-500/15'
              : isError
              ? darkMode
                ? 'bg-red-950/40 text-red-300 border border-red-800/40 rounded-tl-md'
                : 'bg-red-50 text-red-600 border border-red-100 rounded-tl-md'
              : darkMode
              ? 'bg-slate-800/90 text-slate-100 border border-slate-700/50 rounded-tl-md shadow-lg'
              : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-md shadow-sm'
          }`}
        >
          {isUser ? (
            <p className={`whitespace-pre-wrap ${wrap} leading-relaxed`}>
              {formattedContent}
            </p>
          ) : (
            <div className={`markdown-body w-full min-w-0 ${wrap}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {formattedContent}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-teal-400 animate-pulse rounded-sm" />
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isUser && formattedContent && !isStreaming && (
          <div className="flex items-center gap-1 mt-1.5 px-0.5">
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className={`p-1.5 rounded-lg transition-colors ${
                darkMode
                  ? 'text-slate-500 hover:text-white hover:bg-slate-800'
                  : 'text-slate-400 hover:text-teal-600 hover:bg-white'
              }`}
              title="Copy"
            >
              {copied ? (
                <HiCheck className="w-4 h-4 text-teal-500" />
              ) : (
                <HiClipboardCopy className="w-4 h-4" />
              )}
            </motion.button>

            {isLast && onRegenerate && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.08, rotate: 20 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRegenerate}
                className={`p-1.5 rounded-lg transition-colors ${
                  darkMode
                    ? 'text-slate-500 hover:text-white hover:bg-slate-800'
                    : 'text-slate-400 hover:text-teal-600 hover:bg-white'
                }`}
                title="Regenerate"
              >
                <HiRefresh className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-sm font-bold shrink-0 mt-1 ml-2.5 sm:ml-3 shadow-md">
          U
        </div>
      )}
    </motion.div>
  );
}
