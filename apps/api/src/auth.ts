import { jwt } from '@elysiajs/jwt';

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
export const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'dev-secret-change-me') {
  console.warn('⚠ JWT_SECRET is not set — using an insecure default. Set it in production!');
}

export const jwtPlugin = jwt({ name: 'jwt', secret: JWT_SECRET });

export interface TokenPayload {
  /** users.id as string */
  sub: string;
  email: string;
  name: string;
  role: string;
  exp: number;
}

export function bearerToken(authorization: string | undefined): string | undefined {
  if (!authorization?.startsWith('Bearer ')) return undefined;
  return authorization.slice('Bearer '.length).trim() || undefined;
}
