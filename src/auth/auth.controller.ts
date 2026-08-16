import { Body, Controller, Get, Post } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshSessionDto } from './dto/refresh-session.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  refreshSession(@Body() dto: RefreshSessionDto) {
    return this.authService.refreshSession(dto);
  }

  @Post('logout')
  logout(@CurrentUser() user: User) {
    return this.authService.logout(user);
  }

  @Get('me')
  getMe(@CurrentUser() user: User) {
    return this.authService.getMe(user);
  }
}
