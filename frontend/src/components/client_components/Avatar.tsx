interface AvatarProps {
	src: string,
	size?: "xs" | "sm" | "md" | "lg" | "xl",
}

const sizes = {
	xs: "w-6 h-6",
	sm: "w-8 h-8",
	md: "w-12 h-12",
	lg: "w-16 h-16",
	xl: "w-24 h-24",
};

function Avatar({src, size = "md"}: AvatarProps) {
	return (
		<div
			className={`${sizes[size]} border border-2 border-sky
			focus:border-navy/80 transition
			block rounded-full overflow-hidden group`}
		>
			<img
				alt="User avatar"
				src={src}
				className="w-full h-full object-cover transition hover:scale-108"
			/>
		</div>
	);
}

export default Avatar;
