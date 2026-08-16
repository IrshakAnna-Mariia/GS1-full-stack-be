import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DataRoomService } from '../data-room/data-room.service';
import { FolderDto, toFolderDto } from './dto/folder.dto';

@Injectable()
export class FoldersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataRoomService: DataRoomService,
  ) {}

  async findRootFolders(userId: string): Promise<FolderDto[]> {
    const dataRoom = await this.dataRoomService.getOrCreateForUser(userId);

    const folders = await this.prisma.folder.findMany({
      where: {
        dataRoomId: dataRoom.id,
        parentId: null,
      },
      orderBy: { name: 'asc' },
    });

    return folders.map((folder) => toFolderDto(folder));
  }
}
