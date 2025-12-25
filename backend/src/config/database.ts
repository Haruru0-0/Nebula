import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import logger from '../utils/logger';
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

// Handle connection events
prisma.$connect()
  .then(() => {
    logger.info('✅ Connected to Neon Database');
  })
  .catch((error: any) => {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Database connection closed');
});

export { prisma }