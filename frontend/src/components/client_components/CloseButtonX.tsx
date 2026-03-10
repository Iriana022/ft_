import {XMarkIcon} from '@heroicons/react/24/outline';

function CloseButtonX() {
	return (
		<div className="bg-gray-100 transition hover:bg-gray-200 rounded-full p-[2px] border border-gray-200">
			<XMarkIcon className="h-5 w-5" />
		</div>
	);
}

export default CloseButtonX;
