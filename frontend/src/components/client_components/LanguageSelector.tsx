import React, {useState} from "react";
import esFlag from '../../../public/assets/es.png';
import frFlag from '../../../public/assets/fr.png';
import usFlag from '../../../public/assets/us.png';
import {ChevronDownIcon} from "@heroicons/react/24/outline";

type Lang = {
	code: string;
	label: string;
	flag: string;
};

const languages: Lang[] = [
	{code: "en", label: "English", flag: usFlag},
	{code: "fr", label: "Français", flag: frFlag},
	{code: "es", label: "Español", flag: esFlag},
];

function LanguageSelector() {
	const [open, setOpen] = useState(false);
	const [current, setCurrent] = useState(languages[0]);

	function toggle() {
		setOpen(!open);
	}

	function selectLang(lang: Lang) {
		setCurrent(lang);
		setOpen(false);
	}

	return (
		<div className="relative w-35">
			<button
				onClick={toggle}
				className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-gray-100 border rounded shadow-sm hover:bg-gray-200"
			>
				<div className="flex items-center gap-2">
					<img src={current.flag} className="w-5 h-auto" />
					<span className="text-sm">{current.label}</span>
				</div>

				<ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
			</button>

			<div
				className={`
					absolute mt-2 w-full bg-cream border rounded-lg shadow-lg overflow-hidden z-10
					origin-top transform transition-all duration-200
					${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
				`}
			>
				{languages.map((lang) => (
					<button
						key={lang.code}
						onClick={() => selectLang(lang)}
						className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left"
					>
						<img src={lang.flag} className="w-6 h-auto" />
						<span className="text-sm">{lang.label}</span>
					</button>
				))}
			</div>
		</div>
	);
}

export default LanguageSelector;
