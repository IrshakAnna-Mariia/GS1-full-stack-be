import type { Session, User } from '@supabase/supabase-js';

export type SupabaseAuthUserResponse = {
  data: { user: User | null };
  error: Error | null;
};

export type SupabaseAuthSessionResponse = {
  data: { user: User | null; session: Session | null };
  error: Error | null;
};

export type SupabaseSignOutResponse = {
  error: Error | null;
};

export type SupabaseStorageResult = {
  error: Error | null;
};

export type SupabaseSignedUrlResult = {
  signedUrl: string | null;
  error: Error | null;
};

export type SupabaseUploadUrlResult = {
  signedUrl: string | null;
  error: Error | null;
};

export abstract class SupabaseGateway {
  abstract getUserFromToken(token: string): Promise<SupabaseAuthUserResponse>;

  abstract signUp(
    email: string,
    password: string,
  ): Promise<SupabaseAuthSessionResponse>;

  abstract signInWithPassword(
    email: string,
    password: string,
  ): Promise<SupabaseAuthSessionResponse>;

  abstract refreshSession(
    refreshToken: string,
  ): Promise<SupabaseAuthSessionResponse>;

  abstract signOut(userId: string): Promise<SupabaseSignOutResponse>;

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

  abstract createStorageUploadSignedUrl(
    bucket: string,
    storageKey: string,
  ): Promise<SupabaseUploadUrlResult>;
}
