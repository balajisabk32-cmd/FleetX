import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  // Zod Validation Error
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Prisma Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return res.status(400).json({
        error: `Duplicate entry found for unique constraint on ${target}`,
      });
    }
    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Record not found',
      });
    }
  }

  // JWT Validation Error
  if (err instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({
      error: 'Invalid or expired token',
    });
  }

  // Default fallback for unexpected errors
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: status === 500 ? 'Internal Server Error' : message,
  });
};
