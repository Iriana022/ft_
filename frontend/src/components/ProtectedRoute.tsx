import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem('access_token');

    if (!token) {
        // !token ? redirect to login
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;