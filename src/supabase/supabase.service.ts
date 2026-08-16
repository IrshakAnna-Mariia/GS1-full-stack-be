import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type User } from '@supabase/supabase-js';
import {
  SupabaseGateway,
  type SupabaseAuthSessionResponse,
  type SupabaseAuthUserResponse,
  type SupabaseSignOutResponse,
  type SupabaseSignedUrlResult,
  type SupabaseStorageResult,
} from './supabase.gateway';

type SupabaseListUsersResponse = {
  data: { users: User[] };
  error: Error | null;
};

type SupabaseGetUserByIdResponse = {
  data: { user: User | null };
};

@Injectable()
export class SupabaseService extends SupabaseGateway {
  private readonly authClient: ReturnType<typeof createClient>;
  private readonly adminClient: ReturnType<typeof createClient>;

  constructor(private readonly configService: ConfigService) {
    super();
    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    const anonKey = this.configService.getOrThrow<string>('SUPABASE_ANON_KEY');
    const serviceRoleKey = this.configService.getOrThrow<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    this.authClient = createClient(url, anonKey);
    this.adminClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  override async getUserFromToken(
    token: string,
  ): Promise<SupabaseAuthUserResponse> {
    const response = await this.authClient.auth.getUser(token);
    return {
      data: { user: response.data.user },
      error: response.error,
    };
  }

  override async signUp(
    email: string,
    password: string,
  ): Promise<SupabaseAuthSessionResponse> {
    const response = await this.authClient.auth.signUp({ email, password });
    return {
      data: {
        user: response.data.user,
        session: response.data.session,
      },
      error: response.error,
    };
  }

  override async signInWithPassword(
    email: string,
    password: string,
  ): Promise<SupabaseAuthSessionResponse> {
    const response = await this.authClient.auth.signInWithPassword({
      email,
      password,
    });
    return {
      data: {
        user: response.data.user,
        session: response.data.session,
      },
      error: response.error,
    };
  }

  override async refreshSession(
    refreshToken: string,
  ): Promise<SupabaseAuthSessionResponse> {
    const response = await this.authClient.auth.refreshSession({
      refresh_token: refreshToken,
    });
    return {
      data: {
        user: response.data.user,
        session: response.data.session,
      },
      error: response.error,
    };
  }

  override async signOut(userId: string): Promise<SupabaseSignOutResponse> {
    const { error } = await this.adminClient.auth.admin.signOut(userId);
    return { error };
  }

  override async getUserEmailById(userId: string): Promise<string | null> {
    const response: SupabaseGetUserByIdResponse =
      await this.adminClient.auth.admin.getUserById(userId);
    return response.data.user?.email ?? null;
  }

  override async findUserIdByEmail(email: string): Promise<string | null> {
    const normalizedEmail = email.trim().toLowerCase();
    let page = 1;

    while (page <= 10) {
      const response: SupabaseListUsersResponse =
        await this.adminClient.auth.admin.listUsers({
          page,
          perPage: 200,
        });

      if (response.error) {
        return null;
      }

      const match = response.data.users.find(
        (user) => user.email?.toLowerCase() === normalizedEmail,
      );
      if (match) {
        return match.id;
      }

      if (response.data.users.length < 200) {
        break;
      }
      page += 1;
    }

    return null;
  }

  override async removeStorageObjects(
    bucket: string,
    storageKeys: string[],
  ): Promise<SupabaseStorageResult> {
    const { error } = await this.adminClient.storage
      .from(bucket)
      .remove(storageKeys);
    return { error };
  }

  override async createStorageSignedUrl(
    bucket: string,
    storageKey: string,
    expiresIn: number,
  ): Promise<SupabaseSignedUrlResult> {
    const { data, error } = await this.adminClient.storage
      .from(bucket)
      .createSignedUrl(storageKey, expiresIn);

    return {
      signedUrl: data?.signedUrl ?? null,
      error,
    };
  }
}
