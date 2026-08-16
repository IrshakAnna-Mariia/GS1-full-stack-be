import type { Session, User } from '@supabase/supabase-js';
import { AuthUserDto, toAuthUserDto } from './auth-user.dto';

export type AuthSessionDto = {
  user: AuthUserDto;
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
};

export function toAuthSessionDto(
  user: User,
  session: Session | null,
): AuthSessionDto {
  return {
    user: toAuthUserDto(user),
    accessToken: session?.access_token ?? null,
    refreshToken: session?.refresh_token ?? null,
    expiresIn: session?.expires_in ?? null,
  };
}
