import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiPlus,
  HiSearch,
  HiChat,
  HiDotsVertical,
  HiPencil,
  HiTrash,
  HiX,
  HiSun,
  HiMoon,
  HiLogout,
  HiCheck,
} from 'react-icons/hi';
import useStore from '../store/useStore';
import { useChat } from '../hooks/useChat';

export default function Sidebar() {
  const navigate = useNavigate();

  const {
    user,
    darkMode,
    toggleDarkMode,
    logout,
    sidebarOpen,
    setSidebarOpen,
  } = useStore();

  const {
    conversations,
    loadConversations,
    loadConversation,
    createNewChat,
    deleteConversation,
    renameConversation,
    activeConversationId,
  } = useChat();

  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadConversations(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, loadConversations]);

  const handleNewChat = async () => {
    await createNewChat();
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id) => {
    loadConversation(id);
    setSidebarOpen(false);
  };

  const handleRename = (id, currentTitle) => {
    setEditingId(id);
    setEditTitle(currentTitle?.trim() || 'New Chat');
    setMenuOpen(null);
  };

  const handleRenameSubmit = async (id) => {
    if (editTitle.trim()) {
      await renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleDelete = async (id) => {
    setMenuOpen(null);
    await deleteConversation(id);
  };

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-teal-600 dark:text-teal-500">
            AskLio
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden btn-ghost"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleNewChat}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <HiPlus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 -tranteal-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 text-sm"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-1">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No conversations yet
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`sidebar-item group relative ${
                activeConversationId === conv.id ? 'active' : ''
              }`}
            >
              {editingId === conv.id ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit(conv.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="input-field text-xs py-1"
                    autoFocus
                  />
                  <button
                    onClick={() => handleRenameSubmit(conv.id)}
                    className="btn-ghost p-1"
                  >
                    <HiCheck className="w-4 h-4 text-teal-500" />
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleSelectConversation(conv.id)}
                  >
                    <HiChat className="w-4 h-4 shrink-0 text-gray-400" />
                    <span className="truncate text-sm">
                      {conv.title?.trim() || 'New Chat'}
                    </span>
                  </div>

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === conv.id ? null : conv.id);
                      }}
                      className="btn-ghost p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <HiDotsVertical className="w-4 h-4" />
                    </button>

                    {menuOpen === conv.id && (
                      <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50 w-36">
                        <button
                          onClick={() => handleRename(conv.id, conv.title)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <HiPencil className="w-4 h-4" />
                          Rename
                        </button>
                        <button
                          onClick={() => handleDelete(conv.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <HiTrash className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left"
        >
          {darkMode ? (
            <HiSun className="w-4 h-4 shrink-0" />
          ) : (
            <HiMoon className="w-4 h-4 shrink-0" />
          )}
          <span className="text-sm">{darkMode ? 'Aurora' : 'Eclipse'}</span>
        </button>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-medium shrink-0">
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">
              {user?.username || 'User'}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400">
              Signed in
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors shrink-0"
            title="Logout"
          >
            <HiLogout className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-80 h-screen border-r border-gray-200 dark:border-gray-700 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 z-50 transform transition-transform duration-300 md:hidden ${
          sidebarOpen ? 'tranteal-x-0' : '-tranteal-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}