import React, {useState} from "react";

function ThemeController() {
	const [dark, setDark] = useState(false);

	function toggle() {
		setDark(!dark);
	}

	return (
		<button
			onClick={toggle}
			className={`
					w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200
					${dark ? "bg-sky" : "bg-gray-300"}
				`}
		>
			<div
				className={`
						bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200
						${dark ? "translate-x-6" : "translate-x-0"}
					`}
			/>
		</button>
	);
}

export default ThemeController;
