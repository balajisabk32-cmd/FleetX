import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const roles = ['Admin', 'Manager', 'Driver', 'Viewer'];

  console.log('Seeding roles...');

  for (const roleName of roles) {
    const existingRole = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!existingRole) {
      await prisma.role.create({
        data: { name: roleName },
      });
      console.log(`Created role: ${roleName}`);
    }
  }

  // Seeding initial Admin User
  const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
  if (adminRole) {
    const adminEmail = 'admin@fleet.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          name: 'System Admin',
          email: adminEmail,
          passwordHash,
          roleId: adminRole.id,
        },
      });
      console.log('Created Admin user: admin@fleet.com / admin123');
    }
  }

  // Seeding 3 Sample Vehicles
  const vehicles = [
    { registrationNumber: 'V-001', make: 'Ford', model: 'Transit', year: 2022, capacity: 1500, status: 'Available' },
    { registrationNumber: 'V-002', make: 'Mercedes', model: 'Sprinter', year: 2023, capacity: 2000, status: 'Available' },
    { registrationNumber: 'V-003', make: 'Toyota', model: 'Hiace', year: 2021, capacity: 1200, status: 'Available' },
  ];

  console.log('Seeding vehicles...');
  for (const v of vehicles) {
    const existing = await prisma.vehicle.findUnique({ where: { registrationNumber: v.registrationNumber } });
    if (!existing) {
      await prisma.vehicle.create({ data: v });
      console.log(`Created vehicle: ${v.registrationNumber}`);
    }
  }

  // Seeding 3 Sample Drivers
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 2);

  const drivers = [
    { name: 'John Doe', licenseNumber: 'DL-001', licenseExpiryDate: futureDate, status: 'Available' },
    { name: 'Jane Smith', licenseNumber: 'DL-002', licenseExpiryDate: futureDate, status: 'Available' },
    { name: 'Bob Johnson', licenseNumber: 'DL-003', licenseExpiryDate: futureDate, status: 'Available' },
  ];

  console.log('Seeding drivers...');
  for (const d of drivers) {
    const existing = await prisma.driver.findUnique({ where: { licenseNumber: d.licenseNumber } });
    if (!existing) {
      await prisma.driver.create({ data: d });
      console.log(`Created driver: ${d.name}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
