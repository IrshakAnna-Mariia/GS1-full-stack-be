import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { PublicSharesController } from './public-shares.controller';
import { SharesController } from './shares.controller';
import { SharesRepository } from './shares.repository';
import { SharesService } from './shares.service';

@Module({
  imports: [StorageModule],
  controllers: [SharesController, PublicSharesController],
  providers: [SharesRepository, SharesService],
  exports: [SharesService, SharesRepository],
})
export class SharesModule {}
