import { Module } from '@nestjs/common';
import { StorageGateway } from './storage.gateway';
import { StorageService } from './storage.service';

@Module({
  providers: [
    StorageService,
    { provide: StorageGateway, useExisting: StorageService },
  ],
  exports: [StorageService, StorageGateway],
})
export class StorageModule {}
