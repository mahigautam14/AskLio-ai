import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('AskLio_token');
  if (token) {
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
      window.location.href = '/login';
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
  createConversation: (title) => 
    api.post('/chat/conversations', { title }),
  getConversation: (id) => 
    api.get(`/chat/conversations/${id}`),
  updateConversation: (id, title) => 
    api.put(`/chat/conversations/${id}`, { title }),
  deleteConversation: (id) => 
    api.delete(`/chat/conversations/${id}`),
  sendMessage: (message, conversationId = null) => {
    return sendStreamingMessage(message, conversationId);
  },
  regenerateResponse: (conversationId) => {
    return regenerateStreamingResponse(conversationId);
  },
};

function sendStreamingMessage(message, conversationId) {
  const token = localStorage.getItem('AskLio_token');
  
  return {
    async stream(onChunk, onDone, onError, onStart) {
      try {
        const response = await fetch(`${API_BASE}/chat/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            message,
            conversation_id: conversationId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Failed to send message');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'start') {
                  onStart?.(data.conversation_id);
                } else if (data.type === 'chunk') {
                  onChunk?.(data.content);
                } else if (data.type === 'title_update') {
                  onChunk?.('', data.title);
                } else if (data.type === 'done') {
                  onDone?.(data.conversation_id);
                }
              } catch (e) {
                // skip malformed JSON
              }
            }
          }
        }
      } catch (error) {
        onError?.(error.message || 'An error occurred');
      }
    }
  };
}

function regenerateStreamingResponse(conversationId) {
  const token = localStorage.getItem('AskLio_token');
  
  return {
    async stream(onChunk, onDone, onError, onStart) {
      try {
        const response = await fetch(`${API_BASE}/chat/regenerate/${conversationId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to regenerate response');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'start') {
                  onStart?.(data.conversation_id);
                } else if (data.type === 'chunk') {
                  onChunk?.(data.content);
                } else if (data.type === 'done') {
                  onDone?.(data.conversation_id);
                }
              } catch (e) {
                // skip
              }
            }
          }
        }
      } catch (error) {
        onError?.(error.message || 'An error occurred');
      }
    }
  };
}

export default api;