import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg border transition-all ${
        isDark
          ? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-300 hover:bg-[#242424]'
          : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
      }`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
