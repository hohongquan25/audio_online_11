import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // During build time, DATABASE_URL might not be available
  // Return a basic PrismaClient without adapter
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found, creating PrismaClient without adapter');
    return new PrismaClient();
  }

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  } catch (error) {
    console.warn('Failed to create PrismaClient with adapter, falling back to basic client:', error);
    return new PrismaClient();
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
