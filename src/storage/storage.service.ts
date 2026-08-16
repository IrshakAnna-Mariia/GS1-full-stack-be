import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  async deleteObjects(storageKeys: string[]): Promise<void> {
    if (storageKeys.length === 0) {
      return;
    }

    const bucket = this.configService.get<string>(
      'SUPABASE_STORAGE_BUCKET',
      'uploads',
    );

    const { error } = await this.supabaseService
      .getAdminClient()
      .storage.from(bucket)
      .remove(storageKeys);

    if (error) {
      this.logger.warn(
        `Storage cleanup failed for ${storageKeys.length} object(s): ${error.message}`,
      );
    }
  }
}
