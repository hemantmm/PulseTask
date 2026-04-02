import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { isDbAvailable } from '../config/db.js';
import { User } from '../models/User.js';
import { httpError } from '../utils/httpError.js';

export async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const tokenFromQuery = typeof req.query?.token === 'string' ? req.query.token : null;
    const token = tokenFromHeader || tokenFromQuery;

    if (!token) {
      return next(httpError(401, 'Missing auth token'));
    }

    const payload = jwt.verify(token, env.jwtSecret);

    if (!isDbAvailable() && payload.demo) {
      req.user = {
        id: payload.sub,
        tenantId: payload.tenantId,
        role: payload.role,
        email: payload.role === 'admin' ? 'admin@test.com' : payload.role === 'editor' ? 'editor@test.com' : 'viewer@test.com',
        name: payload.role === 'admin' ? 'Admin User' : payload.role === 'editor' ? 'Editor User' : 'Viewer User'
      };
      return next();
    }

    const user = await User.findById(payload.sub).lean();

    if (!user) {
      return next(httpError(401, 'Invalid auth token'));
    }

    req.user = {
      id: user._id.toString(),
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
      name: user.name
    };

    return next();
  } catch {
    return next(httpError(401, 'Unauthorized'));
  }
}
