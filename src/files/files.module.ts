import { Module } from '@nestjs/common';
import { DataRoomModule } from '../data-room/data-room.module';
import { StorageModule } from '../storage/storage.module';
import { FilesController } from './files.controller';
import { FilesRepository } from './files.repository';
import { FilesService } from './files.service';

@Module({
  imports: [DataRoomModule, StorageModule],
  controllers: [FilesController],
  providers: [FilesRepository, FilesService],
  exports: [FilesService],
})
export class FilesModule {}
