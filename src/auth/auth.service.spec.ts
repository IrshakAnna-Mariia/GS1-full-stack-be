import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import type { Session, User } from '@supabase/supabase-js';
import { SupabaseGateway } from '../supabase/supabase.gateway';
import { AuthService } from './auth.service';

type MockedSupabaseGateway = {
  [
    K in keyof Pick<
      SupabaseGateway,
      'signUp' | 'signInWithPassword' | 'refreshSession' | 'signOut'
    >
  ]: jest.MockedFunction<SupabaseGateway[K]>;
};

function createMockSupabaseGateway(): MockedSupabaseGateway {
  return {
    signUp: jest.fn<SupabaseGateway['signUp']>(),
    signInWithPassword: jest.fn<SupabaseGateway['signInWithPassword']>(),
    refreshSession: jest.fn<SupabaseGateway['refreshSession']>(),
    signOut: jest.fn<SupabaseGateway['signOut']>(),
  };
}

const user = (overrides: Partial<User> & Pick<User, 'id'>): User => ({
  email: 'user@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  ...overrides,
});

const session = (overrides: Partial<Session> = {}): Session => ({
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: user({ id: 'user-1' }),
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;
  let supabase: MockedSupabaseGateway;

  beforeEach(async () => {
    jest.resetAllMocks();
    supabase = createMockSupabaseGateway();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseGateway, useValue: supabase },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('signUp', () => {
    it('returns session when signup succeeds', async () => {
      supabase.signUp.mockResolvedValue({
        data: {
          user: user({ id: 'user-1', email: 'user@example.com' }),
          session: session(),
        },
        error: null,
      });

      await expect(
        service.signUp({ email: 'user@example.com', password: 'password1' }),
      ).resolves.toEqual({
        user: { id: 'user-1', email: 'user@example.com' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      });
    });

    it('returns user without session when email confirmation is required', async () => {
      supabase.signUp.mockResolvedValue({
        data: {
          user: user({ id: 'user-1', email: 'user@example.com' }),
          session: null,
        },
        error: null,
      });

      await expect(
        service.signUp({ email: 'user@example.com', password: 'password1' }),
      ).resolves.toEqual({
        user: { id: 'user-1', email: 'user@example.com' },
        accessToken: null,
        refreshToken: null,
        expiresIn: null,
      });
    });

    it('throws conflict when email is already registered', async () => {
      supabase.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: new Error('User already registered'),
      });

      await expect(
        service.signUp({ email: 'user@example.com', password: 'password1' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('returns session on valid credentials', async () => {
      supabase.signInWithPassword.mockResolvedValue({
        data: {
          user: user({ id: 'user-1', email: 'user@example.com' }),
          session: session(),
        },
        error: null,
      });

      await expect(
        service.login({ email: 'user@example.com', password: 'password1' }),
      ).resolves.toEqual({
        user: { id: 'user-1', email: 'user@example.com' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      });
    });

    it('throws unauthorized on invalid credentials', async () => {
      supabase.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: new Error('Invalid login credentials'),
      });

      await expect(
        service.login({ email: 'user@example.com', password: 'wrong-pass' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('refreshSession', () => {
    it('returns a new session for a valid refresh token', async () => {
      supabase.refreshSession.mockResolvedValue({
        data: {
          user: user({ id: 'user-1', email: 'user@example.com' }),
          session: session({ access_token: 'new-access-token' }),
        },
        error: null,
      });

      await expect(
        service.refreshSession({ refreshToken: 'refresh-token' }),
      ).resolves.toEqual({
        user: { id: 'user-1', email: 'user@example.com' },
        accessToken: 'new-access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      });
    });

    it('throws unauthorized for invalid refresh token', async () => {
      supabase.refreshSession.mockResolvedValue({
        data: { user: null, session: null },
        error: new Error('Invalid Refresh Token'),
      });

      await expect(
        service.refreshSession({ refreshToken: 'bad-token' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('signs out the current user', async () => {
      supabase.signOut.mockResolvedValue({ error: null });

      await expect(
        service.logout(user({ id: 'user-1' })),
      ).resolves.toBeUndefined();
      expect(supabase.signOut).toHaveBeenCalledWith('user-1');
    });

    it('throws when sign out fails', async () => {
      supabase.signOut.mockResolvedValue({
        error: new Error('Sign out failed'),
      });

      await expect(
        service.logout(user({ id: 'user-1' })),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
