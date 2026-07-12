import { Request, Response, NextFunction } from 'express';
import { MaintenanceService } from '../services/maintenanceService';

export class MaintenanceController {
    static async createMaintenance(req: Request, res: Response, next: NextFunction) {
        try {
            const maintenance = await MaintenanceService.createMaintenance(req.body);
            res.status(201).json(maintenance);
        } catch (error) {
            next(error);
        }
    }

    static async getAllMaintenance(req: Request, res: Response, next: NextFunction) {
        try {
            const records = await MaintenanceService.getAllMaintenance();
            res.json(records);
        } catch (error) {
            next(error);
        }
    }

    static async getMaintenanceHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const records = await MaintenanceService.getMaintenanceHistory();
            res.json(records);
        } catch (error) {
            next(error);
        }
    }

    static async getReminders(req: Request, res: Response, next: NextFunction) {
        try {
            const reminders = await MaintenanceService.getReminders();
            res.json(reminders);
        } catch (error) {
            next(error);
        }
    }

    static async getMaintenanceById(req: Request, res: Response, next: NextFunction) {
        try {
            const record = await MaintenanceService.getMaintenanceById(req.params.id);
            res.json(record);
        } catch (error) {
            next(error);
        }
    }

    static async updateMaintenance(req: Request, res: Response, next: NextFunction) {
        try {
            const updated = await MaintenanceService.updateMaintenance(req.params.id, req.body);
            res.json(updated);
        } catch (error) {
            next(error);
        }
    }

    static async closeMaintenance(req: Request, res: Response, next: NextFunction) {
        try {
            await MaintenanceService.closeMaintenance(req.params.id, req.body);
            res.json({ message: 'Maintenance closed successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async deleteMaintenance(req: Request, res: Response, next: NextFunction) {
        try {
            await MaintenanceService.deleteMaintenance(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
