import {useState, useRef, useEffect} from "react";
import {ChevronDownIcon} from "@heroicons/react/24/outline";
import i18n from "../../i18n";

const esFlag = '/assets/es.png';
const frFlag = '/assets/fr.png';
const usFlag = '/assets/us.png';

type Lang = {
	code: string;
	label: string;
	flag: string;
};

const languages: Lang[] = [
	{code: "fr", label: "Français", flag: frFlag},
	{code: "en", label: "English", flag: usFlag},
	{code: "es", label: "Español", flag: esFlag},
];

function LanguageSelector() {
	const [open, setOpen] = useState(false);
	const [current, setCurrent] = useState(languages[0]);
	const ref = useRef<HTMLDivElement | null>(null);

	function toggle() {
		setOpen(!open);
	}

	function selectLang(lang: Lang) {
		setCurrent(lang);
		i18n.changeLanguage(lang.code);
		localStorage.setItem("lang", lang.code);
		setOpen(false);
	}

	useEffect(() => {
		function handleClikcOutside(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClikcOutside);
		return () => {
			document.addEventListener("mousedown", handleClikcOutside);
		}
	}, [])

	return (
		<div ref={ref} className="relative">
			<button
				onClick={toggle}
				className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-gray-100 border rounded shadow-sm hover:bg-gray-200"
			>
				<div className="flex items-center gap-2">
					<img src={current.flag} className="w-5 h-auto" />
					<span className="text-sm">{current.label}</span>
				</div>

				<ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
			</button >

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
		</div >
	);
}

export default LanguageSelector;
