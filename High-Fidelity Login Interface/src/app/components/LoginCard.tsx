import { Mail, Lock, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

interface LoginCardProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function LoginCard({ theme, onThemeChange }: LoginCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isDark = theme === 'dark';

  return (
    <div
      className={`w-full max-w-md p-8 rounded-2xl transition-all relative ${
        isDark
          ? 'bg-[#121212] border border-[#2a2a2a] shadow-[0_0_40px_rgba(99,102,241,0.15)]'
          : 'bg-white border border-gray-200 shadow-[0_4px_40px_rgba(0,0,0,0.08)]'
      }`}
    >
      {/* Theme Toggle Button */}
      <button
        onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
        className={`absolute top-6 right-6 p-2 rounded-lg border transition-all ${
          isDark
            ? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-300 hover:bg-[#242424]'
            : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
        }`}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Logo Placeholder */}
      <div className="flex justify-center mb-8">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-indigo-600' : 'bg-indigo-600'
          }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              fill="white"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1
          className={`text-2xl font-bold mb-2 ${
            isDark ? 'text-gray-100' : 'text-gray-900'
          }`}
        >
          Welcome back
        </h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Sign in to your account to continue
        </p>
      </div>

      {/* Email Field */}
      <div className="mb-4">
        <Label
          htmlFor={`email-${theme}`}
          className={`mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
        >
          Email
        </Label>
        <div className="relative">
          <Mail
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}
          />
          <Input
            id={`email-${theme}`}
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`pl-10 h-11 ${
              isDark
                ? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-100 placeholder:text-gray-600 focus:border-indigo-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600'
            }`}
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="mb-2">
        <Label
          htmlFor={`password-${theme}`}
          className={`mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
        >
          Password
        </Label>
        <div className="relative">
          <Lock
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}
          />
          <Input
            id={`password-${theme}`}
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`pl-10 pr-10 h-11 ${
              isDark
                ? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-100 placeholder:text-gray-600 focus:border-indigo-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Forgot Password Link */}
      <div className="mb-6 text-right">
        <a
          href="#"
          className={`text-sm hover:underline ${
            isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
          }`}
        >
          Forgot Password?
        </a>
      </div>

      {/* Sign In Button */}
      <Button
        className={`w-full h-11 mb-6 font-semibold ${
          isDark
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        Sign In
      </Button>

      {/* Separator */}
      <div className="relative mb-6">
        <Separator className={isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'} />
        <span
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-sm ${
            isDark ? 'bg-[#121212] text-gray-500' : 'bg-white text-gray-500'
          }`}
        >
          Or continue with
        </span>
      </div>

      {/* Social Auth Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          className={`h-11 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
            isDark
              ? 'border-[#2a2a2a] hover:bg-[#1a1a1a] text-gray-300'
              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z"
              fill="#4285F4"
            />
            <path
              d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z"
              fill="#34A853"
            />
            <path
              d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z"
              fill="#FBBC05"
            />
            <path
              d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z"
              fill="#EA4335"
            />
          </svg>
          <span>Google</span>
        </button>

        <button
          className={`h-11 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
            isDark
              ? 'border-[#2a2a2a] hover:bg-[#1a1a1a] text-gray-300'
              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M16.365 7.708c-.03.78.214 1.673.734 2.679.52 1.007 1.148 1.856 1.884 2.549-1.387 1.828-2.954 2.742-4.702 2.742-.78 0-1.673-.26-2.679-.78-1.006-.52-1.833-.78-2.481-.78-.737 0-1.62.26-2.648.78s-1.884.78-2.564.78c-1.817 0-3.47-.943-4.961-2.83C-1.967 11.05-2.613 9.079-2.613 7c0-1.817.52-3.31 1.56-4.48C-.014 1.352 1.267.767 2.8.767c.78 0 1.75.26 2.909.78 1.159.52 1.97.78 2.435.78.423 0 1.263-.286 2.52-.858 1.257-.572 2.314-.83 3.17-.773 1.49.086 2.69.63 3.603 1.633-.92.63-1.65 1.34-2.193 2.13-.543.79-.815 1.65-.879 2.58-.064.93.143 1.79.622 2.58.479.79 1.093 1.413 1.843 1.868.428.343.743.615.943.815z" />
          </svg>
          <span>Apple</span>
        </button>
      </div>

      {/* Create Account Link */}
      <div className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Don't have an account?{' '}
        <a
          href="#"
          className={`font-semibold hover:underline ${
            isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
          }`}
        >
          Create an account
        </a>
      </div>
    </div>
  );
}