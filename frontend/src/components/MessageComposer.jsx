import { useState, useRef, useEffect } from 'react';
import { HiPaperAirplane } from 'react-icons/hi';

export default function MessageComposer({ onSend, disabled }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2 border border-gray-200 dark:border-gray-700 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Lio anything..."
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent resize-none focus:outline-none text-sm py-1.5 max-h-[200px] placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="p-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-30 transition-all shrink-0 mb-0.5"
          >
            <HiPaperAirplane className="w-4 h-4 rotate-90" />
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Lio is an advanced AI assistant. Content can be biased or inaccurate.
        </p>
      </form>
    </div>
  );
}