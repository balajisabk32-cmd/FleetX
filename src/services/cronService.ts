import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const initCronJobs = () => {
  // Run every 1 minute for demonstration purposes! (Usually this would be '0 0 * * *' for midnight)
  cron.schedule('* * * * *', async () => {
    console.log('[CRON] Running scheduled task: Checking for expiring driver licenses...');
    
    try {
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      // Find drivers whose license expires within 30 days and who are currently "Active"
      const expiringDrivers = await prisma.driver.findMany({
        where: {
          capabilityFlag: 'Active',
          licenseExpiryDate: {
            lte: thirtyDaysFromNow,
            gte: now,
          },
        },
      });

      for (const driver of expiringDrivers) {
        // 1. Downgrade Capability Flag
        await prisma.driver.update({
          where: { id: driver.id },
          data: { capabilityFlag: 'Expiring Soon' },
        });

        // 2. Create System Notification for Managers
        await prisma.notification.create({
          data: {
            type: 'WARNING',
            message: `CRITICAL: Driver ${driver.name}'s license (${driver.licenseNumber}) expires on ${driver.licenseExpiryDate.toDateString()}! Flag downgraded.`,
          },
        });

        console.log(`[CRON] Flagged driver ${driver.name} and created notification.`);
      }

      // 3. Find drivers whose license has ALREADY expired
      const expiredDrivers = await prisma.driver.findMany({
        where: {
          capabilityFlag: { not: 'Expired' },
          licenseExpiryDate: {
            lt: now,
          },
        },
      });

      for (const driver of expiredDrivers) {
        // Suspend them completely
        await prisma.driver.update({
          where: { id: driver.id },
          data: { 
            capabilityFlag: 'Expired',
            status: 'Suspended'
          },
        });

        await prisma.notification.create({
          data: {
            type: 'CRITICAL',
            message: `EMERGENCY: Driver ${driver.name}'s license (${driver.licenseNumber}) has EXPIRED. They have been automatically Suspended.`,
          },
        });
        
        console.log(`[CRON] Suspended driver ${driver.name} due to expired license.`);
      }

      console.log('[CRON] Scheduled task completed successfully.');
    } catch (error) {
      console.error('[CRON] Error running scheduled task:', error);
    }
  });
};
