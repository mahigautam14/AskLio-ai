import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiPlus, HiSearch, HiChat, HiDotsVertical, HiPencil, HiTrash,
  HiX, HiSun, HiMoon, HiLogout, HiCheck, HiHome
} from 'react-icons/hi';
import useStore from '../store/useStore';
import { useChat } from '../hooks/useChat';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, darkMode, toggleDarkMode, logout, sidebarOpen, setSidebarOpen } = useStore();
  const { conversations, loadConversations, loadConversation, createNewChat, deleteConversation, renameConversation, activeConversationId } = useChat();

  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => { loadConversations(); }, [loadConversations]);
  useEffect(() => {
    const t = setTimeout(() => loadConversations(search), 300);
    return () => clearTimeout(t);
  }, [search, loadConversations]);

  // 🔥 YAHAN FIX KIYA HAI: Logo pe click karte hi Landing Page (/) pe jayega
  const handleLogoClick = () => {
    logout(); // Optional: Agar bina logout kiye home pe jana hai to is line ko hata dena
    setSidebarOpen(false);
    navigate('/');
  };

  const handleNewChat = async () => { await createNewChat(); setSidebarOpen(false); };
  const handleSelect = (id) => { loadConversation(id); setSidebarOpen(false); };
  const handleRename = (id, title) => { setEditingId(id); setEditTitle(title?.trim() || 'New Chat'); setMenuOpen(null); };
  const submitRename = async (id) => { if (editTitle.trim()) await renameConversation(id, editTitle.trim()); setEditingId(null); };
  const handleDelete = async (id) => { setMenuOpen(null); await deleteConversation(id); };
  
  const handleLogout = () => { logout(); setSidebarOpen(false); navigate('/login'); };

  const sidebarContent = (
    <div className={`flex flex-col h-full backdrop-blur-2xl border-r transition-colors duration-500 ${
      darkMode ? 'bg-[#0f172a]/85 border-slate-700/40' : 'bg-white/80 border-slate-200/80 shadow-lg'
    }`}>
      <div className={`p-5 border-b ${darkMode ? 'border-slate-700/40' : 'border-slate-200/80'}`}>
        
        {/* LOGO SECTION */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer group mb-5"
          title="Go to Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50 transition-all">
            <span className="text-white font-black text-lg">A</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-teal-400 via-teal-500 to-blue-500 bg-clip-text text-transparent tracking-tight">AskLio</h1>
            <p className={`text-[10px] font-medium tracking-widest uppercase ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>AI Assistant</p>
          </div>
        </motion.div>

        <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.96 }} onClick={handleNewChat} className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all">
          <HiPlus className="w-5 h-5" /> New Chat
        </motion.button>
      </div>

      {/* SEARCH */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <HiSearch className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input type="text" placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)} className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all ${darkMode ? 'bg-slate-800/60 text-white focus:ring-2 focus:ring-teal-500/40' : 'bg-slate-100 text-slate-800 focus:ring-2 focus:ring-teal-500/30'}`} />
        </div>
      </div>

      {/* CONVERSATION LIST */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
        <AnimatePresence>
          {conversations.length === 0 ? (
            <p className={`text-center text-sm py-10 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <motion.div key={conv.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`group relative rounded-xl transition-all ${activeConversationId === conv.id ? (darkMode ? 'bg-slate-800 text-white' : 'bg-white shadow-sm ring-1 ring-slate-200 text-teal-700') : (darkMode ? 'hover:bg-slate-800/50 text-slate-300' : 'hover:bg-slate-100 text-slate-600')}`}>
                {editingId === conv.id ? (
                  <div className="flex items-center gap-2 p-2.5">
                    <input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submitRename(conv.id); if (e.key === 'Escape') setEditingId(null); }} className={`flex-1 text-sm py-1.5 px-2 rounded-lg outline-none ${darkMode ? 'bg-slate-900' : 'bg-white border border-slate-200'}`} />
                    <button onClick={() => submitRename(conv.id)} className="p-1.5 text-teal-500"><HiCheck className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => handleSelect(conv.id)}>
                    <HiChat className={`w-4 h-4 shrink-0 ${activeConversationId === conv.id ? 'text-teal-500' : 'text-slate-400'}`} />
                    <span className="truncate text-sm font-medium flex-1">{conv.title?.trim() || 'New Chat'}</span>
                    <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === conv.id ? null : conv.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md">
                      <HiDotsVertical className="w-4 h-4" />
                    </button>
                    {menuOpen === conv.id && (
                      <div className={`absolute right-2 top-11 z-50 w-36 py-1.5 rounded-xl shadow-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                        <button onClick={() => handleRename(conv.id, conv.title)} className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${darkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-slate-50'}`}><HiPencil className="w-3.5 h-3.5"/> Rename</button>
                        <button onClick={() => handleDelete(conv.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"><HiTrash className="w-3.5 h-3.5"/> Delete</button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <div className={`p-4 border-t space-y-2.5 ${darkMode ? 'border-slate-700/40' : 'border-slate-200/80'}`}>
        <motion.button onClick={toggleDarkMode} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}>
          {darkMode ? <HiSun className="w-5 h-5 text-amber-400" /> : <HiMoon className="w-5 h-5 text-indigo-500" />} {darkMode ? 'Light Mode' : 'Dark Mode'}
        </motion.button>
        <div className={`flex items-center justify-between px-3 py-2.5 rounded-2xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</div>
            <div className="min-w-0"><p className={`text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{user?.username || 'User'}</p><p className="text-[10px] text-slate-400">Signed in</p></div>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20"><HiLogout className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex w-72 h-screen shrink-0 z-20">{sidebarContent}</aside>
      <AnimatePresence>
        {sidebarOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
      </AnimatePresence>
      <aside className={`fixed left-0 top-0 h-full w-72 z-50 transition-transform duration-300 ease-out md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>{sidebarContent}</aside>
    </>
  );
}