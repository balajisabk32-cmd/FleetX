const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@fleet.com' },
      include: { role: true },
    });
    console.log("User:", user);
    
    const isMatch = await bcrypt.compare('admin123', user.passwordHash);
    console.log("Match:", isMatch);
    
    const token = jwt.sign(
      { userId: user.id, roleId: user.roleId, roleName: user.role.name },
      'supersecretkey',
      { expiresIn: '1d' }
    );
    console.log("Token:", token);
  } catch(e) {
    console.error("Crashed:", e);
  } finally {
    await prisma.$disconnect();
  }
}
testLogin();
