import { UserRole } from '../types';

const isUserRole = (value: unknown): value is UserRole => {
  return value === UserRole.CLIENT || value === UserRole.AGENT || value === UserRole.ADMIN;
};

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const payloadBase64Url = token.split('.')[1];
    if (!payloadBase64Url) return null;

    const base64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    const payloadJson = atob(padded);
    return JSON.parse(payloadJson) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const clearAuthStorage = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('username');
  localStorage.removeItem('user_avatar');
  window.dispatchEvent(new Event('auth-token-updated'));
};

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  const payload = decodeJwtPayload(token);
  if (!payload) return true;

  const exp = payload.exp;
  if (typeof exp !== 'number') return true;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return exp <= nowInSeconds;
};

export const hasValidSession = (): boolean => {
  const token = localStorage.getItem('access_token');
  if (!token || isTokenExpired(token)) {
    clearAuthStorage();
    return false;
  }
  return true;
};

export const getRoleFromToken = (token: string | null): UserRole | null => {
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  const role = payload?.role;

  return isUserRole(role) ? role : null;
};

export const getUserIdFromToken = (token: string | null): number | null => {
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  const sub = payload?.sub;

  return typeof sub === 'number' ? sub : null;
};

export const getStoredUserRole = (): UserRole | null => {
  if (!hasValidSession()) return null;

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
  if (role === UserRole.CLIENT) return '/client';
  if (role === UserRole.AGENT) return '/agent';
  if (role === UserRole.ADMIN) return '/admin';
  return '/login';
};