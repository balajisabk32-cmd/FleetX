import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, roleName } = req.body;

    if (!name || !email || !password || !roleName) {
      return res.status(400).json({ error: 'Name, email, password, and roleName are required' });
    }

    // Find the role
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      return res.status(400).json({ error: 'Invalid role provided' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        roleId: role.id,
      },
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: role.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
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

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name
      }
    });
  } catch (error: any) {
    console.log('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login: ' + error.message });
  }
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
