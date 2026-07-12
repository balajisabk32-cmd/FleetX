import { Router } from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateMiddleware';
import { documentSchema } from '../validators/schemas';
import {
  uploadDocument,
  viewDocument,
  downloadDocument,
  getAuditLogs,
} from '../controllers/documentController';

const router = Router();

// Get the full audit log trail (Admin & Manager only)
// IMPORTANT: Put this BEFORE /:id so it doesn't try to parse "audit-logs" as an ID!
router.get(
  '/audit-logs',
  authenticateToken,
  requireRole(['Admin', 'Manager']),
  getAuditLogs
);

// Upload a new document (Admin, Manager, Driver)
router.post(
  '/',
  authenticateToken,
  validateRequest(documentSchema),
  uploadDocument
);

// View document metadata (Admin, Manager, Driver)
router.get(
  '/:id',
  authenticateToken,
  viewDocument
);

// Download document file (Admin, Manager, Driver)
router.get(
  '/:id/download',
  authenticateToken,
  downloadDocument
);

export default router;
