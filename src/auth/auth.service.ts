import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { SupabaseGateway } from '../supabase/supabase.gateway';
import { AuthSessionDto, toAuthSessionDto } from './dto/auth-session.dto';
import { AuthUserDto, toAuthUserDto } from './dto/auth-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshSessionDto } from './dto/refresh-session.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { normalizeEmail } from '../common/utils/normalize-email';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseGateway: SupabaseGateway) {}

  getMe(user: User): AuthUserDto {
    return toAuthUserDto(user);
  }

  async signUp(dto: SignUpDto): Promise<AuthSessionDto> {
    const email = normalizeEmail(dto.email);
    const { data, error } = await this.supabaseGateway.signUp(
      email,
      dto.password,
    );

    if (error) {
      throw this.toAuthException(error);
    }

    if (!data.user) {
      throw new BadRequestException('Unable to create account');
    }

    return toAuthSessionDto(data.user, data.session);
  }

  async login(dto: LoginDto): Promise<AuthSessionDto> {
    const email = normalizeEmail(dto.email);
    const { data, error } = await this.supabaseGateway.signInWithPassword(
      email,
      dto.password,
    );

    if (error) {
      throw this.toAuthException(error);
    }

    if (!data.user || !data.session) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return toAuthSessionDto(data.user, data.session);
  }

  async refreshSession(dto: RefreshSessionDto): Promise<AuthSessionDto> {
    const { data, error } = await this.supabaseGateway.refreshSession(
      dto.refreshToken,
    );

    if (error) {
      throw this.toAuthException(error);
    }

    if (!data.user || !data.session) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return toAuthSessionDto(data.user, data.session);
  }

  async logout(user: User): Promise<void> {
    const { error } = await this.supabaseGateway.signOut(user.id);

    if (error) {
      throw this.toAuthException(error);
    }
  }

  private toAuthException(error: Error): Error {
    const message = error.message.toLowerCase();

    if (
      message.includes('invalid login credentials') ||
      message.includes('invalid refresh token')
    ) {
      return new UnauthorizedException('Invalid email or password');
    }

    if (
      message.includes('already registered') ||
      message.includes('already been registered')
    ) {
      return new ConflictException('Email already registered');
    }

    if (
      message.includes('email address') ||
      message.includes('validate email') ||
      message.includes('invalid format')
    ) {
      return new BadRequestException('Invalid email address');
    }

    return new BadRequestException(error.message);
  }
}
