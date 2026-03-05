import {BellIcon} from '@heroicons/react/24/outline';
import {Link} from 'react-router-dom';

function Notification() {
	return (
		<Link to='/' className="w-8 h-8 border border-gray-300 transition hover:border-navy/30 flex items-center justify-center rounded shadow-sm shadow-navy/40 group">
			<BellIcon className="w-6 h-6 text-gray-600 transition group-hover:scale-108" />
		</Link>
	);
}

export default Notification;
