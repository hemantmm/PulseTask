import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { isDbAvailable } from '../config/db.js';
import { User } from '../models/User.js';
import { httpError } from '../utils/httpError.js';

const demoUsers = [
  {
    id: 'demo-admin',
    tenantId: 'test-org',
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    id: 'demo-editor',
    tenantId: 'test-org',
    name: 'Editor User',
    email: 'editor@test.com',
    password: 'Editor123!',
    role: 'editor'
  },
  {
    id: 'demo-viewer',
    tenantId: 'test-org',
    name: 'Viewer User',
    email: 'viewer@test.com',
    password: 'Viewer123!',
    role: 'viewer'
  }
];

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      tenantId: user.tenantId,
      role: user.role
    },
    env.jwtSecret,
    { expiresIn: '8h' }
  );
}

export async function register(req, res, next) {
  try {
    const { name, email, password, tenantId, role } = req.body;

    if (!name || !email || !password || !tenantId) {
      return next(httpError(400, 'name, email, password and tenantId are required'));
    }

    const existing = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      return next(httpError(409, 'Email already exists'));
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      tenantId,
      role: role || 'viewer'
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(httpError(400, 'email and password are required'));
    }

    if (!isDbAvailable()) {
      const demoUser = demoUsers.find(
        (user) => user.email === String(email).toLowerCase() && user.password === password
      );

      if (!demoUser) {
        return next(httpError(401, 'Invalid credentials'));
      }

      const token = jwt.sign(
        {
          sub: demoUser.id,
          tenantId: demoUser.tenantId,
          role: demoUser.role,
          demo: true
        },
        env.jwtSecret,
        { expiresIn: '8h' }
      );

      return res.json({
        token,
        user: {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
          tenantId: demoUser.tenantId
        }
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(httpError(401, 'Invalid credentials'));
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return next(httpError(401, 'Invalid credentials'));
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res) {
  return res.json({ user: req.user });
}

export async function listUsers(req, res, next) {
  try {
    const users = await User.find({ tenantId: req.user.tenantId })
      .select('_id name email role tenantId createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ users });
  } catch (error) {
    return next(error);
  }
}

export async function createUserByAdmin(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return next(httpError(400, 'name, email, password and role are required'));
    }

    const existing = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      return next(httpError(409, 'Email already exists'));
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      tenantId: req.user.tenantId,
      role
    });

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      }
    });
  } catch (error) {
    return next(error);
  }
}
