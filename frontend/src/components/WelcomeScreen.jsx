import React from 'react';
import { motion } from 'framer-motion';
import { HiCode, HiLightBulb, HiPencilAlt, HiAcademicCap, HiSparkles } from 'react-icons/hi';
import useStore from '../store/useStore';

const prompts = [
  {
    title: 'Build with Code',
    description: 'Create, debug, or improve your code',
    icon: HiCode,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    prompt: 'Help me write clean, working code. Ask what I want to build.',
  },
  {
    title: 'Explain Something',
    description: 'Break down complex topics simply',
    icon: HiLightBulb,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    prompt: 'Explain a complex topic in simple language with examples.',
  },
  {
    title: 'Write with Me',
    description: 'Draft emails, messages, and posts',
    icon: HiPencilAlt,
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    prompt: 'Help me write a clear and professional message.',
  },
  {
    title: 'Learn Something',
    description: 'Understand any topic step by step',
    icon: HiAcademicCap,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    prompt: 'Teach me a topic step by step with a short example.',
  },
];

export default function WelcomeScreen({ onSendMessage }) {
  const { darkMode } = useStore();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4 py-8 sm:px-6">
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 rounded-2xl bg-teal-400/30 blur-lg" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 shadow-lg shadow-teal-500/25 border border-white/20">
          <HiSparkles className="h-7 w-7 text-white" />
        </div>
      </motion.div>

      <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight text-center ${darkMode ? 'text-white' : 'text-slate-900'}`}>
        Hey, I'm Lio <span className="inline-block">👋</span>
      </h1>
      <p className={`mt-2 mb-8 text-sm text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        What can I help you with today?
      </p>

      <div className="grid w-full max-w-2xl grid-cols-1 sm:grid-cols-2 gap-3">
        {prompts.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => onSendMessage(item.prompt)}
              className={`group flex h-[100px] items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                darkMode
                  ? 'border-slate-700/40 bg-slate-800/40 hover:bg-slate-800/80 hover:border-teal-500/40'
                  : 'border-slate-200/80 bg-white hover:border-teal-400/50 hover:bg-slate-50/50'
              }`}
            >
              <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color} transition-transform group-hover:scale-110`}>
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
