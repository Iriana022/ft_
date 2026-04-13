import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { clearAuthStorage, getHomeRouteByRole, getRoleFromToken } from '../../services/auth';

export function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const error = searchParams.get('error');
        const token = searchParams.get('token');
        const next = searchParams.get('next');

        if (error === 'email_exists_google') {
            clearAuthStorage();
            navigate('/login?error=email_exists_google', { replace: true });
            return;
        }
        if (token) {
            localStorage.setItem('access_token', token);
            window.dispatchEvent(new Event('auth-token-updated'));
            localStorage.removeItem('user_avatar');
            if (next === 'select_role') {
                localStorage.removeItem('user_role');
                navigate('/select_role', { replace: true });
                return;
            }
            const handleProfileSync = async () => {
                try {
                    const meResponse = await api.get('/auth/me');
                    const username = meResponse.data?.username;
                    const role = meResponse.data?.role ?? getRoleFromToken(token);
                    
                    if (username) localStorage.setItem('username', username);
                    if (role) localStorage.setItem('user_role', role);
                    navigate(getHomeRouteByRole(role));
                } catch (profileErr) {
                    console.warn('Erreur profil après Google:', profileErr);
                    const role = getRoleFromToken(token);
                    if (role) {
                        localStorage.setItem('user_role', role);
                        navigate(getHomeRouteByRole(role), { replace: true });
                        return;
                    }
                    clearAuthStorage();
                    navigate('/login?error=google_failed', { replace: true });
                }
            };

            handleProfileSync();
        } else {
            clearAuthStorage();
            navigate('/login?error=google_failed', { replace: true });
            return;
        }
    }, [searchParams, navigate]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#121212]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
        </div>
    );
}