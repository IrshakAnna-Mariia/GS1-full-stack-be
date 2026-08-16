export abstract class StorageGateway {
  abstract createSignedUrl(
    storageKey: string,
    expiresIn?: number,
  ): Promise<string | null>;

  abstract createUploadSignedUrl(storageKey: string): Promise<string | null>;

  abstract deleteObjects(storageKeys: string[]): Promise<void>;
}
