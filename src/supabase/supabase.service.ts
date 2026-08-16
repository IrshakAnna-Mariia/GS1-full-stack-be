import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

type SupabaseClientInstance = ReturnType<typeof createClient>;

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClientInstance;
  private readonly adminClient: SupabaseClientInstance;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.getOrThrow<string>('SUPABASE_URL');
    const anonKey = this.configService.getOrThrow<string>('SUPABASE_ANON_KEY');
    const serviceRoleKey = this.configService.getOrThrow<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    this.client = createClient(url, anonKey);
    this.adminClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  getClient(): SupabaseClientInstance {
    return this.client;
  }

  getAdminClient(): SupabaseClientInstance {
    return this.adminClient;
  }
}
