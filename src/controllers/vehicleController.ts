import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export const createVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { registrationNumber, make, model, year, capacity, status } = req.body;
    const vehicleStatus = status || 'Available';

    const vehicle = await prisma.vehicle.create({
      data: {
        registrationNumber,
        make,
        model,
        year: Number(year),
        capacity: Number(capacity),
        status: vehicleStatus,
      },
    });

    res.status(201).json({ message: 'Vehicle created successfully', vehicle });
  } catch (error) {
    next(error);
  }
};

export const getVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const whereClause = status ? { status: String(status) } : {};

    const vehicles = await prisma.vehicle.findMany({ where: whereClause });
    res.json({ vehicles });
  } catch (error) {
    next(error);
  }
};

export const getVehicleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicle.findUniqueOrThrow({
      where: { id: Number(id) }
    });
    res.json({ vehicle });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { make, model, year, capacity, status } = req.body;

    const dataToUpdate: any = {};
    if (make) dataToUpdate.make = make;
    if (model) dataToUpdate.model = model;
    if (year) dataToUpdate.year = Number(year);
    if (capacity !== undefined) dataToUpdate.capacity = Number(capacity);
    if (status) dataToUpdate.status = status;

    const vehicle = await prisma.vehicle.update({
      where: { id: Number(id) },
      data: dataToUpdate,
    });

    res.json({ message: 'Vehicle updated successfully', vehicle });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.vehicle.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    next(error);
  }
};
