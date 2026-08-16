import { Module } from '@nestjs/common';
import { DataRoomModule } from '../data-room/data-room.module';
import { StorageModule } from '../storage/storage.module';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';

@Module({
  imports: [DataRoomModule, StorageModule],
  controllers: [FoldersController],
  providers: [FoldersService],
  exports: [FoldersService],
})
export class FoldersModule {}
