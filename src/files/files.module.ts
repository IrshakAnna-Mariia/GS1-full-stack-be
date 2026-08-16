import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { FilesController } from './files.controller';
import { FilesRepository } from './files.repository';
import { FilesService } from './files.service';

@Module({
  imports: [StorageModule],
  controllers: [FilesController],
  providers: [FilesRepository, FilesService],
  exports: [FilesService],
})
export class FilesModule {}
