interface SeparatorProps {
	color?: string
}

function Separator({color = "bg-dark/15"}: SeparatorProps) {
	return (
		<div className={`h-[1px] w-full ${color} my-4 shadow-[0_2px_4px_rgba(0,0,0,0.1)]`}>
		</div>
	);
}

export default Separator;
