import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import prisma from '../config/db';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'mock_client_id_for_dev');

// Zod schemas for bulletproof validation
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
  roleName: z.string().default('Viewer'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Helper to set HTTP-Only cookie
const setAuthCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }
    const { name, email, password, roleName } = parsed.data;

    let role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      // Create role if it doesn't exist for easy setup
      role = await prisma.role.create({ data: { name: roleName } });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(12); // High rounds for bulletproof security
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        authProvider: 'LOCAL',
        roleId: role.id,
      },
    });

    const token = jwt.sign(
      { userId: newUser.id, roleId: newUser.roleId, roleName: role.name },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' }
    );

    setAuthCookie(res, token);

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: role.name }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration', details: error?.message || String(error) });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !user.passwordHash || user.authProvider !== 'LOCAL') {
      return res.status(401).json({ error: 'Invalid credentials or wrong sign in method' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, roleId: user.roleId, roleName: user.role.name },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' }
    );

    setAuthCookie(res, token);

    res.json({
      message: 'Logged in successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role.name }
    });
  } catch (error: any) {
    console.log('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login: ' + error.message });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Google token is required' });

    // Verify Google Token securely on the backend
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID || 'mock_client_id_for_dev',
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google token payload' });
    }

    const { email, name, sub: googleId } = payload;

    let user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      // Auto-register Google User
      let role = await prisma.role.findUnique({ where: { name: 'Viewer' } });
      if (!role) role = await prisma.role.create({ data: { name: 'Viewer' } });

      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Google User',
          authProvider: 'GOOGLE',
          googleId,
          roleId: role.id,
        },
        include: { role: true }
      });
    } else {
      // If user exists but used LOCAL, upgrade or allow login
      if (user.authProvider !== 'GOOGLE' && !user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, authProvider: 'GOOGLE' },
          include: { role: true }
        });
      }
    }

    const jwtToken = jwt.sign(
      { userId: user.id, roleId: user.roleId, roleName: user.role.name },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' }
    );

    setAuthCookie(res, jwtToken);

    res.json({
      message: 'Google login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role.name }
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(500).json({ error: 'Google Authentication failed' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.userId },
      include: { role: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
