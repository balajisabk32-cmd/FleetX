import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export const createDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, licenseNumber, licenseExpiryDate, status } = req.body;
    const expiryDate = new Date(licenseExpiryDate);
    const driverStatus = status || 'Available';

    const driver = await prisma.driver.create({
      data: {
        name,
        licenseNumber,
        licenseExpiryDate: expiryDate,
        status: driverStatus,
      },
    });

    res.status(201).json({ message: 'Driver created successfully', driver });
  } catch (error) {
    next(error);
  }
};

export const getDrivers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const whereClause = status ? { status: String(status) } : {};

    const drivers = await prisma.driver.findMany({ where: whereClause });
    res.json({ drivers });
  } catch (error) {
    next(error);
  }
};

export const getDriverById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const driver = await prisma.driver.findUniqueOrThrow({
      where: { id: Number(id) }
    });
    res.json({ driver });
  } catch (error) {
    next(error);
  }
};

export const updateDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, licenseNumber, licenseExpiryDate, status } = req.body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (licenseNumber) dataToUpdate.licenseNumber = licenseNumber;
    if (status) dataToUpdate.status = status;
    if (licenseExpiryDate) dataToUpdate.licenseExpiryDate = new Date(licenseExpiryDate);

    const driver = await prisma.driver.update({
      where: { id: Number(id) },
      data: dataToUpdate,
    });

    res.json({ message: 'Driver updated successfully', driver });
  } catch (error) {
    next(error);
  }
};

export const deleteDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.driver.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    next(error);
  }
};
