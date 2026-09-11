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

  // Remove raw HTML <br> cleanly
  const formattedContent = (message.content || '').replace(/<br\s*\/?>/gi, '\n');

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
      setTimeout(() => { setCodeCopied((prev) => ({ ...prev, [index]: false })); }, 1500);
    } catch {
      toast.error('Copy failed');
    }
  };

  let codeBlockIndex = 0;

  const markdownComponents = {
    p({ children }) {
      return <p className={`my-2 leading-7 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{children}</p>;
    },
    strong({ children }) {
      return <strong className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{children}</strong>;
    },
    ul({ children }) {
      return <ul className={`my-2 pl-5 list-disc space-y-1.5 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{children}</ul>;
    },
    ol({ children }) {
      return <ol className={`my-2 pl-5 list-decimal space-y-1.5 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{children}</ol>;
    },
    
    // 🚀 FIXED: Clean Table rendering (no broken words)
    table({ children }) {
      return (
        <div className={`w-full max-w-full my-4 overflow-x-auto rounded-xl border custom-scrollbar ${darkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
          <table className="w-full min-w-[500px] border-collapse text-left text-[14px]">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }) {
      return <thead className={darkMode ? 'bg-slate-800/80 text-teal-300' : 'bg-slate-50 text-slate-800'}>{children}</thead>;
    },
    th({ children }) {
      return <th className={`px-4 py-3 font-semibold whitespace-nowrap border-b ${darkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>{children}</th>;
    },
    td({ children }) {
      // 🚀 FIXED: Lists inside table cells won't break layout
      return (
        <td className={`px-4 py-3 align-top border-b ${darkMode ? 'border-slate-700/50 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
          <div className="[&_p]:my-1 [&_ul]:my-1 [&_ul]:pl-4 [&_ol]:my-1 [&_ol]:pl-4">
            {children}
          </div>
        </td>
      );
    },

    code({ className, children, ...props }) {
      const text = String(children).replace(/\n$/, '');
      const match = /language-(\w+)/.exec(className || '');
      const isBlock = Boolean(match) || text.includes('\n');

      if (isBlock) {
        const currentIndex = codeBlockIndex++;
        const lang = match ? match[1] : 'text';
        return (
          <div className={`my-3 w-full max-w-full overflow-hidden rounded-xl border shadow-sm ${darkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
            <div className={`flex items-center justify-between gap-3 text-xs px-4 py-2 ${darkMode ? 'bg-slate-900/90 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
              <span className="font-mono uppercase tracking-wider">{lang}</span>
              <button type="button" onClick={() => handleCodeCopy(text, currentIndex)} className="flex items-center gap-1 hover:text-teal-500 transition-colors shrink-0">
                {codeCopied[currentIndex] ? <><HiCheck className="h-3.5 w-3.5" /> Copied</> : <><HiClipboardCopy className="h-3.5 w-3.5" /> Copy</>}
              </button>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <SyntaxHighlighter style={darkMode ? oneDark : oneLight} language={lang} PreTag="div" customStyle={{ margin: 0, padding: '1rem', fontSize: '0.85rem', background: darkMode ? '#0f172a' : '#ffffff' }} {...props}>
                {text}
              </SyntaxHighlighter>
            </div>
          </div>
        );
      }
      return <code className={`px-1.5 py-0.5 rounded text-[0.85em] font-mono whitespace-nowrap ${darkMode ? 'bg-slate-800 text-teal-300' : 'bg-slate-100 text-teal-700 border border-slate-200'}`} {...props}>{children}</code>;
    },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={`w-full flex py-4 px-4 sm:px-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0 mt-1 mr-3 shadow-md shadow-teal-500/20">
          L
        </div>
      )}

      <div className={`flex flex-col min-w-0 ${isUser ? 'items-end' : 'items-start'} max-w-[calc(100%-2.5rem)] sm:max-w-[80%]`}>
        <div className={`w-full min-w-0 px-4 sm:px-5 py-3.5 rounded-2xl text-[14.5px] leading-7 ${
          isUser ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-tr-md shadow-md shadow-teal-500/15' : isError ? (darkMode ? 'bg-red-950/40 text-red-300 border border-red-800/40' : 'bg-red-50 text-red-600 border border-red-100') : (darkMode ? 'bg-[#151b2b] text-slate-100 border border-slate-700/50 shadow-md' : 'bg-white text-slate-800 border border-slate-200/80 shadow-sm')
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap break-words leading-relaxed">{formattedContent}</p>
          ) : (
            <div className="markdown-body w-full min-w-0 break-words [word-break:normal] [overflow-wrap:anywhere]">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {formattedContent}
              </ReactMarkdown>
              {isStreaming && <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-teal-400 animate-pulse rounded-sm" />}
            </div>
          )}
        </div>

        {!isUser && formattedContent && !isStreaming && (
          <div className="flex items-center gap-1 mt-1.5 px-1">
            <button onClick={handleCopy} className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'text-slate-500 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-teal-600 hover:bg-white'}`} title="Copy">
              {copied ? <HiCheck className="h-4 w-4 text-teal-500" /> : <HiClipboardCopy className="h-4 w-4" />}
            </button>
            {isLast && onRegenerate && (
              <button onClick={onRegenerate} className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'text-slate-500 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-teal-600 hover:bg-white'}`} title="Regenerate">
                <HiRefresh className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-sm font-bold shrink-0 mt-1 ml-3 shadow-md">
          U
        </div>
      )}
    </motion.div>
  );
}
