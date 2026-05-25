export interface JwtPayload {
  id?: number;
  userId?: number;
  sub?: string;
  email?: string;
  name?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const decoded = atob(padded);
  try {
    return decodeURIComponent(
      Array.from(decoded)
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
  } catch {
    return decoded;
  }
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function extractUserIdFromToken(token: string): number | undefined {
  const payload = parseJwt(token);
  if (!payload) return undefined;

  const candidates = [payload.id, payload.userId, payload.sub];
  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate;
    }
    if (typeof candidate === 'string' && candidate.trim() !== '' && !Number.isNaN(Number(candidate))) {
      return Number(candidate);
    }
  }
  return undefined;
}
