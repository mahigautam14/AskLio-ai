import React from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import useStore from '../store/useStore';

export default function ChatPage() {
  const { darkMode } = useStore();

  return (
    <div
      className={`h-[100dvh] w-full overflow-hidden transition-colors duration-500 ${
        darkMode ? 'bg-[#0B1121] text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Background blobs — pointer-events none, never push layout */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div
          className={`absolute -top-[10%] -left-[10%] w-[35rem] h-[35rem] rounded-full blur-[120px] ${
            darkMode ? 'bg-teal-600/15' : 'bg-teal-300/30'
          }`}
        />
        <div
          className={`absolute top-[20%] -right-[10%] w-[30rem] h-[30rem] rounded-full blur-[120px] ${
            darkMode ? 'bg-blue-600/15' : 'bg-blue-300/25'
          }`}
        />
        <div
          className={`absolute -bottom-[15%] left-[20%] w-[40rem] h-[40rem] rounded-full blur-[130px] ${
            darkMode ? 'bg-purple-600/10' : 'bg-purple-300/20'
          }`}
        />
      </div>

      {/* MAIN ROW: sidebar + chat — same height, no double scroll */}
      <div className="relative z-10 flex h-full w-full min-w-0">
        <Sidebar />

        {/* Chat side takes remaining space only */}
        <main className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
          <ChatArea />
        </main>
      </div>
    </div>
  );
}
