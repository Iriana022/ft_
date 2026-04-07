import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { clearAuthStorage, getHomeRouteByRole, getRoleFromToken } from '../../services/auth';
// import { getHomeRouteByRole, getRoleFromToken } from '../../services/auth';
// import { UserRole } from '../../types';

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
            // --- ON SUIT TA LOGIQUE EXACTE DU LOGIN CARD ---
            localStorage.setItem('access_token', token);
            localStorage.removeItem('user_avatar');
            if (next === 'select_role') {
                localStorage.removeItem('user_role');
                navigate('/select_role', { replace: true });
                return;
            }
            const handleProfileSync = async () => {
                try {
                    const meResponse = await api.get('/auth/me');
                    // console.log("meResponse:", meResponse)
                    const username = meResponse.data?.username;
                    // console.log("username:", username);
                    // const role = UserRole.CLIENT;
                    const role = meResponse.data?.role ?? getRoleFromToken(token);
                    // console.log("role:", role);
                    const profileResponse = await api.get('/user/me');
                    const freshAvatar = profileResponse.data?.avatar;
                    if (freshAvatar) {
                        localStorage.setItem('user_avatar', freshAvatar);
                    }
                    if (username)
                        localStorage.setItem('username', username);
                    if (role)
                        localStorage.setItem('user_role', role);
                    // navigate(getHomeRouteByRole(role));
                    else {
                        clearAuthStorage();
                        navigate('/login?error=google_failed', { replace: true });
                        return;
                    }
                    // localStorage.removeItem('user_role');
                    navigate(getHomeRouteByRole(role), { replace: true });
                } catch {
                    // console.warn('Erreur profil après Google:', profileErr);
                    const role = getRoleFromToken(token);
                    if (role) {
                        localStorage.setItem('user_role', role);
                        navigate(getHomeRouteByRole(role), { replace: true });
                        return;
                    }
                    clearAuthStorage();
                    // localStorage.removeItem('access_token');
                    // localStorage.removeItem('user_role');
                    // localStorage.removeItem('username');
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