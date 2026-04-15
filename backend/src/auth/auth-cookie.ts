type CookieSameSite = 'strict' | 'lax' | 'none';

type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: CookieSameSite;
  path: string;
  maxAge?: number;
};

type ResponseLike = {
  cookie: (name: string, value: string, options: CookieOptions) => void;
  clearCookie: (name: string, options: Omit<CookieOptions, 'maxAge'>) => void;
};

type RequestLike = {
  headers?: {
    cookie?: string | string[];
  };
};

const env = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {});

export const AUTH_COOKIE_NAME = 'auth_token';

const resolveCookieSameSite = (): CookieOptions['sameSite'] => {
  const raw = (env.COOKIE_SAMESITE || 'lax').toLowerCase();
  if (raw === 'strict' || raw === 'none' || raw === 'lax') {
    return raw;
  }
  return 'lax';
};

const resolveCookieSecure = (): boolean => {
  if (env.COOKIE_SECURE === 'true') return true;
  if (env.COOKIE_SECURE === 'false') return false;
  return env.NODE_ENV !== 'development';
};

const resolveCookieMaxAge = (): number => {
  const parsed = Number(env.JWT_COOKIE_MAX_AGE_MS || 60 * 60 * 1000);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 60 * 60 * 1000;
  }
  return parsed;
};

export const getAuthCookieOptions = (): CookieOptions => {
  return {
    httpOnly: true,
    secure: resolveCookieSecure(),
    sameSite: resolveCookieSameSite(),
    path: '/',
    maxAge: resolveCookieMaxAge(),
  };
};

export const setAuthCookie = (res: ResponseLike, token: string): void => {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
};

export const clearAuthCookie = (res: ResponseLike): void => {
  const options = getAuthCookieOptions();
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
  });
};

export const extractTokenFromCookieHeader = (cookieHeader?: string): string | null => {
  if (!cookieHeader) return null;

  const rawParts = cookieHeader.split(';');
  for (const part of rawParts) {
    const [rawKey, ...rawValueParts] = part.trim().split('=');
    if (rawKey !== AUTH_COOKIE_NAME) continue;

    const rawValue = rawValueParts.join('=');
    if (!rawValue) return null;

    try {
      return decodeURIComponent(rawValue);
    } catch {
      return rawValue;
    }
  }

  return null;
};

export const extractTokenFromRequest = (req: RequestLike): string | null => {
  const cookieHeader = req?.headers?.cookie;
  if (!cookieHeader) return null;

  if (Array.isArray(cookieHeader)) {
    return extractTokenFromCookieHeader(cookieHeader.join(';'));
  }

  return extractTokenFromCookieHeader(cookieHeader);
};
