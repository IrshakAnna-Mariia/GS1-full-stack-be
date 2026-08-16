import { Controller, Get } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  getMe(@CurrentUser() user: User) {
    return this.authService.getMe(user);
  }
}
