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
  const isError = message.content?.startsWith('Error:');

  // 🔥 FIX 1: Replace raw HTML <br> with proper line breaks
  const formattedContent = (message.content || '').replace(/<br\s*\/?>/gi, '\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formattedContent);
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
      return (
        <p className={`my-2 leading-7 break-words whitespace-pre-wrap ${darkMode ? 'text-gray-200' : 'text-slate-700'}`}>
          {children}
        </p>
      );
    },
    strong({ children }) {
      return <strong className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{children}</strong>;
    },
    ul({ children }) {
      return <ul className={`my-2 pl-6 list-disc space-y-1 ${darkMode ? 'text-gray-200' : 'text-slate-700'}`}>{children}</ul>;
    },
    ol({ children }) {
      return <ol className={`my-2 pl-6 list-decimal space-y-1 ${darkMode ? 'text-gray-200' : 'text-slate-700'}`}>{children}</ol>;
    },
    blockquote({ children }) {
      return (
        <blockquote className={`my-3 border-l-4 pl-4 italic ${darkMode ? 'border-teal-500/60 text-gray-300' : 'border-teal-400 text-slate-600'}`}>
          {children}
        </blockquote>
      );
    },
    a({ href, children }) {
      return <a href={href} target="_blank" rel="noreferrer" className="text-teal-500 hover:text-teal-600 font-medium underline transition-colors">{children}</a>;
    },
    
    // 🔥 FIX 2: Handle Markdown Tables to prevent overflow
    table({ children }) {
      return (
        <div className={`overflow-x-auto w-full my-4 rounded-xl border ${darkMode ? 'border-gray-700/60' : 'border-slate-200'} custom-scrollbar`}>
          <table className="w-full text-left text-[14px] border-collapse min-w-[500px]">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }) {
      return <thead className={darkMode ? 'bg-gray-800/80 text-gray-200' : 'bg-slate-50 text-slate-700'}>{children}</thead>;
    },
    th({ children }) {
      return <th className={`px-4 py-3 font-semibold border-b ${darkMode ? 'border-gray-700/60' : 'border-slate-200'}`}>{children}</th>;
    },
    td({ children }) {
      return <td className={`px-4 py-3 border-b align-top whitespace-pre-wrap ${darkMode ? 'border-gray-700/60 text-gray-300' : 'border-slate-200 text-slate-600'}`}>{children}</td>;
    },

    code({ inline, className, children, ...props }) {
      const text = String(children).replace(/\n$/, '');
      const isBlock = /language-/.test(className || '') || text.includes('\n');

      if (isBlock) {
        const match = /language-(\w+)/.exec(className || '');
        const currentIndex = codeBlockIndex++;
        return (
          <div className={`my-4 w-full overflow-hidden rounded-xl border shadow-sm ${darkMode ? 'border-gray-700/60' : 'border-slate-200'}`}>
            <div className={`flex items-center justify-between gap-3 text-xs px-4 py-2 ${darkMode ? 'bg-gray-800/80 text-gray-300' : 'bg-slate-100 text-slate-600'}`}>
              <span className="font-mono font-medium uppercase tracking-wider">{match ? match[1] : 'code'}</span>
              <button onClick={() => handleCodeCopy(text, currentIndex)} className="flex items-center gap-1.5 hover:text-teal-500 transition-colors">
                {codeCopied[currentIndex] ? <><HiCheck className="w-3.5 h-3.5" /> Copied</> : <><HiClipboardCopy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
            <SyntaxHighlighter
              style={darkMode ? oneDark : oneLight}
              language={match ? match[1] : 'text'}
              PreTag="div"
              wrapLongLines
              customStyle={{ margin: 0, padding: '1rem', fontSize: '0.85rem', background: darkMode ? '#1e1e2e' : '#ffffff' }}
              {...props}
            >
              {text}
            </SyntaxHighlighter>
          </div>
        );
      }
      return (
        <code className={`px-1.5 py-0.5 rounded text-[0.9em] font-mono ${darkMode ? 'bg-gray-800 text-teal-300' : 'bg-slate-100 text-teal-600 border border-slate-200'}`} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`w-full flex py-4 px-4 md:px-8 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0 mt-1 mr-3 shadow-md shadow-teal-500/20">
          L
        </div>
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full max-w-full overflow-hidden`}>
        <div className={`w-full max-w-[min(92vw,52rem)] md:max-w-[min(72vw,46rem)] px-5 py-4 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-tr-sm shadow-md shadow-teal-500/20'
            : isError
            ? darkMode ? 'bg-red-900/20 text-red-400 border border-red-800/50 rounded-tl-sm' : 'bg-red-50 text-red-600 border border-red-100 rounded-tl-sm shadow-sm'
            : darkMode 
              ? 'bg-gray-800/90 text-gray-100 border border-gray-700/50 rounded-tl-sm backdrop-blur-md shadow-lg' 
              : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm shadow-sm'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap break-words leading-relaxed text-[15px]">{formattedContent}</p>
          ) : (
            <div className="markdown-content w-full overflow-x-auto text-[15px] leading-7 custom-scrollbar">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {formattedContent}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && formattedContent && !isStreaming && (
          <div className="flex items-center gap-2 mt-2 px-1">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleCopy} className={`p-1.5 rounded-md transition-colors ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-slate-400 hover:text-teal-600 hover:bg-white shadow-sm'}`} title="Copy response">
              {copied ? <HiCheck className="w-4 h-4 text-teal-500" /> : <HiClipboardCopy className="w-4 h-4" />}
            </motion.button>
            {isLast && onRegenerate && (
              <motion.button whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9 }} onClick={onRegenerate} className={`p-1.5 rounded-md transition-colors ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-slate-400 hover:text-teal-600 hover:bg-white shadow-sm'}`} title="Regenerate">
                <HiRefresh className="w-4 h-4" />
              </motion.button>
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
