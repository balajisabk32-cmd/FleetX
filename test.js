const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
prisma.user.findUnique({ where: { email: 'admin@fleet.com' } })
  .then(u => { console.log('Found:', u); })
  .catch(e => { console.error('Prisma Error:', e); })
  .finally(() => prisma.$disconnect());
