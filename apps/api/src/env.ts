import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

config({ path: path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../.env') });

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('@localhost:', '@127.0.0.1:');
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.API_PORT ?? 4000),
  storefrontUrl: process.env.STOREFRONT_URL ?? 'http://localhost:3000',
  adminUrl: process.env.ADMIN_URL ?? 'http://localhost:3001',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-me-32chars',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-me-32chars',
  jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL ?? '30d',
  storageDriver: (process.env.STORAGE_DRIVER ?? 'local') as 'local' | 'minio' | 's3',
  uploadsDir: process.env.STORAGE_LOCAL_DIR ?? path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../uploads'),
};
