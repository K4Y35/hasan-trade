import type { StorageDriverName } from '@shopstack/shared';
import { LocalStorage } from './local';
import { S3Storage } from './s3';
import type { ObjectStorage } from './types';

export type { ObjectStorage, PutObjectInput, StoredObject } from './types';
export { LocalStorage } from './local';
export { S3Storage } from './s3';

export function createStorage(driver: StorageDriverName = 'local'): ObjectStorage {
  if (driver === 'local') {
    return new LocalStorage(
      process.env.STORAGE_LOCAL_DIR ?? './uploads',
      process.env.STORAGE_PUBLIC_URL ?? 'http://localhost:4000/uploads',
    );
  }

  return new S3Storage({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? 'us-east-1',
    bucket: process.env.S3_BUCKET ?? 'store',
    accessKeyId: process.env.S3_ACCESS_KEY ?? '',
    secretAccessKey: process.env.S3_SECRET_KEY ?? '',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
    publicBaseUrl: process.env.STORAGE_PUBLIC_URL,
  });
}
