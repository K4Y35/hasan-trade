import type { PermissionSlug } from '@shopstack/shared';
import type { NextFunction, Request, Response } from 'express';
import { HttpError } from './http';
import { verifyAccess, type AccessPayload } from './jwt';

declare global {
  namespace Express {
    interface Request {
      user?: AccessPayload;
    }
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = verifyAccess(header.slice(7));
    } catch {
      req.user = undefined;
    }
  }
  next();
}

export function requireAuth(...permissions: PermissionSlug[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      next(new HttpError(401, 'Sign in required'));
      return;
    }
    try {
      req.user = verifyAccess(header.slice(7));
    } catch {
      next(new HttpError(401, 'Invalid or expired token'));
      return;
    }
    if (permissions.length && !permissions.some((p) => req.user?.permissions.includes(p))) {
      next(new HttpError(403, 'You do not have permission for this action'));
      return;
    }
    next();
  };
}

export function requireStaff(...permissions: PermissionSlug[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    requireAuth(...permissions)(req, res, (err?: unknown) => {
      if (err) {
        next(err);
        return;
      }
      if (req.user?.kind !== 'STAFF') {
        next(new HttpError(403, 'Staff access only'));
        return;
      }
      next();
    });
  };
}
