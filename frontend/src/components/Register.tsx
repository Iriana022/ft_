import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { RegisterCard } from './RegisterCard';

export default function Register() {
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	return (
		<div className={`min-h-screen w-full flex items-center justify-center p-8 transition-colors duration-300 ${
			isDark 
				? 'bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]' 
				: 'bg-gradient-to-br from-gray-50 to-gray-100'
		}`}>
			<RegisterCard />
		</div>
	);
}