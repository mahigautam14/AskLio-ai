import { create } from 'zustand';

const safeJsonParse = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const getInitialDarkMode = () => {
  if (typeof window === 'undefined') return false;

  const saved = localStorage.getItem('AskLio_theme');
  if (saved === 'dark') return true;
  if (saved === 'light') return false;

  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
};

const useStore = create((set, get) => ({
  user: safeJsonParse(localStorage.getItem('AskLio_user')),
  token: localStorage.getItem('AskLio_token') || null,
  isAuthenticated: !!localStorage.getItem('AskLio_token'),

  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  streamingContent: '',

  sidebarOpen: false,
  darkMode: getInitialDarkMode(),

  setAuth: (user, token) => {
    localStorage.setItem('AskLio_user', JSON.stringify(user));
    localStorage.setItem('AskLio_token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
  localStorage.removeItem('AskLio_user');
  localStorage.removeItem('AskLio_token');
  set({
    user: null,
    token: null,
    isAuthenticated: false,
    conversations: [],
    activeConversationId: null,
    messages: [],
    isLoading: false,
    isStreaming: false,
    streamingContent: '',
    sidebarOpen: false,
  });
},

  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateLastMessage: (content) =>
    set((state) => {
      const msgs = [...state.messages];
      if (msgs.length > 0) {
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content };
      }
      return { messages: msgs };
    }),

  removeLastMessage: () =>
    set((state) => ({
      messages: state.messages.slice(0, -1),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setStreamingContent: (streamingContent) => set({ streamingContent }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleDarkMode: () => {
    const newMode = !get().darkMode;
    localStorage.setItem('AskLio_theme', newMode ? 'dark' : 'light');

    if (typeof document !== 'undefined') {
      if (newMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }

    set({ darkMode: newMode });
  },

  initTheme: () => {
    const dark = get().darkMode;

    if (typeof document !== 'undefined') {
      if (dark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  },
}));

export default useStore;