import React from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import useStore from '../store/useStore';

export default function ChatPage() {
  const { darkMode } = useStore();

  return (
    <div
      className={`relative h-[100dvh] w-full max-w-[100vw] overflow-hidden transition-colors duration-500 ${
        darkMode ? 'bg-[#0f172a] text-white' : 'bg-[#f8fafc] text-slate-900'
      }`}
    >
      {/* 🚀 Soft Animated Glow Blobs (NO LINES / NO HARSH COLORS) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className={`animate-blob absolute -top-[10%] -left-[5%] h-[30rem] w-[30rem] rounded-full blur-[120px] ${
            darkMode ? 'bg-teal-500/12' : 'bg-sky-200/50'
          }`}
        />
        <div
          className={`animate-blob animation-delay-2000 absolute top-[20%] -right-[8%] h-[26rem] w-[26rem] rounded-full blur-[120px] ${
            darkMode ? 'bg-indigo-500/10' : 'bg-teal-200/40'
          }`}
        />
        <div
          className={`animate-blob animation-delay-4000 absolute -bottom-[12%] left-[20%] h-[32rem] w-[32rem] rounded-full blur-[130px] ${
            darkMode ? 'bg-purple-500/10' : 'bg-indigo-100/50'
          }`}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex h-full w-full min-w-0">
        <Sidebar />
        <main
          className={`flex h-full min-w-0 flex-1 flex-col overflow-hidden border-l bg-transparent ${
            darkMode ? 'border-slate-800/80' : 'border-slate-200/70'
          }`}
        >
          <ChatArea />
        </main>
      </div>
    </div>
  );
}
