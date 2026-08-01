import { PrismaPostgresAdapter } from '@prisma/adapter-ppg';
import { PrismaClient } from '@/generated/prisma/client';
import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * Creates a request-scoped Prisma client for the Cloudflare Workers runtime.
 * Database credentials remain a Worker secret and are never exposed to clients.
 */
export function getDatabase() {
  const { env } = getCloudflareContext();
  const databaseUrl = env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured.');
  }

  return new PrismaClient({
    adapter: new PrismaPostgresAdapter({ connectionString: databaseUrl }),
  });
}
