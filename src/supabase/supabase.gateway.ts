import type { User } from '@supabase/supabase-js';

export type SupabaseAuthUserResponse = {
  data: { user: User | null };
  error: Error | null;
};

export type SupabaseStorageResult = {
  error: Error | null;
};

export type SupabaseSignedUrlResult = {
  signedUrl: string | null;
  error: Error | null;
};

export abstract class SupabaseGateway {
  abstract getUserFromToken(token: string): Promise<SupabaseAuthUserResponse>;

  abstract getUserEmailById(userId: string): Promise<string | null>;

  abstract findUserIdByEmail(email: string): Promise<string | null>;

  abstract removeStorageObjects(
    bucket: string,
    storageKeys: string[],
  ): Promise<SupabaseStorageResult>;

  abstract createStorageSignedUrl(
    bucket: string,
    storageKey: string,
    expiresIn: number,
  ): Promise<SupabaseSignedUrlResult>;
}
