import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../env';

export type AccessPayload = {
  sub: string;
  kind: 'STAFF' | 'CUSTOMER';
  email?: string;
  permissions: string[];
};

export function signAccessToken(payload: AccessPayload) {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessTtl as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(userId: string) {
  return jwt.sign({ sub: userId, jti: randomBytes(8).toString('hex') }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshTtl as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccess(token: string) {
  return jwt.verify(token, env.jwtAccessSecret) as AccessPayload;
}

export function verifyRefresh(token: string) {
  return jwt.verify(token, env.jwtRefreshSecret) as { sub: string; jti: string };
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function refreshExpiryDate() {
  const days = env.jwtRefreshTtl.endsWith('d') ? Number(env.jwtRefreshTtl.replace('d', '')) : 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
