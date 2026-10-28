import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ObjectStorage, PutObjectInput, StoredObject } from './types';

export class LocalStorage implements ObjectStorage {
  constructor(
    private readonly rootDir: string,
    private readonly publicBaseUrl: string,
  ) {}

  async put(input: PutObjectInput): Promise<StoredObject> {
    const filePath = path.join(this.rootDir, input.key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, input.body);
    return {
      key: input.key,
      url: this.url(input.key),
      sizeBytes: input.body.byteLength,
      mimeType: input.mimeType,
    };
  }

  async delete(key: string): Promise<void> {
    await unlink(path.join(this.rootDir, key)).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }

  url(key: string): string {
    return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
  }
}
