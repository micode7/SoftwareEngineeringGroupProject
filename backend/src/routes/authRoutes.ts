// backend/src/routes/authRoutes.ts
import { Router, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prismaClient';
import { authenticate, type AuthRequest, type AuthUser } from '../middleware/authMiddleware';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // For class demo: look user up by email ONLY.
    // (In a real app, you would use bcrypt.compare(password, user.password).)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // DEMO ONLY: we *don't* check the real password-hash here
    // because seed has fake "hashed_password_..." strings.
    // You can require a fixed password if you want:
    // if (password !== 'demo123') { ... }

    const payload: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      // secure: true, // enable if you serve over HTTPS
    });

    return res.json({ user: payload });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  return res.json({ user: req.user });
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out' });
});

export default router;
