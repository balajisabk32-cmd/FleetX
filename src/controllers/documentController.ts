import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// In our authMiddleware, we set req.user to { id, role, email }. 
// Let's extend Request to type it (or just use any for quick access)
interface AuthRequest extends Request {
  user?: any;
}

export const uploadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { vehicleRegNumber, type, fileUrl } = req.body;
    const userId = req.user.id;

    // Find the vehicle
    const vehicle = await prisma.vehicle.findUnique({
      where: { registrationNumber: vehicleRegNumber },
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Transaction to ensure document and audit log are created together
    const result = await prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          vehicleId: vehicle.id,
          type,
          fileUrl,
        },
      });

      const auditLog = await tx.auditLog.create({
        data: {
          userId,
          documentId: document.id,
          action: 'UPDATE',
        },
      });

      return { document, auditLog };
    });

    res.status(201).json({ message: 'Document uploaded successfully', data: result.document });
  } catch (error) {
    next(error);
  }
};

export const viewDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const documentId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { vehicle: true },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Log the VIEW action
    await prisma.auditLog.create({
      data: {
        userId,
        documentId: document.id,
        action: 'VIEW',
      },
    });

    res.json(document);
  } catch (error) {
    next(error);
  }
};

export const downloadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const documentId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Log the DOWNLOAD action
    await prisma.auditLog.create({
      data: {
        userId,
        documentId: document.id,
        action: 'DOWNLOAD',
      },
    });

    res.json({ downloadUrl: document.fileUrl });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Only Admin or Manager should be calling this route (protected by middleware)
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100, // Get last 100 logs
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        document: { select: { id: true, type: true, vehicle: { select: { registrationNumber: true } } } },
      },
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};
