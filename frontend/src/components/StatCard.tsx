import type { LucideIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600'
};

const colorClassesDark = {
  blue: 'bg-blue-600/20 text-blue-400',
  green: 'bg-green-600/20 text-green-400',
  orange: 'bg-orange-600/20 text-orange-400',
  red: 'bg-red-600/20 text-red-400',
  purple: 'bg-purple-600/20 text-purple-400'
};

export function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={`rounded-xl border p-6 hover:shadow-md transition-shadow ${
      isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
          <h3 className={`text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${isDark ? colorClassesDark[color] : colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
