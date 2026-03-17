import { UserRole } from '../types';

const isUserRole = (value: unknown): value is UserRole => {
  return value === UserRole.CLIENT || value === UserRole.AGENT || value === UserRole.ADMIN;
};

export const getRoleFromToken = (token: string | null): UserRole | null => {
  if (!token) return null;

  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;

    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson) as { role?: string };

    return isUserRole(payload.role) ? payload.role : null;
  } catch {
    return null;
  }
};

export const getStoredUserRole = (): UserRole | null => {
  const roleFromStorage = localStorage.getItem('user_role');
  if (isUserRole(roleFromStorage)) {
    return roleFromStorage;
  }

  const roleFromToken = getRoleFromToken(localStorage.getItem('access_token'));
  if (roleFromToken) {
    localStorage.setItem('user_role', roleFromToken);
  }

  return roleFromToken;
};

export const getHomeRouteByRole = (role: UserRole | null): string => {
  return role === UserRole.CLIENT ? '/client_view' : '/dashboard';
};
