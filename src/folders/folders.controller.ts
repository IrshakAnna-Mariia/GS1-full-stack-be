import { Controller, Get } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FoldersService } from './folders.service';

@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get()
  findRoot(@CurrentUser() user: User) {
    return this.foldersService.findRootFolders(user.id);
  }
}
