import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { DatabaseLifecycle } from './database.client';

@Injectable()
export class DatabaseLifecycleService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject('DATABASE_LIFECYCLE')
    private readonly lifecycle: DatabaseLifecycle,
  ) {}

  onModuleInit(): Promise<void> {
    return this.lifecycle.connect();
  }

  onModuleDestroy(): Promise<void> {
    return this.lifecycle.disconnect();
  }
}
