import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { getHomeRouteByRole, getRoleFromToken } from '../../services/auth';
import { UserRole } from '../../types';

export function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            // --- ON SUIT TA LOGIQUE EXACTE DU LOGIN CARD ---
            localStorage.setItem('access_token', token);

            const handleProfileSync = async () => {
                try {
                    const meResponse = await api.get('/auth/me');
                    console.log("meResponse:", meResponse)
                    const username = meResponse.data?.username;
                    console.log("username:", username);
                    const role = UserRole.CLIENT;
                    // const role = meResponse.data?.role ?? getRoleFromToken(token);
                    console.log("role:", role);
                    
                    if (username) localStorage.setItem('username', username);
                    if (role) localStorage.setItem('user_role', role);
                    navigate(getHomeRouteByRole(role));
                } catch (profileErr) {
                    console.warn('Erreur profil après Google:', profileErr);
                    const role = getRoleFromToken(token);
                    if (role) localStorage.setItem('user_role', role);
                    navigate(getHomeRouteByRole(role));
                }
            };

            handleProfileSync();
        } else {
            navigate('/login?error=google_failed');
        }
    }, [searchParams, navigate]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#121212]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
        </div>
    );
}