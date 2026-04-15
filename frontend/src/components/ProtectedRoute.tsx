import {Navigate} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {UserRole} from '../types';
import {refreshSession} from '../services/auth';

const ProtectedRoute = ({
	children,
	allowedRoles,
}: {
	children: JSX.Element;
	allowedRoles?: UserRole[];
}) => {
	const [isLoading, setIsLoading] = useState(true);
	const [role, setRole] = useState<UserRole | null>(null);

	useEffect(() => {
		let mounted = true;

		void refreshSession().then((user) => {
			if (!mounted) return;
			setRole(user?.role ?? null);
			setIsLoading(false);
		});

		return () => {
			mounted = false;
		};
	}, []);

	if (isLoading) {
		return null;
	}

	if (!role) {
		return <Navigate to="/login" replace />;
	}

	if (allowedRoles && allowedRoles.length > 0 && (!role || !allowedRoles.includes(role))) {
		return <Navigate to="/unauthorized" replace />;
	}

	return children;
};

export default ProtectedRoute;
