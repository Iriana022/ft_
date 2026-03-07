import React from 'react';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

function SearchInput() {
	return (
		<div className="relative flex items-center">
			<MagnifyingGlassIcon className="absolute left-3 w-6 h-6 text-gray-500" />
			<input
				type="search"
				placeholder="Rechercher un ticket"
				className="text-sm border border-gray-120 rounded-full bg-gray-100 pl-10 py-3" />
		</div>
	);
}

export default SearchInput;
