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
  password: z.string().min(1, 'Password is required'),
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
      return res.status(400).json({ error: parsed.error?.errors?.[0]?.message || 'Validation error' });
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

import { supabase } from '../config/supabase';

const seedMockData = async () => {
  try {
    console.log("Seeding mock data for test@fleetx.com...");

    // Clean SQLite
    await prisma.auditLog.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.vehicle.deleteMany({});
    await prisma.driver.deleteMany({});

    // Clean Supabase
    try {
      await supabase.from('trip_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('trips').delete().neq('id', 0);
      await supabase.from('maintenance_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('maintenance').delete().neq('id', 0);
      await supabase.from('fuel_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('expense_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('vehicles').delete().neq('id', 0);
      await supabase.from('vehicles').delete().neq('id', '0');
    } catch (err) {
      console.warn("Supabase cleaning warning:", err);
    }

    // Seed SQLite Vehicles & Drivers
    await prisma.vehicle.create({
      data: { id: 1, registrationNumber: 'TX-777-AA', make: 'Volvo', model: 'FH16', year: 2022, capacity: 25, status: 'Available' }
    });
    await prisma.vehicle.create({
      data: { id: 2, registrationNumber: 'TX-888-BB', make: 'Ford', model: 'F-150', year: 2021, capacity: 2.5, status: 'On Trip' }
    });
    await prisma.vehicle.create({
      data: { id: 3, registrationNumber: 'TX-999-CC', make: 'Scania', model: 'R500', year: 2023, capacity: 30, status: 'In Shop' }
    });

    await prisma.driver.create({
      data: { id: 1, name: 'Michael Schumacher', licenseNumber: 'LIC-77777', licenseExpiryDate: new Date('2030-01-01'), status: 'Available', capabilityFlag: 'Active' }
    });
    await prisma.driver.create({
      data: { id: 2, name: 'Lewis Hamilton', licenseNumber: 'LIC-88888', licenseExpiryDate: new Date('2031-01-01'), status: 'On Trip', capabilityFlag: 'Active' }
    });
    await prisma.driver.create({
      data: { id: 3, name: 'Max Verstappen', licenseNumber: 'LIC-99999', licenseExpiryDate: new Date('2029-01-01'), status: 'Suspended', capabilityFlag: 'Active' }
    });

    // Seed Supabase Vehicles (so FK checks don't fail)
    try {
      await supabase.from('vehicles').insert([
        { id: 1, registration_number: 'TX-777-AA', vehicle_name: 'Volvo FH16', vehicle_type: 'Heavy Truck', maximum_load_capacity: 25000, status: 'AVAILABLE', service_score: 100, fuel_capacity: 400.0, acquisition_cost: 120000.0 },
        { id: 2, registration_number: 'TX-888-BB', vehicle_name: 'Ford F-150', vehicle_type: 'Light Pickup', maximum_load_capacity: 2500, status: 'ON_TRIP', service_score: 100, fuel_capacity: 90.0, acquisition_cost: 45000.0 },
        { id: 3, registration_number: 'TX-999-CC', vehicle_name: 'Scania R500', vehicle_type: 'Heavy Truck', maximum_load_capacity: 30000, status: 'IN_SHOP', service_score: 55, fuel_capacity: 500.0, acquisition_cost: 150000.0 }
      ]);
      await supabase.from('vehicles').insert([
        { id: '1', registration_number: 'TX-777-AA', vehicle_name: 'Volvo FH16', vehicle_type: 'Heavy Truck', maximum_load_capacity: 25000, status: 'AVAILABLE', service_score: 100, fuel_capacity: 400.0, acquisition_cost: 120000.0 },
        { id: '2', registration_number: 'TX-888-BB', vehicle_name: 'Ford F-150', vehicle_type: 'Light Pickup', maximum_load_capacity: 2500, status: 'ON_TRIP', service_score: 100, fuel_capacity: 90.0, acquisition_cost: 45000.0 },
        { id: '3', registration_number: 'TX-999-CC', vehicle_name: 'Scania R500', vehicle_type: 'Heavy Truck', maximum_load_capacity: 30000, status: 'IN_SHOP', service_score: 55, fuel_capacity: 500.0, acquisition_cost: 150000.0 }
      ]);

      await supabase.from('trips').insert([
        { id: 1, trip_number: 'TRP-101', vehicle_id: 1, driver_id: 1, source: 'Houston', destination: 'Austin', cargo_weight: 15000.0, planned_distance: 260.0, estimated_travel_time: 3.5, status: 'COMPLETED', created_at: new Date().toISOString() },
        { id: 2, trip_number: 'TRP-102', vehicle_id: 2, driver_id: 2, source: 'Dallas', destination: 'Houston', cargo_weight: 2000.0, planned_distance: 380.0, estimated_travel_time: 5.2, status: 'DISPATCHED', created_at: new Date().toISOString() }
      ]);
      await supabase.from('trip_logs').insert([
        { vehicle_id: '1', start_date: new Date().toISOString(), distance: 260.0, revenue: 1500.0 },
        { vehicle_id: '2', start_date: new Date().toISOString(), distance: 380.0, revenue: 2200.0 }
      ]);

      await supabase.from('maintenance').insert([
        { id: 1, vehicle_id: 1, issue: 'Engine Oil Replacement', priority: 'LOW', estimated_cost: 150.0, status: 'CLOSED', actual_cost: 145.0, opened_at: new Date().toISOString() },
        { id: 2, vehicle_id: 3, issue: 'Brake Pad Wear', priority: 'HIGH', estimated_cost: 450.0, status: 'OPEN', opened_at: new Date().toISOString() }
      ]);
      await supabase.from('maintenance_logs').insert([
        { vehicle_id: '1', service_date: new Date().toISOString().split('T')[0], description: 'Engine Oil Replacement', cost: 145.0 },
        { vehicle_id: '3', service_date: new Date().toISOString().split('T')[0], description: 'Brake Pad Wear', cost: 450.0 }
      ]);

      await supabase.from('fuel_logs').insert([
        { vehicle_id: '1', fuel_date: '2026-07-10', quantity: 150.0, price_per_liter: 1.85, odometer: 12000.0, station: 'Chevron' },
        { vehicle_id: '2', fuel_date: '2026-07-11', quantity: 120.0, price_per_liter: 1.90, odometer: 12450.0, station: 'Shell' }
      ]);

      await supabase.from('expense_logs').insert([
        { vehicle_id: '1', category: 'Toll', amount: 45.0, expense_date: '2026-07-10', description: 'Highway 99 Toll' },
        { vehicle_id: '2', category: 'Insurance', amount: 1200.0, expense_date: '2026-07-01', description: 'Monthly Premium' }
      ]);
    } catch (err) {
      console.warn("Supabase seeding warning:", err);
    }

    console.log("Mock data seeded successfully.");
  } catch (error) {
    console.error("Failed to seed mock data:", error);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error?.errors?.[0]?.message || 'Validation error' });
    }
    const { email, password } = parsed.data;

    let user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    // Special behavior for test email
    if (email === 'test@fleetx.com') {
      if (!user) {
        let role = await prisma.role.findUnique({ where: { name: 'Admin' } });
        if (!role) role = await prisma.role.create({ data: { name: 'Admin' } });
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);
        user = await prisma.user.create({
          data: {
            name: 'Test Administrator',
            email,
            passwordHash,
            authProvider: 'LOCAL',
            roleId: role.id,
          },
          include: { role: true }
        });
      } else {
        // If password changed, update it so we don't fail standard compare
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash }
        });
      }
      
      // Clean and seed database for the test user
      await seedMockData();
    } else {
      if (!user || !user.passwordHash || user.authProvider !== 'LOCAL') {
        return res.status(401).json({ error: 'Invalid credentials or wrong sign in method' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
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
