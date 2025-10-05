const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    const backupPath = path.join(__dirname, 'devices-backup.json');
    const devices = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

    const devicesToCreate = devices.map(device => {
      const { id, createdAt, updatedAt, ...rest } = device;
      return rest;
    });

    const result = await prisma.device.createMany({
      data: devicesToCreate,
      skipDuplicates: true,
    });

    console.log(`Successfully created ${result.count} devices.`);

  } catch (error) {
    console.error('Error restoring devices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
