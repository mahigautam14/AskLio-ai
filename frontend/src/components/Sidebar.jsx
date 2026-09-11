import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiPlus, HiSearch, HiChat, HiDotsVertical,
  HiPencil, HiTrash, HiX, HiSun, HiMoon, HiLogout, HiCheck,
} from 'react-icons/hi';
import useStore from '../store/useStore';
import { useChat } from '../hooks/useChat';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, darkMode, toggleDarkMode, logout, sidebarOpen, setSidebarOpen } = useStore();
  const {
    conversations, loadConversations, loadConversation,
    createNewChat, deleteConversation, renameConversation, activeConversationId,
  } = useChat();

  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [busyId, setBusyId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    const t = setTimeout(() => loadConversations(search), 300);
    return () => clearTimeout(t);
  }, [search, loadConversations]);

  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogoClick = () => {
    setSidebarOpen(false);
    setMenuOpen(null);
    navigate('/');
  };

  const handleNewChat = async () => {
    try {
      await createNewChat();
      setSidebarOpen(false);
      setMenuOpen(null);
    } catch {
      toast.error('Could not create chat');
    }
  };

  const handleSelect = async (id) => {
    if (editingId || busyId) return;
    try {
      await loadConversation(id);
      setSidebarOpen(false);
      setMenuOpen(null);
    } catch {
      toast.error('Could not open chat');
    }
  };

  const startRename = (id, title, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setMenuOpen(null);
    setEditingId(id);
    setEditTitle((title || '').trim() || 'New Chat');
  };

  const submitRename = async (id, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const next = editTitle.trim();
    if (!next) return toast.error('Title cannot be empty');
    try {
      setBusyId(id);
      await renameConversation(id, next);
      setEditingId(null);
      setEditTitle('');
      toast.success('Renamed');
    } catch {
      toast.error('Rename failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setMenuOpen(null);
    if (!window.confirm('Delete this conversation?')) return;
    try {
      setBusyId(id);
      await deleteConversation(id);
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate('/login');
  };

  const shell = darkMode ? 'bg-[#0B1120] border-slate-700/30' : 'bg-[#f8fafc] border-slate-200/60';

  const sidebarContent = (
    <div className={`flex h-full w-full flex-col border-r ${shell}`} style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className={`shrink-0 border-b p-3 sm:p-4 ${darkMode ? 'border-slate-700/30' : 'border-slate-200/60'}`}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <button type="button" onClick={handleLogoClick} className="group flex min-w-0 flex-1 items-center gap-2.5 text-left" title="Go to Home">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 text-base font-black text-white shadow-md shadow-teal-500/20 transition group-hover:scale-105">
              A
            </div>
            <div className="min-w-0">
              <h1 className="truncate bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-lg font-extrabold tracking-tight text-transparent sm:text-xl">
                AskLio
              </h1>
              <p className={`text-[10px] font-medium uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                AI Assistant
              </p>
            </div>
          </button>

          <button type="button" onClick={() => setSidebarOpen(false)} className={`rounded-lg p-2 md:hidden ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-200'}`}>
            <HiX className="h-5 w-5" />
          </button>
        </div>

        <button type="button" onClick={handleNewChat} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-500/20 active:scale-[0.98]">
          <HiPlus className="h-5 w-5" /> New Chat
        </button>
      </div>

      <div className="shrink-0 px-3 pt-3 pb-2">
        <div className="relative">
          <HiSearch className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className={`w-full rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none ${
              darkMode
                ? 'bg-slate-800/60 text-white placeholder:text-slate-500 focus:ring-1 focus:ring-teal-500/40'
                : 'border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-teal-500/30'
            }`}
          />
        </div>
      </div>

      <div ref={menuRef} className="custom-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 pb-2">
        {conversations.length === 0 ? (
          <p className={`py-10 text-center text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No conversations yet</p>
        ) : (
          conversations.map((conv) => {
            const active = activeConversationId === conv.id;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                className={`relative rounded-xl transition-colors ${
                  active
                    ? darkMode ? 'bg-slate-800 text-white' : 'border border-slate-200 bg-white text-teal-700 shadow-sm'
                    : darkMode ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-white/80'
                } ${busyId === conv.id ? 'pointer-events-none opacity-50' : ''}`}
              >
                {isEditing ? (
                  <form className="flex items-center gap-1 p-2" onSubmit={(e) => submitRename(conv.id, e)}>
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className={`min-w-0 flex-1 rounded-lg px-2 py-1.5 text-sm outline-none ring-1 ring-teal-500/50 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}
                    />
                    <button type="submit" className="p-1.5 text-teal-500"><HiCheck className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setEditingId(null)} className="p-1.5 text-slate-400"><HiX className="h-4 w-4" /></button>
                  </form>
                ) : (
                  <div className="flex items-center gap-1 px-1.5 py-1.5">
                    <button type="button" onClick={() => handleSelect(conv.id)} className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1.5 py-2 text-left active:opacity-80">
                      <HiChat className={`h-4 w-4 shrink-0 ${active ? 'text-teal-500' : 'text-slate-400'}`} />
                      <span className="truncate text-sm font-medium">{conv.title?.trim() || 'New Chat'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpen((p) => (p === conv.id ? null : conv.id));
                      }}
                      className={`shrink-0 rounded-lg p-2 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                    >
                      <HiDotsVertical className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <AnimatePresence>
                  {menuOpen === conv.id && !isEditing && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      className={`absolute right-2 top-[calc(100%-2px)] z-[80] w-36 overflow-hidden rounded-xl border py-1 shadow-xl ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <button type="button" onClick={(e) => startRename(conv.id, conv.title, e)} className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm ${darkMode ? 'text-white hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                        <HiPencil className="h-4 w-4" /> Rename
                      </button>
                      <button type="button" onClick={(e) => handleDelete(conv.id, e)} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                        <HiTrash className="h-4 w-4" /> Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      <div className={`shrink-0 space-y-2 border-t p-3 ${darkMode ? 'border-slate-700/30' : 'border-slate-200/60'}`} style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <button type="button" onClick={toggleDarkMode} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}>
          {darkMode ? <HiSun className="h-5 w-5 text-amber-400" /> : <HiMoon className="h-5 w-5 text-indigo-500" />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        <div className={`flex items-center justify-between gap-2 rounded-2xl border px-2.5 py-2 ${darkMode ? 'border-slate-700/40 bg-slate-800/30' : 'border-slate-200 bg-white'}`}>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-blue-600 text-xs font-bold text-white">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <p className={`truncate text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{user?.username || 'User'}</p>
          </div>
          <button type="button" onClick={handleLogout} className="rounded-xl bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20" title="Logout">
            <HiLogout className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="relative z-20 hidden h-full w-72 shrink-0 md:flex">{sidebarContent}</aside>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 z-50 w-[min(20rem,88vw)] transform shadow-2xl transition-transform duration-300 ease-out md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>
    </>
  );
}
