import { Controller, Get } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DataRoomService } from './data-room.service';

@Controller('data-room')
export class DataRoomController {
  constructor(private readonly dataRoomService: DataRoomService) {}

  @Get()
  getMine(@CurrentUser() user: User) {
    return this.dataRoomService.getOrCreateForUser(user.id);
  }
}
