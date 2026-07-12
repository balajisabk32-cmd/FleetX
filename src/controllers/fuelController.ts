import { Request, Response, NextFunction } from 'express';
import * as fuelService from '../services/fuelService';

export const addFuelLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await fuelService.addFuelLog(req.body);
        res.status(201).json({ success: true, message: 'Fuel log created', data, errors: null });
    } catch (error) {
        next(error);
    }
};

export const getFuelLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await fuelService.getFuelLogs(req.query);
        res.status(200).json({ success: true, message: 'Fuel logs fetched', data, errors: null });
    } catch (error) {
        next(error);
    }
};

export const getFuelLogById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await fuelService.getFuelLogById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Fuel log not found', data: null, errors: null });
        res.status(200).json({ success: true, message: 'Fuel log fetched', data, errors: null });
    } catch (error) {
        next(error);
    }
};

export const updateFuelLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await fuelService.updateFuelLog(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Fuel log updated', data, errors: null });
    } catch (error) {
        next(error);
    }
};

export const deleteFuelLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await fuelService.deleteFuelLog(req.params.id);
        res.status(200).json({ success: true, message: 'Fuel log deleted', data: null, errors: null });
    } catch (error) {
        next(error);
    }
};
