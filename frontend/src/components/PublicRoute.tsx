import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getHomeRouteByRole, refreshSession } from '../services/auth';

const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [redirectPath, setRedirectPath] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        void refreshSession().then((user) => {
            if (!mounted) return;
            if (user?.role) {
                setRedirectPath(getHomeRouteByRole(user.role));
            }
            setIsLoading(false);
        });

        return () => {
            mounted = false;
        };
    }, []);

    if (isLoading) {
        return null;
    }

    if (redirectPath) {
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default PublicRoute;