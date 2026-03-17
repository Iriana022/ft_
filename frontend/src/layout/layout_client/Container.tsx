import React from "react";

interface ContainerProps {
	children: React.ReactNode,
	bgColor?: string,
}

function ContainerComp({children, bgColor = "inherit"}: ContainerProps) {
	return (
		<div className={`px-4 mx-auto max-w-7xl ${bgColor}`}>
			{children}
		</div>
	);
}

export default ContainerComp;
