import { prisma } from '@shopstack/db';
import { loginSchema, registerSchema } from '@shopstack/shared';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { requireAuth } from '../lib/auth';
import { asyncHandler, HttpError } from '../lib/http';
import {
  hashToken,
  refreshExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
  type AccessPayload,
} from '../lib/jwt';

export const authRouter = Router();

async function permissionsFor(userId: string, kind: 'STAFF' | 'CUSTOMER') {
  if (kind !== 'STAFF') return [];
  const roles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });
  return [...new Set(roles.flatMap((r) => r.role.permissions.map((p) => p.permission.slug)))];
}

async function issueTokens(user: { id: string; kind: 'STAFF' | 'CUSTOMER'; email: string | null; name: string }) {
  const permissions = await permissionsFor(user.id, user.kind);
  const payload: AccessPayload = {
    sub: user.id,
    kind: user.kind,
    email: user.email ?? undefined,
    permissions,
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(user.id);
  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: hashToken(refreshToken), expiresAt: refreshExpiryDate() },
  });
  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, kind: user.kind, permissions },
  };
}

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findFirst({
      where: { email: body.email, status: 'ACTIVE' },
    });
    if (!user?.passwordHash || !(await bcrypt.compare(body.password, user.passwordHash))) {
      throw new HttpError(401, 'Invalid email or password');
    }
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    res.json(await issueTokens(user));
  }),
);

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email: body.email }, ...(body.phone ? [{ phone: body.phone }] : [])] },
    });
    if (exists) throw new HttpError(409, 'An account with that email or phone already exists');
    const user = await prisma.user.create({
      data: {
        kind: 'CUSTOMER',
        name: body.name,
        email: body.email,
        phone: body.phone,
        passwordHash: await bcrypt.hash(body.password, 12),
      },
    });
    res.status(201).json(await issueTokens(user));
  }),
);

authRouter.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = String(req.body?.refreshToken ?? '');
    if (!token) throw new HttpError(400, 'refreshToken is required');
    let payload: { sub: string };
    try {
      payload = verifyRefresh(token);
    } catch {
      throw new HttpError(401, 'Invalid refresh token');
    }
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new HttpError(401, 'Refresh token is no longer valid');
    }
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.status !== 'ACTIVE') throw new HttpError(401, 'Account is not active');
    res.json(await issueTokens(user));
  }),
);

authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = String(req.body?.refreshToken ?? '');
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(token) },
        data: { revokedAt: new Date() },
      });
    }
    res.json({ ok: true });
  }),
);

authRouter.get(
  '/me',
  requireAuth(),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { id: true, name: true, email: true, phone: true, kind: true, avatarUrl: true },
    });
    res.json({ user, permissions: req.user!.permissions });
  }),
);
