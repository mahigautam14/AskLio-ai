import { useRef, useEffect } from 'react';
import { HiMenuAlt2 } from 'react-icons/hi';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import TypingIndicator from './TypingIndicator';
import WelcomeScreen from './WelcomeScreen';
import useStore from '../store/useStore';
import { useChat } from '../hooks/useChat';

export default function ChatArea() {
  const { messages, isStreaming, isLoading, setSidebarOpen } = useStore();
  const { sendMessage, regenerateResponse, activeConversationId } = useChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const showWelcome = messages.length === 0 && !isLoading;

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden btn-ghost"
        >
          <HiMenuAlt2 className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-sm truncate">
          {activeConversationId ? 'Chat' : 'New Chat'}
        </h2>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
          </div>
        ) : showWelcome ? (
          <WelcomeScreen onSendMessage={sendMessage} />
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id || index}
                message={message}
                isLast={index === messages.length - 1}
                onRegenerate={
                  index === messages.length - 1 && message.role === 'assistant'
                    ? regenerateResponse
                    : undefined
                }
                isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
              />
            ))}
            {isStreaming && messages.length > 0 && 
             messages[messages.length - 1]?.role === 'assistant' && 
             messages[messages.length - 1]?.content === '' && (
              <TypingIndicator />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <MessageComposer onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}