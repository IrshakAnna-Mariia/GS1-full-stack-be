import { Global, Module } from '@nestjs/common';
import { SupabaseGateway } from './supabase.gateway';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
  providers: [
    SupabaseService,
    { provide: SupabaseGateway, useExisting: SupabaseService },
  ],
  exports: [SupabaseService, SupabaseGateway],
})
export class SupabaseModule {}
