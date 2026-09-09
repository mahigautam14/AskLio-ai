import React from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import useStore from '../store/useStore';

const ChatPage = () => {
  const { darkMode } = useStore();

  return (
    <div
      className={`flex h-screen overflow-hidden relative transition-colors duration-500 ${
        darkMode ? 'bg-[#0B1121] text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 🔥 FIXED: Background Animated Blobs (Now perfectly visible in both modes) */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full filter blur-[120px] animate-blob ${
          darkMode ? 'bg-teal-600/20 mix-blend-screen' : 'bg-teal-300/40 mix-blend-multiply'
        }`}></div>
        
        <div className={`absolute top-[20%] right-[-10%] w-[30rem] h-[30rem] rounded-full filter blur-[120px] animate-blob animation-delay-2000 ${
          darkMode ? 'bg-blue-600/20 mix-blend-screen' : 'bg-blue-300/40 mix-blend-multiply'
        }`}></div>
        
        <div className={`absolute bottom-[-15%] left-[20%] w-[40rem] h-[40rem] rounded-full filter blur-[130px] animate-blob animation-delay-4000 ${
          darkMode ? 'bg-purple-600/20 mix-blend-screen' : 'bg-purple-300/40 mix-blend-multiply'
        }`}></div>
      </div>

      {/* Main Layout Layer */}
      <div className="flex w-full h-full z-10 relative">
        <Sidebar />
        <ChatArea />
      </div>
    </div>
  );
};

export default ChatPage;