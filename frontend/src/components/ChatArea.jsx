import { useRef, useEffect } from 'react';
import { HiMenuAlt2 } from 'react-icons/hi';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import TypingIndicator from './TypingIndicator';
import WelcomeScreen from './WelcomeScreen';
import useStore from '../store/useStore';
import { useChat } from '../hooks/useChat';

export default function ChatArea() {
  const { messages, isStreaming, isLoading, setSidebarOpen, darkMode, activeConversationId } =
    useStore();
  const { sendMessage, regenerateResponse } = useChat();

  const messagesEndRef = useRef(null);
  const wasStreamingRef = useRef(false);
  const prevMsgLengthRef = useRef(0);

  useEffect(() => {
    const wasStreaming = wasStreamingRef.current;
    const hasNewUserMessage =
      messages.length > prevMsgLengthRef.current &&
      messages[messages.length - 1]?.role === 'user';

    if (hasNewUserMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    if (wasStreaming && !isStreaming) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 150);
    }

    wasStreamingRef.current = isStreaming;
    prevMsgLengthRef.current = messages.length;
  }, [messages, isStreaming]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [activeConversationId]);

  const showWelcome = messages.length === 0 && !isLoading;
  const showTyping =
    isStreaming &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === 'assistant' &&
    !messages[messages.length - 1]?.content;

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
      {/* Soft top bar — same tone as sidebar */}
      <header
        className={`sticky top-0 z-30 flex shrink-0 items-center gap-2 px-3 py-3 sm:px-5 backdrop-blur-xl ${
          darkMode
            ? 'bg-[#0f172a]/75 border-b border-slate-700/40'
            : 'bg-[#f8fafc]/80 border-b border-slate-200/70'
        }`}
      >
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className={`rounded-xl p-2 md:hidden transition ${
            darkMode
              ? 'text-slate-300 hover:bg-slate-800/80'
              : 'text-slate-600 hover:bg-white/70'
          }`}
          aria-label="Open chats"
        >
          <HiMenuAlt2 className="h-6 w-6" />
        </button>

        <div className="min-w-0 flex-1">
          <h2
            className={`truncate text-[13px] font-semibold tracking-wide sm:text-sm ${
              darkMode ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            {activeConversationId ? 'Chat' : 'New Chat'}
          </h2>
        </div>
      </header>

      <div className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-teal-500 border-t-transparent" />
          </div>
        ) : showWelcome ? (
          <div className="flex flex-1 items-center justify-center">
            <WelcomeScreen onSendMessage={sendMessage} />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-4xl flex-1 px-0 pb-6 pt-3">
            {messages.map((message, index) => {
              const isLast = index === messages.length - 1;
              const isAssistantStreaming =
                isStreaming && isLast && message.role === 'assistant';

              return (
                <MessageBubble
                  key={message.id || `msg-${index}`}
                  message={message}
                  isLast={isLast}
                  onRegenerate={
                    isLast && message.role === 'assistant' && !isStreaming
                      ? regenerateResponse
                      : undefined
                  }
                  isStreaming={isAssistantStreaming}
                />
              );
            })}
            {showTyping && <TypingIndicator />}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      <div className="relative z-20 shrink-0">
        <MessageComposer onSend={sendMessage} disabled={isStreaming || isLoading} />
      </div>
    </div>
  );
}
