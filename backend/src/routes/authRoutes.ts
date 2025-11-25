import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prismaClient';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

type JwtPayload = {
  id: number;
  email: string;
  role: string;
};

function signToken(user: { id: number; email: string; role: string }) {
  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };


  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
}

function sendAuthCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function sanitizeUser(user: any) {
  const { password, ...rest } = user;
  return rest;
}


router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'User with that email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: role || 'STAFF',
      },
    });

    const token = signToken(user);
    sendAuthCookie(res, token);

    return res.status(201).json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    
    let valid = false;

    if (user.password && user.password.startsWith('$2b$')) {
      valid = await bcrypt.compare(password, user.password);
    } else {
      valid = user.password === password;
    }

    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    sendAuthCookie(res, token);

    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out' });
});


router.get('/me', (req: Request, res: Response) => {
  const cookies: any = (req as any).cookies || {};
  const token = cookies.token;

  if (!token) {
    return res.status(200).json({ user: null });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    return res.json({
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (_err) {
    return res.status(200).json({ user: null });
  }
});

export default router;
