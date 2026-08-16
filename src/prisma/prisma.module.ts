import { Global, Module } from '@nestjs/common';
import { createDatabaseClient } from './create-database-client';
import type { DatabaseConnection } from './database.client';
import {
  DATABASE_CLIENT,
  DATABASE_LIFECYCLE,
  DATABASE_SETUP,
} from './database-connection.token';
import { DatabaseLifecycleService } from './database-lifecycle.service';
import { DatabaseGateway } from './database.gateway';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_SETUP,
      useFactory: createDatabaseClient,
    },
    {
      provide: DATABASE_CLIENT,
      useFactory: (connection: DatabaseConnection) => connection.client,
      inject: [DATABASE_SETUP],
    },
    {
      provide: DATABASE_LIFECYCLE,
      useFactory: (connection: DatabaseConnection) => connection.lifecycle,
      inject: [DATABASE_SETUP],
    },
    DatabaseLifecycleService,
    PrismaService,
    { provide: DatabaseGateway, useExisting: PrismaService },
  ],
  exports: [PrismaService, DatabaseGateway],
})
export class PrismaModule {}
