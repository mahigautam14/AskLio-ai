import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPaperAirplane } from 'react-icons/hi';
import useStore from '../store/useStore';

export default function MessageComposer({ onSend, disabled }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  const { darkMode } = useStore();

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 140) + 'px';
  }, [message]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const text = message.trim();
    if (!text || disabled) return;
    onSend(text);
    setMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div
      className={`relative px-3 pt-2 pb-3 sm:px-6 backdrop-blur-xl ${
        darkMode
          ? 'bg-[#0f172a]/70 border-t border-slate-800/80'
          : 'bg-[#f8fafc]/80 border-t border-slate-200/70'
      }`}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <form onSubmit={handleSubmit} className="relative mx-auto w-full max-w-4xl">
        <div
          className={`relative flex items-end gap-2 rounded-2xl border px-3.5 py-2 transition-all duration-200 ${
            darkMode
              ? 'border-slate-700/60 bg-slate-800/60 focus-within:border-teal-500/50 focus-within:bg-slate-800/90'
              : 'border-slate-200 bg-white/90 focus-within:border-teal-500/50 focus-within:bg-white shadow-sm shadow-slate-900/5'
          }`}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Lio anything..."
            disabled={disabled}
            rows={1}
            className={`max-h-[140px] min-h-[26px] flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-6 outline-none placeholder:text-slate-400 ${
              darkMode ? 'text-white' : 'text-slate-800'
            } disabled:opacity-50`}
          />

          <motion.button
            type="submit"
            disabled={!canSend}
            whileHover={canSend ? { scale: 1.05 } : {}}
            whileTap={canSend ? { scale: 0.95 } : {}}
            className={`mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white transition-all duration-200 ${
              canSend
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 shadow-md shadow-teal-500/25'
                : darkMode
                ? 'bg-slate-700/60 text-slate-500'
                : 'bg-slate-200 text-slate-400'
            }`}
            aria-label="Send"
          >
            <HiPaperAirplane className="h-4 w-4 rotate-90" />
          </motion.button>
        </div>

        <p
          className={`mt-2 text-center text-[11px] ${
            darkMode ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          Lio can make mistakes. Check important info.
        </p>
      </form>
    </div>
  );
}
