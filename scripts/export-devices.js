const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    const devices = await prisma.device.findMany();
    const backupPath = path.join(__dirname, 'devices-backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(devices, null, 2));
    console.log(`Successfully backed up ${devices.length} devices to ${backupPath}`);
  } catch (error) {
    console.error('Error backing up devices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
