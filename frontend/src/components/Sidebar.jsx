import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  const menuRef = useRef(null);

  // Load list
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => loadConversations(search), 300);
    return () => clearTimeout(t);
  }, [search, loadConversations]);

  // Close ⋮ menu on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleLogoClick = () => {
    // Logo = home, NO logout
    setSidebarOpen(false);
    navigate('/');
  };

  const handleNewChat = async () => {
    await createNewChat();
    setSidebarOpen(false);
    setMenuOpen(null);
  };

  const handleSelect = (id) => {
    loadConversation(id);
    setSidebarOpen(false);
    setMenuOpen(null);
  };

  const handleRename = (id, title) => {
    setEditingId(id);
    setEditTitle(title?.trim() || 'New Chat');
    setMenuOpen(null);
  };

  const submitRename = async (id) => {
    if (editTitle.trim()) {
      await renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
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

  const shell = darkMode
    ? 'bg-[#0f172a] border-slate-700/50'
    : 'bg-white border-slate-200/80';

  const sidebarContent = (
    <div className={`flex h-full w-full flex-col border-r ${shell}`}>
      {/* ===== TOP ===== */}
      <div
        className={`shrink-0 p-4 border-b ${
          darkMode ? 'border-slate-700/50' : 'border-slate-200/80'
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex min-w-0 items-center gap-3 text-left group"
            title="Home"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 text-lg font-black text-white shadow-lg shadow-teal-500/25">
              A
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                AskLio
              </h1>
              <p
                className={`text-[10px] font-medium uppercase tracking-widest ${
                  darkMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                AI Assistant
              </p>
            </div>
          </button>

          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className={`md:hidden rounded-lg p-2 ${
              darkMode
                ? 'text-slate-400 hover:bg-slate-800'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            aria-label="Close sidebar"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:shadow-teal-500/40 active:scale-[0.98]"
        >
          <HiPlus className="h-5 w-5" />
          New Chat
        </button>
      </div>

      {/* ===== SEARCH ===== */}
      <div className="shrink-0 px-3 pt-3 pb-2">
        <div className="relative">
          <HiSearch
            className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
              darkMode ? 'text-slate-500' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className={`w-full rounded-xl py-2.5 pl-10 pr-3 text-sm outline-none transition ${
              darkMode
                ? 'bg-slate-800/70 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500/40'
                : 'bg-slate-100 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/30'
            }`}
          />
        </div>
      </div>

      {/* ===== LIST (only this scrolls) ===== */}
      <div
        ref={menuRef}
        className="custom-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 pb-2"
      >
        {conversations.length === 0 ? (
          <p
            className={`py-10 text-center text-sm ${
              darkMode ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            No conversations yet
          </p>
        ) : (
          conversations.map((conv) => {
            const active = activeConversationId === conv.id;
            return (
              <div
                key={conv.id}
                className={`group relative rounded-xl transition-colors ${
                  active
                    ? darkMode
                      ? 'bg-slate-800 text-white'
                      : 'bg-white text-teal-700 shadow-sm ring-1 ring-slate-200'
                    : darkMode
                    ? 'text-slate-300 hover:bg-slate-800/60'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {editingId === conv.id ? (
                  <div className="flex items-center gap-2 p-2">
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') submitRename(conv.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className={`min-w-0 flex-1 rounded-lg px-2 py-1.5 text-sm outline-none ${
                        darkMode
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 bg-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => submitRename(conv.id)}
                      className="p-1.5 text-teal-500"
                    >
                      <HiCheck className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-2.5 py-2.5">
                    <button
                      type="button"
                      onClick={() => handleSelect(conv.id)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                    >
                      <HiChat
                        className={`h-4 w-4 shrink-0 ${
                          active ? 'text-teal-500' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate text-sm font-medium">
                        {conv.title?.trim() || 'New Chat'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === conv.id ? null : conv.id);
                      }}
                      className={`shrink-0 rounded-md p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 ${
                        darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
                      }`}
                      aria-label="Chat options"
                    >
                      <HiDotsVertical className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Dropdown — opens upward if near bottom is complex; keep simple below item */}
                {menuOpen === conv.id && (
                  <div
                    className={`absolute right-2 top-full z-[60] mt-1 w-36 overflow-hidden rounded-xl border py-1 shadow-xl ${
                      darkMode
                        ? 'border-slate-700 bg-slate-800'
                        : 'border-slate-100 bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleRename(conv.id, conv.title)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm ${
                        darkMode
                          ? 'text-white hover:bg-slate-700'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <HiPencil className="h-3.5 w-3.5" /> Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(conv.id)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <HiTrash className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ===== FOOTER (fixed bottom of sidebar) ===== */}
      <div
        className={`shrink-0 space-y-2 border-t p-3 ${
          darkMode ? 'border-slate-700/50' : 'border-slate-200/80'
        }`}
      >
        <button
          type="button"
          onClick={toggleDarkMode}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            darkMode
              ? 'text-slate-300 hover:bg-slate-800'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {darkMode ? (
            <HiSun className="h-5 w-5 text-amber-400" />
          ) : (
            <HiMoon className="h-5 w-5 text-indigo-500" />
          )}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        <div
          className={`flex items-center justify-between gap-2 rounded-2xl border px-2.5 py-2 ${
            darkMode
              ? 'border-slate-700/50 bg-slate-800/40'
              : 'border-slate-200 bg-white shadow-sm'
          }`}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-blue-600 text-sm font-bold text-white">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p
                className={`truncate text-sm font-bold ${
                  darkMode ? 'text-white' : 'text-slate-800'
                }`}
              >
                {user?.username || 'User'}
              </p>
              <p className="text-[10px] text-slate-400">Signed in</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-xl bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20"
            title="Logout"
          >
            <HiLogout className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: in-flow column, full height of parent (NOT extra 100vh) */}
      <aside className="relative z-20 hidden h-full w-72 shrink-0 md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(20rem,85vw)] transform transition-transform duration-300 ease-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
