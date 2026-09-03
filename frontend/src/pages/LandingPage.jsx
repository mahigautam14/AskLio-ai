import { Link } from 'react-router-dom';
import {
  HiArrowRight,
  HiSparkles,
  HiShieldCheck,
  HiChatAlt2,
  HiCode,
  HiClock,
} from 'react-icons/hi';

const features = [
  {
    icon: <HiChatAlt2 className="w-5 h-5" />,
    title: 'Smart Chat UI',
    desc: 'Clean ChatGPT-like interface with sidebar, history, and streaming replies.',
  },
  {
    icon: <HiCode className="w-5 h-5" />,
    title: 'Markdown + Code',
    desc: 'Beautiful rendering for code blocks, inline code, and technical answers.',
  },
  {
    icon: <HiClock className="w-5 h-5" />,
    title: 'Fast Responses',
    desc: 'Streaming output gives a smooth real-time AI chat experience.',
  },
  {
    icon: <HiShieldCheck className="w-5 h-5" />,
    title: 'JWT Auth',
    desc: 'Secure login/signup flow with protected user conversations.',
  },
];

const prompts = [
  'Explain React hooks simply',
  'Write a Python API example',
  'Debug my JavaScript code',
  'Help me write an email',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.20),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_28%)]" />
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px]" />

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-teal-600 flex items-center justify-center font-bold shadow-lg shadow-teal-600/30">
            A
          </div>
          <div>
            <div className="text-lg font-semibold leading-none">AskLio</div>
            <div className="text-xs text-slate-400 mt-1">AI Chat Assistant</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold hover:bg-teal-500 transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:pt-16">
        {/* Left */}
        <section>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-2 text-sm text-teal-200">
            <HiSparkles className="w-4 h-4" />
            Built for demos, interviews, and real chat workflows
          </div>

          <h1 className="max-w-xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            A clean AI assistant for coding, learning, and everyday help.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
            AskLio is a modern chatbot with login, chat history, streaming responses,
            markdown rendering, and a polished responsive interface.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-semibold hover:bg-teal-500 transition-colors"
            >
              Start chatting
              <HiArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10 transition-colors"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {prompts.map((prompt) => (
              <span
                key={prompt}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
              >
                {prompt}
              </span>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {features.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600/20 text-teal-300">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Right preview */}
        <section className="lg:pl-8">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-teal-950/20 backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-sm text-slate-400">Live preview</div>
                <div className="text-lg font-semibold">Chat workspace</div>
              </div>
              <div className="rounded-full bg-teal-600/15 px-3 py-1 text-xs font-medium text-teal-200">
                Streaming on
              </div>
            </div>

            <div className="space-y-4 py-5">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-teal-600 px-4 py-3 text-sm leading-6 text-white">
                Explain React hooks in simple words with a small example.
              </div>

              <div className="max-w-[88%] rounded-2xl rounded-bl-md bg-slate-800 px-4 py-3 text-sm leading-6 text-slate-100">
                Sure — hooks let function components use state and lifecycle features.
                For example, <span className="font-mono text-teal-300">useState</span>{' '}
                stores data, and{' '}
                <span className="font-mono text-teal-300">useEffect</span> runs side
                effects.
              </div>

              <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-slate-700 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-100">
                <div className="mb-2 text-xs uppercase tracking-wider text-slate-400">
                  Example
                </div>
                <pre className="overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-200">
{`const [count, setCount] = useState(0);

useEffect(() => {
  console.log("count changed");
}, [count]);`}
                </pre>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-center">
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-xl font-bold text-white">JWT</div>
                <div className="mt-1 text-xs text-slate-400">Auth</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-xl font-bold text-white">SSE</div>
                <div className="mt-1 text-xs text-slate-400">Streaming</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-xl font-bold text-white">SQLite</div>
                <div className="mt-1 text-xs text-slate-400">Storage</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}