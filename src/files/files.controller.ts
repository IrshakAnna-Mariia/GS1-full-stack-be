import { Controller, Get, Query } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ListFilesQueryDto } from './dto/list-files-query.dto';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  findByFolder(@CurrentUser() user: User, @Query() query: ListFilesQueryDto) {
    return this.filesService.findByFolder(user.id, query.folderId);
  }
}
