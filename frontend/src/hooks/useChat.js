import { useCallback } from 'react';
import { chatAPI } from '../services/api';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

export function useChat() {
  const {
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversation,
    messages,
    setMessages,
    addMessage,
    updateLastMessage,
    removeLastMessage,
    setLoading,
    setStreaming,
    isStreaming,
    isLoading,
  } = useStore();

  const loadConversations = useCallback(
    async (search = '') => {
      try {
        const response = await chatAPI.getConversations(search);
        setConversations(response.data || []);
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    },
    [setConversations]
  );

  const loadConversation = useCallback(
    async (id) => {
      try {
        setLoading(true);
        const response = await chatAPI.getConversation(id);
        setMessages(response.data.messages || []);
        setActiveConversation(id);
      } catch (error) {
        toast.error('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setMessages, setActiveConversation]
  );

  const createNewChat = useCallback(
    async () => {
      try {
        setLoading(true);
        const response = await chatAPI.createConversation('New Chat');
        const newConversation = response.data;

        setActiveConversation(newConversation.id);
        setMessages([]);
        await loadConversations();

        return newConversation.id;
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to create new chat');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setActiveConversation, setMessages, loadConversations]
  );

  const sendMessage = useCallback(
    async (content) => {
      if (isStreaming) return;

      const cleanContent = content.trim();
      if (!cleanContent) return;

      const userMessage = {
        id: Date.now(),
        role: 'user',
        content: cleanContent,
        created_at: new Date().toISOString(),
      };

      addMessage(userMessage);

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      };

      addMessage(assistantMessage);
      setStreaming(true);

      let fullContent = '';
      const streamHandler = chatAPI.sendMessage(cleanContent, activeConversationId);

      await streamHandler.stream(
        (chunk) => {
          fullContent += chunk;
          useStore.getState().updateLastMessage(fullContent);
        },
        (conversationId) => {
          setStreaming(false);
          if (!activeConversationId && conversationId) {
            setActiveConversation(conversationId);
          }
          loadConversations();
        },
        (error) => {
          setStreaming(false);
          useStore.getState().updateLastMessage(`Error: ${error}`);
          toast.error('Failed to get AI response');
        },
        (conversationId) => {
          if (!activeConversationId && conversationId) {
            setActiveConversation(conversationId);
          }
        }
      );
    },
    [activeConversationId, isStreaming, addMessage, setStreaming, setActiveConversation, loadConversations]
  );

  const regenerateResponse = useCallback(
    async () => {
      if (isStreaming || !activeConversationId) return;

      const currentMessages = useStore.getState().messages;
      if (
        currentMessages.length > 0 &&
        currentMessages[currentMessages.length - 1].role === 'assistant'
      ) {
        removeLastMessage();
      }

      const assistantMessage = {
        id: Date.now(),
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      };

      addMessage(assistantMessage);
      setStreaming(true);

      let fullContent = '';
      const streamHandler = chatAPI.regenerateResponse(activeConversationId);

      await streamHandler.stream(
        (chunk) => {
          fullContent += chunk;
          useStore.getState().updateLastMessage(fullContent);
        },
        () => {
          setStreaming(false);
          loadConversations();
        },
        (error) => {
          setStreaming(false);
          useStore.getState().updateLastMessage(`Error: ${error}`);
          toast.error('Failed to regenerate response');
        },
        () => {}
      );
    },
    [activeConversationId, isStreaming, removeLastMessage, addMessage, setStreaming, loadConversations]
  );

  const deleteConversation = useCallback(
    async (id) => {
      try {
        await chatAPI.deleteConversation(id);

        if (activeConversationId === id) {
          setActiveConversation(null);
          setMessages([]);
        }

        await loadConversations();
        toast.success('Conversation deleted');
      } catch (error) {
        toast.error('Failed to delete conversation');
      }
    },
    [activeConversationId, setActiveConversation, setMessages, loadConversations]
  );

  const renameConversation = useCallback(
    async (id, title) => {
      try {
        await chatAPI.updateConversation(id, title);
        await loadConversations();
      } catch (error) {
        toast.error('Failed to rename conversation');
      }
    },
    [loadConversations]
  );

  return {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    isStreaming,
    loadConversations,
    loadConversation,
    createNewChat,
    sendMessage,
    regenerateResponse,
    deleteConversation,
    renameConversation,
  };
}