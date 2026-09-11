import { useRef, useEffect } from 'react';
import { HiMenuAlt2 } from 'react-icons/hi';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import TypingIndicator from './TypingIndicator';
import WelcomeScreen from './WelcomeScreen';
import useStore from '../store/useStore';
import { useChat } from '../hooks/useChat';

export default function ChatArea() {
  const { messages, isStreaming, isLoading, setSidebarOpen, darkMode, activeConversationId } = useStore();
  const { sendMessage, regenerateResponse } = useChat();

  const messagesEndRef = useRef(null);
  const wasStreamingRef = useRef(false);
  const prevMsgLengthRef = useRef(0);

  useEffect(() => {
    const wasStreaming = wasStreamingRef.current;
    const isNowStreaming = isStreaming;
    const hasNewUserMessage = 
      messages.length > prevMsgLengthRef.current && 
      messages[messages.length - 1]?.role === 'user';

    if (hasNewUserMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    if (wasStreaming && !isNowStreaming) {
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
  const showTyping = isStreaming && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content;

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <header className={`sticky top-0 z-30 flex shrink-0 items-center gap-2 border-b px-3 py-3 backdrop-blur-xl sm:px-4 ${darkMode ? 'border-slate-700/40 bg-[#0B1120]/90' : 'border-slate-200/70 bg-white/90'}`}>
        <button type="button" onClick={() => setSidebarOpen(true)} className={`rounded-xl p-2 md:hidden ${darkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}>
          <HiMenuAlt2 className="h-6 w-6" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className={`truncate text-sm font-semibold sm:text-base ${darkMode ? 'text-white' : 'text-slate-800'}`}>
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
          <div className="mx-auto w-full max-w-4xl flex-1 px-0 pb-4 pt-2">
            {messages.map((message, index) => {
              const isLast = index === messages.length - 1;
              const isAssistantStreaming = isStreaming && isLast && message.role === 'assistant';
              return (
                <MessageBubble key={message.id || `msg-${index}`} message={message} isLast={isLast} onRegenerate={isLast && message.role === 'assistant' && !isStreaming ? regenerateResponse : undefined} isStreaming={isAssistantStreaming} />
              );
            })}
            {showTyping && <TypingIndicator />}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      <div className="shrink-0">
        <MessageComposer onSend={sendMessage} disabled={isStreaming || isLoading} />
      </div>
    </div>
  );
}
