import axios from 'axios';
import { UserRole } from '../types';

export type SessionUser = {
  userId: number;
  username: string;
  role: UserRole;
  avatar?: string | null;
};

const sessionApi = axios.create({
  baseURL: `${window.location.origin}/api/`,
  withCredentials: true,
});

const isUserRole = (value: unknown): value is UserRole => {
  return value === UserRole.CLIENT || value === UserRole.AGENT || value === UserRole.ADMIN;
};

let cachedSessionUser: SessionUser | null = null;
let hasResolvedSession = false;
let pendingSessionRequest: Promise<SessionUser | null> | null = null;

const notifySessionChanged = (): void => {
  window.dispatchEvent(new Event('auth-token-updated'));
};

const normalizeSessionUser = (value: unknown): SessionUser | null => {
  if (!value || typeof value !== 'object') return null;

  const payload = value as Record<string, unknown>;
  const userId = payload.userId;
  const username = payload.username;
  const role = payload.role;
  const avatar = payload.avatar;

  if (!isUserRole(role)) return null;
  if (typeof userId !== 'number' || !Number.isInteger(userId) || userId <= 0) return null;
  if (typeof username !== 'string' || username.length === 0) return null;

  return {
    userId,
    username,
    role,
    avatar: typeof avatar === 'string' ? avatar : null,
  };
};

export const clearAuthStorage = (notify: boolean = true): void => {
  const hadSession = cachedSessionUser !== null || hasResolvedSession;
  cachedSessionUser = null;
  hasResolvedSession = false;
  pendingSessionRequest = null;

  if (notify && hadSession) {
    notifySessionChanged();
  }
};

export const refreshSession = async (force: boolean = false): Promise<SessionUser | null> => {
  if (!force && hasResolvedSession) {
    return cachedSessionUser;
  }

  if (pendingSessionRequest) {
    return pendingSessionRequest;
  }

  pendingSessionRequest = sessionApi
    .get('/auth/me')
    .then((response) => {
      cachedSessionUser = normalizeSessionUser(response.data);
      return cachedSessionUser;
    })
    .catch(() => {
      cachedSessionUser = null;
      return null;
    })
    .finally(() => {
      hasResolvedSession = true;
      pendingSessionRequest = null;
    });

  return pendingSessionRequest;
};

export const logout = async (): Promise<void> => {
  try {
    await sessionApi.post('/auth/logout');
  } catch {
  } finally {
    clearAuthStorage();
  }
};

export const hasValidSession = (): boolean => {
  return cachedSessionUser !== null;
};

export const getSessionUser = (): SessionUser | null => {
  return cachedSessionUser;
};

export const getStoredUserRole = (): UserRole | null => {
  return cachedSessionUser?.role ?? null;
};

export const getStoredUserId = (): number | null => {
  return cachedSessionUser?.userId ?? null;
};

export const getStoredUsername = (): string | null => {
  return cachedSessionUser?.username ?? null;
};

export const getStoredAvatar = (): string | null => {
  return cachedSessionUser?.avatar ?? null;
};

export const getHomeRouteByRole = (role: UserRole | null): string => {
  if (role === UserRole.CLIENT) return '/client';
  if (role === UserRole.AGENT) return '/agent';
  if (role === UserRole.ADMIN) return '/admin';
  return '/login';
};