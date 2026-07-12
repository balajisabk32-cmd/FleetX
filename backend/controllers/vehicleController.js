import * as vehicleService from '../services/vehicleService.js';

export const addVehicle = async (req, res, next) => {
    try {
        const data = await vehicleService.addVehicle(req.body);
        res.status(201).json({ success: true, message: 'Vehicle created', data, errors: null });
    } catch (error) {
        next(error);
    }
};

export const getVehicles = async (req, res, next) => {
    try {
        const data = await vehicleService.getVehicles();
        res.status(200).json({ success: true, message: 'Vehicles fetched', data, errors: null });
    } catch (error) {
        next(error);
    }
};
