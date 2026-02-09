import { useNavigate, Outlet } from 'react-router-dom';

const MainLayout = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { login: 'Profil' };

  const getLoginFromToken = (tokenStr: string | null) => {
    if (!token) return 'Profil';
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));


      return payload.username || payload.email || 'Utilisateur';
    } catch (e) {
      return 'Profil';
    }
  };

  const login = getLoginFromToken();

  const handleLogout = () => {
    localStorage.removeItem('access_token'); // delete token
    localStorage.removeItem('user');
    navigate('/login'); // go to login
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-md px-4">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl font-bold text-primary">Manage Tickets</a>
        </div>
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-neutral text-neutral-content">
                <span className="text-xs">{login.slice(0, 3).toUpperCase()}</span>
              </div>
            </label>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li><a>Profil</a></li>
              <li><a>Settings</a></li>
              <hr className="my-1 opacity-20" />
              <li>
                <button onClick={handleLogout} className="text-error font-bold">
                  Déconnexion
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;