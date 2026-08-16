import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateFileDto } from './dto/create-file.dto';
import { ListFilesQueryDto } from './dto/list-files-query.dto';
import { RequestUploadUrlDto } from './dto/request-upload-url.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  findByFolder(@CurrentUser() user: User, @Query() query: ListFilesQueryDto) {
    return this.filesService.findByFolder(user.id, query.folderId);
  }

  @Post('upload-url')
  requestUploadUrl(
    @CurrentUser() user: User,
    @Body() dto: RequestUploadUrlDto,
  ) {
    return this.filesService.requestUploadUrl(user.id, dto);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateFileDto) {
    return this.filesService.create(user.id, dto);
  }

  @Get(':id/download')
  getDownloadUrl(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.filesService.getDownloadUrl(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFileDto,
  ) {
    return this.filesService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.remove(user.id, id);
  }
}
