import { httpError } from '../utils/httpError.js';

export function requireRole(...allowedRoles) {
  return function roleGuard(req, _res, next) {
    if (!req.user) {
      return next(httpError(401, 'Unauthorized'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(httpError(403, 'Forbidden'));
    }

    return next();
  };
}
