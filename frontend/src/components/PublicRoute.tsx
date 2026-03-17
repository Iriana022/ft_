import { Navigate } from 'react-router-dom';
import { getHomeRouteByRole, getStoredUserRole } from '../services/auth';

const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem('access_token');
    const role = getStoredUserRole();

    if (token) {
        // connected ? go to proper area by role
        return <Navigate to={getHomeRouteByRole(role)} replace />;
    }

    return children;
};

export default PublicRoute;