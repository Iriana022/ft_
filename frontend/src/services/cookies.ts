export const getCookie = (name: string): string | null => {
  if (!name) return null;

  const encodedName = encodeURIComponent(name);
  const entries = document.cookie ? document.cookie.split(';') : [];

  for (const entry of entries) {
    const [rawKey, ...rawValueParts] = entry.trim().split('=');
    if (rawKey !== encodedName) continue;

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

export const setCookie = (name: string, value: string, maxAgeDays: number = 365): void => {
  const encodedName = encodeURIComponent(name);
  const encodedValue = encodeURIComponent(value);
  const maxAgeSeconds = Math.max(1, Math.floor(maxAgeDays * 24 * 60 * 60));
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${encodedName}=${encodedValue}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
};
