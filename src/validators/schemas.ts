import { z } from 'zod';

export const vehicleSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration number is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
  capacity: z.number().positive('Capacity must be positive'),
  status: z.enum(['Available', 'On Trip', 'In Shop']).optional(),
  
  insuranceExpiry: z.string().optional().refine((date) => !date || !isNaN(Date.parse(date)), {
    message: 'Must be a valid date',
  }),
  emissionsExpiry: z.string().optional().refine((date) => !date || !isNaN(Date.parse(date)), {
    message: 'Must be a valid date',
  }),
  inspectionExpiry: z.string().optional().refine((date) => !date || !isNaN(Date.parse(date)), {
    message: 'Must be a valid date',
  }),
});

export const vehicleUpdateSchema = vehicleSchema.partial();

export const driverSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  licenseNumber: z.string().min(5, 'Valid license number is required'),
  licenseExpiryDate: z.string().refine((date) => !isNaN(Date.parse(date)) && new Date(date) > new Date(), {
    message: 'License expiry date must be a valid future date',
  }),
  status: z.enum(['Available', 'On Trip', 'Suspended']).optional(),
});

export const driverUpdateSchema = driverSchema.partial();

export const documentSchema = z.object({
  vehicleRegNumber: z.string().min(1, 'Registration number is required'),
  type: z.enum(['RC', 'Insurance', 'Tax Receipt', 'Other']),
  fileUrl: z.string().url('Must be a valid URL'),
});
