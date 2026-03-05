import {type HeroIconType} from '../../types/index';

interface ButtonProps {
	text: string,
	bgColor: string,
	textColor: string,
	icon?: HeroIconType,
}

function Button({text, bgColor, textColor, icon: Icon}: ButtonProps) {
	return (
		<button className={`${bgColor} ${textColor} flex items-center justify-center w-[250px] p-4 rounded-md cursor-pointer transition-transform duration-200 easy-in-out hover:scale-[1.02]`}>
			<div className="flex items-center gap-2">
				{Icon && <Icon className="w-8 h-8" />}
				<span className="text-base font-semibold">
					{text}
				</span>
			</div>
		</button>
	);
}

export default Button;
