import { Request, Response, NextFunction } from 'express';
import { TripService } from '../services/tripService';

export class TripController {
    static async createTrip(req: Request, res: Response, next: NextFunction) {
        try {
            const trip = await TripService.createTrip(req.body);
            res.status(201).json(trip);
        } catch (error) {
            next(error);
        }
    }

    static async getAllTrips(req: Request, res: Response, next: NextFunction) {
        try {
            const trips = await TripService.getAllTrips();
            res.json(trips);
        } catch (error) {
            next(error);
        }
    }

    static async getTripHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const trips = await TripService.getTripHistory();
            res.json(trips);
        } catch (error) {
            next(error);
        }
    }

    static async getTripById(req: Request, res: Response, next: NextFunction) {
        try {
            const trip = await TripService.getTripById(req.params.id);
            res.json(trip);
        } catch (error) {
            next(error);
        }
    }

    static async updateTrip(req: Request, res: Response, next: NextFunction) {
        try {
            const trip = await TripService.updateTrip(req.params.id, req.body);
            res.json(trip);
        } catch (error) {
            next(error);
        }
    }

    static async deleteTrip(req: Request, res: Response, next: NextFunction) {
        try {
            await TripService.deleteTrip(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    static async dispatchTrip(req: Request, res: Response, next: NextFunction) {
        try {
            await TripService.dispatchTrip(req.params.id);
            res.json({ message: 'Trip dispatched successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async completeTrip(req: Request, res: Response, next: NextFunction) {
        try {
            await TripService.completeTrip(req.params.id);
            res.json({ message: 'Trip completed successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async cancelTrip(req: Request, res: Response, next: NextFunction) {
        try {
            await TripService.cancelTrip(req.params.id);
            res.json({ message: 'Trip cancelled successfully' });
        } catch (error) {
            next(error);
        }
    }
}
