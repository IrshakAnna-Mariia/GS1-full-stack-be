import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileDto, toFileDto } from './dto/file.dto';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByFolder(userId: string, folderId: string): Promise<FileDto[]> {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
      include: { dataRoom: { select: { ownerId: true } } },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    if (folder.dataRoom.ownerId !== userId) {
      throw new ForbiddenException('Folder access denied');
    }

    const files = await this.prisma.file.findMany({
      where: { folderId },
      orderBy: { name: 'asc' },
    });

    return files.map((file) => toFileDto(file));
  }
}
