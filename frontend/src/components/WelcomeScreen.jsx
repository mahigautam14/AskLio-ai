import React from 'react';
import { motion } from 'framer-motion';
import { HiCode, HiLightBulb, HiPencilAlt, HiAcademicCap, HiSparkles } from 'react-icons/hi';
import useStore from '../store/useStore';

const prompts = [
  {
    title: 'Build with Code',
    description: 'Create, debug, or improve your code',
    icon: HiCode,
    color: 'text-blue-500 dark:text-blue-400',
    bg: 'bg-blue-500/15 dark:bg-blue-400/15',
    prompt: 'Help me write clean, working code. Ask what I want to build.',
  },
  {
    title: 'Explain Something',
    description: 'Break down complex topics simply',
    icon: HiLightBulb,
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-500/15 dark:bg-amber-400/15',
    prompt: 'Explain a complex topic in simple language with examples.',
  },
  {
    title: 'Write with Me',
    description: 'Draft emails, messages, and posts',
    icon: HiPencilAlt,
    color: 'text-teal-500 dark:text-teal-400',
    bg: 'bg-teal-500/15 dark:bg-teal-400/15',
    prompt: 'Help me write a clear and professional message.',
  },
  {
    title: 'Learn Something',
    description: 'Understand any topic step by step',
    icon: HiAcademicCap,
    color: 'text-purple-500 dark:text-purple-400',
    bg: 'bg-purple-500/15 dark:bg-purple-400/15',
    prompt: 'Teach me a topic step by step with a short example.',
  },
];

export default function WelcomeScreen({ onSendMessage }) {
  const { darkMode } = useStore();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4 py-8 sm:px-6">
      {/* CUTE ANIMATED SPARKLE LOGO */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 rounded-2xl bg-teal-400/40 blur-xl" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 shadow-xl shadow-teal-500/25 border border-white/30 backdrop-blur-md">
          <HiSparkles className="h-7 w-7 text-white drop-shadow" />
        </div>
      </motion.div>

      <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight text-center ${darkMode ? 'text-white' : 'text-slate-900'}`}>
        Hey, I'm Lio <span className="inline-block">👋</span>
      </h1>
      <p className={`mt-2 mb-8 text-sm text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        What can I help you with today?
      </p>

      {/* 🚀 APPLE/iPHONE GLASSMORPHISM CARDS */}
      <div className="grid w-full max-w-2xl grid-cols-1 sm:grid-cols-2 gap-3.5">
        {prompts.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => onSendMessage(item.prompt)}
              className={`group flex h-[100px] items-start gap-3.5 rounded-2xl border p-4 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                darkMode
                  ? 'border-white/10 bg-slate-900/30 hover:bg-slate-800/40 hover:border-teal-500/40 shadow-lg shadow-black/20'
                  : 'border-white/60 bg-white/30 hover:bg-white/50 hover:border-teal-400/40 shadow-lg shadow-slate-900/5'
              }`}
            >
              <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color} backdrop-blur-md transition-transform group-hover:scale-110`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`text-[15px] font-semibold leading-5 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                  {item.title}
                </h3>
                <p className={`mt-1 text-xs leading-relaxed line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
