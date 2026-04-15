import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { clearAuthStorage, getHomeRouteByRole, refreshSession } from '../../services/auth';

export function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const error = searchParams.get('error');
        const next = searchParams.get('next');

        if (error === 'email_exists_google') {
            clearAuthStorage();
            navigate('/login?error=email_exists_google', { replace: true });
            return;
        }

        const syncGoogleSession = async () => {
            try {
                const user = await refreshSession(true);
                if (!user?.role) {
                    clearAuthStorage();
                    navigate('/login?error=google_failed', { replace: true });
                    return;
                }

                window.dispatchEvent(new Event('auth-token-updated'));

                if (next === 'select_role') {
                    navigate('/select_role', { replace: true });
                    return;
                }

                navigate(getHomeRouteByRole(user.role), { replace: true });
            } catch {
                clearAuthStorage();
                navigate('/login?error=google_failed', { replace: true });
            }
        };

        void syncGoogleSession();
    }, [searchParams, navigate]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#121212]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
        </div>
    );
}