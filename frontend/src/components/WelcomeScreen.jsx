import { HiCode, HiLightBulb, HiPencilAlt, HiAcademicCap } from 'react-icons/hi';
import lionLogo from "../assets/lio-jpg.jpg";

const suggestions = [
  {
    icon: <HiCode className="w-5 h-5" />,
    title: "💻 Build with Code",
    prompt: "Create, debug, or improve your code",
  },
  {
    icon: <HiLightBulb className="w-5 h-5" />,
    title: "🧠 Explain Something",
    prompt: "Break down complex topics into simple terms",
  },
  {
    icon: <HiPencilAlt className="w-5 h-5" />,
    title: "✍️ Write with Me",
    prompt: "Draft emails, messages, posts, and more",
  },
  {
    icon: <HiAcademicCap className="w-5 h-5" />,
    title: "📚 Learn Something",
    prompt: "Understand any topic with clear explanations",
  },
];

export default function WelcomeScreen({ onSendMessage }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-10">
        <div className="w-18 h-18 rounded-3xl overflow-hidden bg-[#0f172a] flex items-center justify-center mx-auto mb-4 shadow-lg ring-2 ring-[#D4A43A]/30">
          <img
            src={lionLogo}
            alt="Lio Logo"
            className="w-full h-full object-cover"
  />
</div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2"> Hey, I'm Lio 👋</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
          What can I help you with today?        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
        {suggestions.map((item, index) => (
          <button
            key={index}
            onClick={() => onSendMessage(item.prompt)}
            className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left group"
          >
            <div className="text-teal-600 dark:text-teal-500 mt-0.5">
              {item.icon}
            </div>
            <div>
              <p className="font-medium text-sm mb-1">{item.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {item.prompt}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}