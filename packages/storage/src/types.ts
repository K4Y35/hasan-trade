export type StoredObject = {
  key: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
};

export type PutObjectInput = {
  key: string;
  body: Buffer | Uint8Array;
  mimeType: string;
};

export interface ObjectStorage {
  put(input: PutObjectInput): Promise<StoredObject>;
  delete(key: string): Promise<void>;
  url(key: string): string;
}
