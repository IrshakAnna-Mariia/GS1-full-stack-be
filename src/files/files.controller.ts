import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ListFilesQueryDto } from './dto/list-files-query.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  findByFolder(@CurrentUser() user: User, @Query() query: ListFilesQueryDto) {
    return this.filesService.findByFolder(user.id, query.folderId);
  }

  @Patch(':id')
  move(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFileDto,
  ) {
    return this.filesService.move(user.id, id, dto);
  }
}
