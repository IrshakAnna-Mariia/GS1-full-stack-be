import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseGateway } from '../prisma/database.gateway';
import { DataRoomDto, toDataRoomDto } from './dto/data-room.dto';

const DEFAULT_DATA_ROOM_NAME = 'My Data Room';

@Injectable()
export class DataRoomService {
  constructor(private readonly prisma: DatabaseGateway) {}

  async getOrCreateForUser(ownerId: string): Promise<DataRoomDto> {
    const dataRoom = await this.prisma.upsertDataRoom(
      ownerId,
      DEFAULT_DATA_ROOM_NAME,
    );

    return toDataRoomDto(dataRoom);
  }

  async assertOwnedByUser(dataRoomId: string, ownerId: string): Promise<void> {
    const owner = await this.prisma.findDataRoomOwnerId(dataRoomId);

    if (!owner || owner !== ownerId) {
      throw new ForbiddenException('Data room access denied');
    }
  }
}
