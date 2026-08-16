import { Controller, Get } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SharesService } from './shares.service';

@Controller('shares')
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Get()
  findForUser(@CurrentUser() user: User) {
    return this.sharesService.findForUser(user.id);
  }
}
