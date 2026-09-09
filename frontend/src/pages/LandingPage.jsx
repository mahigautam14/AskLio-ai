import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiArrowRight, HiSparkles, HiShieldCheck, HiChatAlt2, 
  HiCode, HiClock, HiCube, HiSun, HiMoon, HiMenu, HiX
} from 'react-icons/hi';
import useStore from '../store/useStore';

/* ═════════ SOOTHING AURORA ORBS (Different for Light & Dark) ═════════ */
function AuroraOrbs({ darkMode }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className={`absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] ${
          darkMode ? 'bg-fuchsia-600/20' : 'bg-sky-300/40' // Soft Sky Blue in Light
        }`}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={`absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] ${
          darkMode ? 'bg-violet-600/20' : 'bg-teal-200/50' // Soft Teal in Light
        }`}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={`absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full blur-[130px] ${
          darkMode ? 'bg-pink-500/15' : 'bg-indigo-200/40' // Soft Indigo in Light
        }`}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

/* ═════════ FLOATING PARTICLES (Soothing colors for Light) ═════════ */
function FloatingDots({ darkMode }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            // Colors adjust based on theme
            background: darkMode 
              ? ['#d946ef', '#a855f7', '#ec4899'][Math.floor(Math.random() * 3)] // Pink/Purple
              : ['#38bdf8', '#2dd4bf', '#818cf8'][Math.floor(Math.random() * 3)], // Sky/Teal/Indigo
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: `0 0 ${darkMode ? '10px' : '4px'} currentColor`,
          }}
          animate={{ y: [0, -40, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}
    </div>
  );
}

/* ═════════ TYPEWRITER ═════════ */
function TypewriterText({ darkMode }) {
  const words = ['coding', 'learning', 'debugging', 'writing', 'creating'];
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrentWord((p) => (p + 1) % words.length), 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={words[currentWord]}
        initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
        transition={{ duration: 0.3 }}
        className={`bg-clip-text text-transparent inline-block ${
          darkMode 
            ? 'bg-gradient-to-r from-fuchsia-400 via-purple-400 to-pink-400' 
            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500' // Darker, readable text in light mode
        }`}
      >
        {words[currentWord]}
      </motion.span>
    </AnimatePresence>
  );
}

/* ═════════ LIVE CHAT PREVIEW ═════════ */
const demoChat = [
  { role: 'user', text: 'Explain React hooks in simple words with an example.' },
  { role: 'assistant', text: 'Hooks let function components use state and lifecycle features.' },
  { role: 'code', text: `const [count, setCount] = useState(0);\n\nuseEffect(() => {\n  console.log("count:", count);\n}, [count]);` },
];

function LiveChatPreview({ darkMode }) {
  const [shown, setShown] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx >= demoChat.length) {
      const t = setTimeout(() => { setShown([]); setIdx(0); }, 5000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setShown((p) => [...p, demoChat[idx]]);
      setIdx((p) => p + 1);
    }, idx === 0 ? 800 : 1500);
    return () => clearTimeout(t);
  }, [idx]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, type: 'spring' }}
      className={`rounded-3xl border p-5 sm:p-6 backdrop-blur-xl relative transition-all duration-500 ${
        darkMode 
          ? 'bg-slate-900/80 border-white/10 shadow-[0_0_50px_rgba(217,70,239,0.15)]' 
          : 'bg-white/80 border-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]' // Soft shadow for light mode
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between border-b pb-4 mb-4 ${darkMode ? 'border-white/10' : 'border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div>
            <div className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Live preview</div>
            <div className={`text-sm font-bold bg-clip-text text-transparent ${darkMode ? 'bg-gradient-to-r from-fuchsia-400 to-pink-400' : 'bg-gradient-to-r from-blue-600 to-teal-500'}`}>AskLio Chat</div>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${darkMode ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${darkMode ? 'bg-fuchsia-400' : 'bg-blue-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${darkMode ? 'bg-fuchsia-500' : 'bg-blue-500'}`}></span>
          </span>
          Streaming
        </div>
      </div>

      {/* Chat Area */}
      <div className="space-y-4 min-h-[280px]">
        <AnimatePresence>
          {shown.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3 }}>
              {msg.role === 'user' && (
                <div className={`ml-auto max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white shadow-md ${
                  darkMode ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500' : 'bg-gradient-to-r from-blue-600 to-teal-500'
                }`}>
                  {msg.text}
                </div>
              )}
              {msg.role === 'assistant' && (
                <div className={`max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm shadow-sm border ${
                  darkMode ? 'bg-slate-800 text-slate-200 border-transparent' : 'bg-white text-slate-700 border-slate-100'
                }`}>
                  {msg.text} <span className={`font-mono ${darkMode ? 'text-fuchsia-400' : 'text-blue-600'}`}>useState</span> stores data.
                </div>
              )}
              {msg.role === 'code' && (
                <div className={`max-w-[90%] rounded-xl px-4 py-3 border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <pre className={`text-xs leading-5 font-mono overflow-x-auto ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{msg.text}</pre>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {shown.length > 0 && shown.length < demoChat.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex items-center gap-1 max-w-[60px] rounded-2xl px-4 py-3 shadow-sm border ${darkMode ? 'bg-slate-800 border-transparent' : 'bg-white border-slate-100'}`}>
            {[0, 1, 2].map((d) => (
              <motion.div key={d} className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-fuchsia-400' : 'bg-blue-400'}`} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }} />
            ))}
          </motion.div>
        )}
      </div>

      <div className={`mt-6 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm ${darkMode ? 'bg-slate-900/50 border-white/10 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
        <div className="flex-1 text-sm">Ask Lio anything…</div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${darkMode ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500' : 'bg-gradient-to-r from-blue-600 to-teal-500'}`}>
          <HiArrowRight className="w-4 h-4 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

/* ═════════════════════ MAIN PAGE ═════════════════════ */
export default function LandingPage() {
  const { darkMode, toggleDarkMode } = useStore();
  const [mobileMenu, setMobileMenu] = useState(false);

  // Features list - colors adapt automatically
  const features = [
    { icon: <HiChatAlt2 />, title: 'Smart Chat UI', desc: 'ChatGPT-like interface with history and streaming.' },
    { icon: <HiCode />, title: 'Markdown + Code', desc: 'Beautiful rendering for code blocks and technical answers.' },
    { icon: <HiClock />, title: 'Fast Responses', desc: 'Streaming output gives a smooth real-time AI experience.' },
    { icon: <HiShieldCheck />, title: 'Secure Auth', desc: 'JWT authentication with protected user sessions.' },
    { icon: <HiCube />, title: 'PostgreSQL', desc: 'Production-grade database for reliable persistence.' },
    { icon: <HiSparkles />, title: 'AI Powered', desc: 'Powered by advanced LLMs for blazing-fast responses.' },
  ];

  return (
    <div className={`min-h-screen overflow-x-hidden font-sans transition-colors duration-700 relative ${
      darkMode ? 'bg-[#0B1121] text-white' : 'bg-[#F8FAFC] text-slate-800'
    }`}>
      
      {/* Background Layers */}
      {darkMode ? (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1121] via-[#131B2F] to-[#0B1121] z-0" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#F1F5F9] via-[#FFFFFF] to-[#F8FAFC] z-0" />
      )}
      
      {/* Faint Grid */}
      <div className={`absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] ${darkMode ? 'opacity-30' : 'opacity-50'}`} />
      
      {/* Animations */}
      <AuroraOrbs darkMode={darkMode} />
      <FloatingDots darkMode={darkMode} />

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-xl border-b transition-colors duration-500 ${
        darkMode ? 'bg-[#0B1121]/70 border-white/5' : 'bg-white/70 border-slate-200/80 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform ${
              darkMode ? 'bg-gradient-to-br from-fuchsia-500 to-pink-500 shadow-fuchsia-500/30' : 'bg-gradient-to-br from-blue-600 to-teal-500 shadow-blue-500/20'
            }`}>
              <span className="text-white font-black text-xl">A</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight">AskLio</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={toggleDarkMode} className={`p-2.5 rounded-full transition-colors shadow-sm border ${
              darkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700 border-slate-700' : 'bg-white border-slate-200 text-indigo-500 hover:bg-slate-50'
            }`}>
              {darkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            </button>
            <Link to="/login" className={`font-semibold transition-colors ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Sign in</Link>
            <Link to="/signup" className={`px-6 py-2.5 rounded-xl text-white font-bold shadow-lg hover:-translate-y-0.5 transition-all ${
              darkMode ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 shadow-fuchsia-500/25' : 'bg-gradient-to-r from-blue-600 to-teal-500 shadow-blue-500/25'
            }`}>
              Get Started
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button onClick={toggleDarkMode} className={`p-2 rounded-full ${darkMode ? 'text-amber-400' : 'text-indigo-500'}`}>
              {darkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            </button>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="p-2">
              {mobileMenu ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex-1 text-center lg:text-left w-full">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 text-xs sm:text-sm font-semibold shadow-sm ${
              darkMode ? 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-300' : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              <HiSparkles className="w-4 h-4 animate-pulse" /> Powered by PostgreSQL + Streaming AI
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Your AI assistant <br className="hidden lg:block" />
              for <span className="inline-block min-w-[200px]"><TypewriterText darkMode={darkMode} /></span> <br />
              <span className={`bg-clip-text text-transparent ${darkMode ? 'bg-gradient-to-r from-slate-300 to-slate-500' : 'bg-gradient-to-r from-slate-500 to-slate-800'}`}>and beyond.</span>
            </h1>

            <p className={`text-lg sm:text-xl mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              AskLio is a production-ready AI chatbot with JWT auth, streaming responses, markdown rendering, and rock-solid persistence.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link to="/signup" className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 hover:scale-105 transition-all ${
                darkMode ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:shadow-[0_0_30px_rgba(217,70,239,0.4)]' : 'bg-gradient-to-r from-blue-600 to-teal-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]'
              }`}>
                Start chatting free <HiArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className={`w-full sm:w-auto px-8 py-4 rounded-2xl border font-bold text-lg flex items-center justify-center transition-all ${
                darkMode ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-white' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-sm'
              }`}>
                Sign in
              </Link>
            </div>
          </motion.div>

          <div className="flex-1 w-full max-w-2xl lg:max-w-none">
            <LiveChatPreview darkMode={darkMode} />
          </div>

        </div>
      </main>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`p-6 sm:p-8 rounded-3xl border transition-all hover:-translate-y-1 ${
                darkMode ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-xl'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl mb-6 shadow-md ${
                darkMode ? 'bg-gradient-to-br from-fuchsia-500 to-pink-500' : 'bg-gradient-to-br from-blue-500 to-teal-400'
              }`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className={`rounded-3xl border p-10 sm:p-14 text-center backdrop-blur-xl relative overflow-hidden shadow-2xl ${
          darkMode ? 'border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-950/40 to-pink-950/40' : 'border-blue-200 bg-gradient-to-br from-blue-50 to-teal-50'
        }`}>
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to try <span className={`bg-clip-text text-transparent ${darkMode ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500' : 'bg-gradient-to-r from-blue-600 to-teal-500'}`}>AskLio</span>?
          </h2>
          <p className={`mt-4 max-w-xl mx-auto ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Sign up for free and start chatting with an AI that remembers your conversations and responds in real-time.</p>
          <Link to="/signup" className={`mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-bold text-white shadow-xl hover:scale-105 transition-transform ${
            darkMode ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 shadow-fuchsia-500/30' : 'bg-gradient-to-r from-blue-600 to-teal-500 shadow-blue-500/30'
          }`}>
            Get started for free <HiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}