import { Injectable } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { AuthUserDto, toAuthUserDto } from './dto/auth-user.dto';

@Injectable()
export class AuthService {
  getMe(user: User): AuthUserDto {
    return toAuthUserDto(user);
  }
}
