import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { DatabaseClient } from './database.client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: DatabaseClient;

  constructor() {
    this.client = new PrismaClient();
  }

  get dataRoom(): DatabaseClient['dataRoom'] {
    return this.client.dataRoom;
  }

  get folder(): DatabaseClient['folder'] {
    return this.client.folder;
  }

  get file(): DatabaseClient['file'] {
    return this.client.file;
  }

  get share(): DatabaseClient['share'] {
    return this.client.share;
  }

  async onModuleInit(): Promise<void> {
    await (this.client as unknown as PrismaClient).$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await (this.client as unknown as PrismaClient).$disconnect();
  }
}
