import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DataRoomDto, toDataRoomDto } from './dto/data-room.dto';

const DEFAULT_DATA_ROOM_NAME = 'My Data Room';

@Injectable()
export class DataRoomService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateForUser(ownerId: string): Promise<DataRoomDto> {
    const dataRoom = await this.prisma.dataRoom.upsert({
      where: { ownerId },
      update: {},
      create: {
        name: DEFAULT_DATA_ROOM_NAME,
        ownerId,
      },
    });

    return toDataRoomDto(dataRoom);
  }

  async assertOwnedByUser(dataRoomId: string, ownerId: string): Promise<void> {
    const dataRoom = await this.prisma.dataRoom.findUnique({
      where: { id: dataRoomId },
      select: { ownerId: true },
    });

    if (!dataRoom || dataRoom.ownerId !== ownerId) {
      throw new ForbiddenException('Data room access denied');
    }
  }
}
