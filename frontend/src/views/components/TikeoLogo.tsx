import React from 'react';
import {Link} from 'react-router-dom';

function TikeoLogo() {
	return (
		<div>
			<Link to="/client_view" className="text-5xl font-bold">
				Tikeo
			</Link>
		</div>
	);
}

export default TikeoLogo;
