import { Navigate } from 'react-router-dom';
import { getHomeRouteByRole, getStoredUserRole, hasValidSession } from '../services/auth';

const PublicRoute = ({ children }: { children: JSX.Element }) => {
    if (hasValidSession()) {
        const role = getStoredUserRole();
        return <Navigate to={getHomeRouteByRole(role)} replace />;
    }
    return children;
};

export default PublicRoute;