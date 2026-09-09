import axios from 'axios';

const configuredUrl = import.meta.env.VITE_API_URL?.trim();
const RAW_URL = configuredUrl || 'https://asklio-ai.onrender.com';
const CLEAN_URL = RAW_URL.replace(/\/+$/, '');
const API_BASE = CLEAN_URL.endsWith('/api') ? CLEAN_URL : `${CLEAN_URL}/api`;

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('AskLio_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('AskLio_token');
      localStorage.removeItem('AskLio_user');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const chatAPI = {
  getConversations: (search = '') =>
    api.get(`/chat/conversations${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createConversation: (title) => api.post('/chat/conversations', { title }),
  getConversation: (id) => api.get(`/chat/conversations/${id}`),
  updateConversation: (id, title) => api.put(`/chat/conversations/${id}`, { title }),
  deleteConversation: (id) => api.delete(`/chat/conversations/${id}`),
  sendMessage: (message, conversationId = null) => sendStreamingMessage(message, conversationId),
  regenerateResponse: (conversationId) => regenerateStreamingResponse(conversationId),
};

function parseSSEBuffer(buffer, handlers) {
  const events = buffer.split(/\r?\n\r?\n/);
  const remainder = events.pop() || '';

  for (const event of events) {
    const line = event
      .split(/\r?\n/)
      .find((item) => item.startsWith('data:'));
    if (!line) continue;

    const payload = line.slice(5).trim();
    if (!payload || payload === '[DONE]') continue;

    try {
      const data = JSON.parse(payload);
      handlers(data);
    } catch {
      // Ignore incomplete/malformed SSE payloads.
    }
  }

  return remainder;
}

async function consumeSSE(response, handlers) {
  if (!response.body) throw new Error('Streaming is not supported by this browser');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    buffer = parseSSEBuffer(buffer, handlers);
  }

  buffer += decoder.decode();
  parseSSEBuffer(`${buffer}\n\n`, handlers);
}

async function streamRequest(url, options, onChunk, onDone, onError, onStart) {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        Accept: 'text/event-stream',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed (${response.status})`);
    }

    let finished = false;
    await consumeSSE(response, (data) => {
      if (data.type === 'start') {
        onStart?.(data.conversation_id);
      } else if (data.type === 'chunk') {
        onChunk?.(data.content || '');
      } else if (data.type === 'done') {
        finished = true;
        onDone?.(data.conversation_id);
      }
    });

    if (!finished) onDone?.();
  } catch (error) {
    onError?.(error.message || 'An error occurred');
  }
}

function sendStreamingMessage(message, conversationId) {
  return {
    async stream(onChunk, onDone, onError, onStart) {
      const token = localStorage.getItem('AskLio_token');
      if (!token) {
        onError?.('Your session has expired. Please sign in again.');
        return;
      }

      await streamRequest(
        '/chat/send',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message,
            conversation_id: conversationId,
          }),
        },
        onChunk,
        onDone,
        onError,
        onStart
      );
    },
  };
}

function regenerateStreamingResponse(conversationId) {
  return {
    async stream(onChunk, onDone, onError, onStart) {
      const token = localStorage.getItem('AskLio_token');
      if (!token) {
        onError?.('Your session has expired. Please sign in again.');
        return;
      }

      await streamRequest(
        `/chat/regenerate/${conversationId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        onChunk,
        onDone,
        onError,
        onStart
      );
    },
  };
}

export default api;
