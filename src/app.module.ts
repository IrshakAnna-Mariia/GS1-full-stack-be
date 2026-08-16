import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { validateEnv } from './config/env.validation';
import { DataRoomModule } from './data-room/data-room.module';
import { FilesModule } from './files/files.module';
import { FoldersModule } from './folders/folders.module';
import { PrismaModule } from './prisma/prisma.module';
import { SharesModule } from './shares/shares.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    SupabaseModule,
    AuthModule,
    DataRoomModule,
    FoldersModule,
    FilesModule,
    SharesModule,
  ],
})
export class AppModule {}
