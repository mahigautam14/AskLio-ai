import { useState, useRef, useEffect } from 'react';
import { HiPaperAirplane } from 'react-icons/hi';
import useStore from '../store/useStore';

export default function MessageComposer({ onSend, disabled }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  const { darkMode } = useStore();

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px';
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

  return (
    <div className={`border-t px-3 pt-2 pb-3 sm:px-4 ${darkMode ? 'border-slate-700/40 bg-[#0B1120]/95' : 'border-slate-200/70 bg-white/95'}`}>
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-4xl">
        <div className={`flex items-end gap-2 rounded-2xl border px-3 py-2 ${darkMode ? 'border-slate-700 bg-slate-800/70 focus-within:border-teal-500/50' : 'border-slate-200 bg-slate-100 focus-within:border-teal-500/40'}`}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Lio anything..."
            disabled={disabled}
            rows={1}
            className={`max-h-[140px] min-h-[24px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 outline-none placeholder:text-slate-400 ${darkMode ? 'text-white' : 'text-slate-800'} disabled:opacity-50`}
          />
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="mb-0.5 shrink-0 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 p-2.5 text-white shadow-md shadow-teal-500/20 disabled:opacity-30"
            aria-label="Send"
          >
            <HiPaperAirplane className="h-4 w-4 rotate-90" />
          </button>
        </div>
        <p className={`mt-2 text-center text-[10px] sm:text-[11px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Lio can make mistakes. Check important info.
        </p>
      </form>
    </div>
  );
}
