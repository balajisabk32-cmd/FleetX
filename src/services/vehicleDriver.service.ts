import prisma from '../config/db';
import { Prisma } from '@prisma/client';

export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop';
export type DriverStatus = 'Available' | 'On Trip' | 'Suspended';

// ==========================================
// 1. Status Update Utility Functions
// ==========================================

/**
 * Updates a vehicle's status programmatically.
 * Can accept an optional Prisma Transaction client (tx) for atomic operations.
 */
export const updateVehicleStatus = async (
  vehicleId: number,
  status: VehicleStatus,
  tx?: Prisma.TransactionClient
) => {
  const db = tx || prisma;
  return db.vehicle.update({
    where: { id: vehicleId },
    data: { status },
  });
};

/**
 * Updates a driver's status programmatically.
 * Can accept an optional Prisma Transaction client (tx) for atomic operations.
 */
export const updateDriverStatus = async (
  driverId: number,
  status: DriverStatus,
  tx?: Prisma.TransactionClient
) => {
  const db = tx || prisma;
  return db.driver.update({
    where: { id: driverId },
    data: { status },
  });
};

// ==========================================
// 2. Availability Check Utilities
// ==========================================

/**
 * Verifies if a specific vehicle is currently 'Available'.
 */
export const checkVehicleAvailability = async (
  vehicleId: number,
  tx?: Prisma.TransactionClient
): Promise<boolean> => {
  const db = tx || prisma;
  const vehicle = await db.vehicle.findUnique({
    where: { id: vehicleId },
    select: { status: true },
  });
  
  return vehicle?.status === 'Available';
};

/**
 * Verifies if a specific driver is currently 'Available'.
 */
export const checkDriverAvailability = async (
  driverId: number,
  tx?: Prisma.TransactionClient
): Promise<boolean> => {
  const db = tx || prisma;
  const driver = await db.driver.findUnique({
    where: { id: driverId },
    select: { status: true },
  });
  
  return driver?.status === 'Available';
};

// ==========================================
// 3. Transaction-Safe Wrappers (Example)
// ==========================================

/**
 * Example wrapper showing how to safely dispatch a Trip.
 * This utilizes Prisma's interactive transactions ($transaction) to ensure
 * both the vehicle and driver are updated atomically. If any check fails, 
 * the entire transaction rolls back automatically.
 */
export const assignTripResourcesAtomically = async (vehicleId: number, driverId: number) => {
  return prisma.$transaction(async (tx) => {
    // 1. Verify availability within the transaction to prevent race conditions
    const isVehicleAvailable = await checkVehicleAvailability(vehicleId, tx);
    const isDriverAvailable = await checkDriverAvailability(driverId, tx);

    if (!isVehicleAvailable) {
      throw new Error(`Vehicle ${vehicleId} is not available for dispatch.`);
    }
    
    if (!isDriverAvailable) {
      throw new Error(`Driver ${driverId} is not available for dispatch.`);
    }

    // 2. Safely lock and update both statuses to 'On Trip'
    const updatedVehicle = await updateVehicleStatus(vehicleId, 'On Trip', tx);
    const updatedDriver = await updateDriverStatus(driverId, 'On Trip', tx);

    return { vehicle: updatedVehicle, driver: updatedDriver };
  });
};
