import { Navigate } from 'react-router-dom';
import { UserRole } from '../types';
import { getHomeRouteByRole, getStoredUserRole } from '../services/auth';

const ProtectedRoute = ({
    children,
    allowedRoles,
}: {
    children: JSX.Element;
    allowedRoles?: UserRole[];
}) => {
    const token = localStorage.getItem('access_token');
    const role = getStoredUserRole();

    if (!token) {
        // !token ? redirect to login
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0 && (!role || !allowedRoles.includes(role))) {
        return <Navigate to={getHomeRouteByRole(role)} replace />;
    }

    return children;
};

export default ProtectedRoute;