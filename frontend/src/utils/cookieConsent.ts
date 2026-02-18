const COOKIE_NAME = 'cookie_consent';

/**
 * Set a cookie with Secure, SameSite=Lax, Path=/.
 */
function setCookie(name: string, value: string, maxAgeDays: number): void {
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
}

/**
 * Read a cookie value by name.
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Check whether the user has a valid (non-expired) cookie consent.
 */
export function hasValidCookieConsent(expiryDays: number = 365): boolean {
  try {
    const raw = getCookie(COOKIE_NAME);
    if (!raw) return false;

    const data = JSON.parse(raw);
    if (data.accepted !== true || !data.timestamp) return false;

    const expiryMs = expiryDays * 24 * 60 * 60 * 1000;
    return Date.now() - data.timestamp < expiryMs;
  } catch {
    return false;
  }
}

/**
 * Store consent. Called when user clicks "I accept".
 */
export function acceptCookieConsent(expiryDays: number = 365): void {
  const value = JSON.stringify({ accepted: true, timestamp: Date.now() });
  setCookie(COOKIE_NAME, value, expiryDays);
}
