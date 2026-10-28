import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { ObjectStorage, PutObjectInput, StoredObject } from './types';

export type S3StorageOptions = {
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle?: boolean;
  publicBaseUrl?: string;
};

export class S3Storage implements ObjectStorage {
  private readonly client: S3Client;

  constructor(private readonly options: S3StorageOptions) {
    this.client = new S3Client({
      region: options.region,
      endpoint: options.endpoint,
      forcePathStyle: options.forcePathStyle ?? Boolean(options.endpoint),
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
    });
  }

  async put(input: PutObjectInput): Promise<StoredObject> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.options.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.mimeType,
      }),
    );
    return {
      key: input.key,
      url: this.url(input.key),
      sizeBytes: input.body.byteLength,
      mimeType: input.mimeType,
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.options.bucket, Key: key }),
    );
  }

  url(key: string): string {
    if (this.options.publicBaseUrl) {
      return `${this.options.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }
    if (this.options.endpoint) {
      return `${this.options.endpoint.replace(/\/$/, '')}/${this.options.bucket}/${key}`;
    }
    return `https://${this.options.bucket}.s3.${this.options.region}.amazonaws.com/${key}`;
  }
}
