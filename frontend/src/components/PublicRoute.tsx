import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem('access_token');

    if (token) {
        // connected ? go to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PublicRoute;