import "server-only";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { env } from "@/config/env";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma client singleton.
 *
 * This is the ONLY module allowed to construct a PrismaClient.
 * All database access goes through repositories, which import { db } from here.
 *
 * The better-sqlite3 driver adapter is used in development; swapping to
 * PostgreSQL later means changing the adapter + DATABASE_URL, nothing else.
 */
function createPrismaClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

// Preserve the client across HMR reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
