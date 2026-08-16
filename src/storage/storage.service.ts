import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseGateway } from '../supabase/supabase.gateway';
import { StorageGateway } from './storage.gateway';

@Injectable()
export class StorageService extends StorageGateway {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    private readonly supabaseService: SupabaseGateway,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  override async deleteObjects(storageKeys: string[]): Promise<void> {
    if (storageKeys.length === 0) {
      return;
    }

    const bucket = this.getBucket();
    const { error } = await this.supabaseService.removeStorageObjects(
      bucket,
      storageKeys,
    );

    if (error) {
      this.logger.warn(
        `Storage cleanup failed for ${storageKeys.length} object(s): ${error.message}`,
      );
    }
  }

  override async createSignedUrl(
    storageKey: string,
    expiresIn = 3600,
  ): Promise<string | null> {
    const bucket = this.getBucket();
    const { signedUrl, error } =
      await this.supabaseService.createStorageSignedUrl(
        bucket,
        storageKey,
        expiresIn,
      );

    if (error) {
      this.logger.warn(
        `Failed to create signed URL for ${storageKey}: ${error.message}`,
      );
      return null;
    }

    return signedUrl;
  }

  override async createUploadSignedUrl(
    storageKey: string,
  ): Promise<string | null> {
    const bucket = this.getBucket();
    const { signedUrl, error } =
      await this.supabaseService.createStorageUploadSignedUrl(
        bucket,
        storageKey,
      );

    if (error) {
      this.logger.warn(
        `Failed to create upload URL for ${storageKey}: ${error.message}`,
      );
      return null;
    }

    return signedUrl;
  }

  private getBucket(): string {
    return this.configService.get<string>('SUPABASE_STORAGE_BUCKET', 'uploads');
  }
}
