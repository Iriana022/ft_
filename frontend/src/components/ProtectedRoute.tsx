import { Navigate } from 'react-router-dom';
import { UserRole } from '../types';
import { getHomeRouteByRole, getStoredUserRole, hasValidSession } from '../services/auth';

const ProtectedRoute = ({
    children,
    allowedRoles,
}: {
    children: JSX.Element;
    allowedRoles?: UserRole[];
}) => {
    if (!hasValidSession()) {
        return <Navigate to="/login" replace />;
    }
    
    const role = getStoredUserRole();
    if (allowedRoles && allowedRoles.length > 0 && (!role || !allowedRoles.includes(role))) {
        return <Navigate to={getHomeRouteByRole(role)} replace />;
    }

    return children;
};

export default ProtectedRoute;