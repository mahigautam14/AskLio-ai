export default function TypingIndicator() {
  return (
    <div className="flex gap-3 py-4 px-4 md:px-8">
      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
        C
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="typing-indicator flex gap-1">
          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
        </div>
      </div>
    </div>
  );
}