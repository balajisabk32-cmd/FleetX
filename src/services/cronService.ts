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

      console.log('[CRON] Driver task completed.');

      // --- NEW MULTI-STAGE COMPLIANCE EXPIRATION ENGINE ---
      console.log('[CRON] Running scheduled task: Multi-Stage Vehicle Compliance Engine...');
      
      const vehicles = await prisma.vehicle.findMany();
      
      const checkAndNotify = async (
        vehicleId: number, 
        regNumber: string, 
        type: string, 
        expiryDate: Date | null, 
        alertLevel: number, 
        levelKey: string
      ) => {
        if (!expiryDate) return;
        
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / msPerDay);
        
        let newLevel = alertLevel;
        let message = '';
        
        if (daysLeft <= 0 && alertLevel < 4) {
          newLevel = 4;
          message = `EMERGENCY: Vehicle ${regNumber} ${type} has EXPIRED!`;
        } else if (daysLeft <= 7 && daysLeft > 0 && alertLevel < 3) {
          newLevel = 3;
          message = `CRITICAL (7 Days): Vehicle ${regNumber} ${type} expires in ${daysLeft} days!`;
        } else if (daysLeft <= 30 && daysLeft > 7 && alertLevel < 2) {
          newLevel = 2;
          message = `WARNING (30 Days): Vehicle ${regNumber} ${type} expires in ${daysLeft} days.`;
        } else if (daysLeft <= 60 && daysLeft > 30 && alertLevel < 1) {
          newLevel = 1;
          message = `INFO (60 Days): Vehicle ${regNumber} ${type} expires in ${daysLeft} days.`;
        }

        if (newLevel !== alertLevel) {
          // Update the specific alert level for this vehicle
          await prisma.vehicle.update({
            where: { id: vehicleId },
            data: { [levelKey]: newLevel },
          });

          // Generate tiered notification
          await prisma.notification.create({
            data: {
              type: newLevel === 4 ? 'CRITICAL' : newLevel === 3 ? 'CRITICAL' : newLevel === 2 ? 'WARNING' : 'INFO',
              message,
            },
          });
          
          console.log(`[CRON] Tiered Notification generated for ${regNumber} - ${type} (Level ${newLevel})`);
        }
      };

      for (const v of vehicles) {
        await checkAndNotify(v.id, v.registrationNumber, 'Insurance', v.insuranceExpiry, v.insuranceAlertLevel, 'insuranceAlertLevel');
        await checkAndNotify(v.id, v.registrationNumber, 'Emissions', v.emissionsExpiry, v.emissionsAlertLevel, 'emissionsAlertLevel');
        await checkAndNotify(v.id, v.registrationNumber, 'Safety Inspection', v.inspectionExpiry, v.inspectionAlertLevel, 'inspectionAlertLevel');
      }

      console.log('[CRON] Multi-Stage Vehicle Compliance Engine completed.');
    } catch (error) {
      console.error('[CRON] Error running scheduled task:', error);
    }
  });
};
