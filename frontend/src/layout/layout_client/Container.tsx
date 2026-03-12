import React from "react";

interface ContainerProps {
	children: React.ReactNode;
}

function ContainerComp({children}: ContainerProps) {
	return (
		<div className="px-4 mx-auto max-w-7xl">
			{children}
		</div>
	);
}

export default ContainerComp;
