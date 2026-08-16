import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { FolderWithDataRoomOwner } from '../common/entities';
import { toFileDto } from '../files/dto/file.dto';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { DataRoomService } from '../data-room/data-room.service';
import type { CreateFolderDto } from './dto/create-folder.dto';
import type { FolderContentsDto } from './dto/folder-contents.dto';
import { FolderDto, toFolderDto } from './dto/folder.dto';
import type { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dataRoomService: DataRoomService,
    private readonly storageService: StorageService,
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

  async create(userId: string, dto: CreateFolderDto): Promise<FolderDto> {
    const dataRoom = await this.dataRoomService.getOrCreateForUser(userId);

    if (dto.parentId) {
      const parent = await this.getFolderForUser(userId, dto.parentId);

      if (parent.dataRoomId !== dataRoom.id) {
        throw new BadRequestException(
          'Parent folder must belong to your data room',
        );
      }
    }

    const folder = await this.prisma.folder.create({
      data: {
        name: dto.name,
        dataRoomId: dataRoom.id,
        parentId: dto.parentId ?? null,
      },
    });

    return toFolderDto(folder);
  }

  async findOne(userId: string, folderId: string): Promise<FolderDto> {
    const folder = await this.getFolderForUser(userId, folderId);
    return toFolderDto(folder);
  }

  async getContents(
    userId: string,
    folderId: string,
  ): Promise<FolderContentsDto> {
    const folder = await this.getFolderForUser(userId, folderId);

    const [childFolders, files] = await Promise.all([
      this.prisma.folder.findMany({
        where: { parentId: folderId },
        orderBy: { name: 'asc' },
      }),
      this.prisma.file.findMany({
        where: { folderId },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      folder: toFolderDto(folder),
      folders: childFolders.map((child) => toFolderDto(child)),
      files: files.map((file) => toFileDto(file)),
    };
  }

  async update(
    userId: string,
    folderId: string,
    dto: UpdateFolderDto,
  ): Promise<FolderDto> {
    await this.getFolderForUser(userId, folderId);

    const folder = await this.prisma.folder.update({
      where: { id: folderId },
      data: { name: dto.name },
    });

    return toFolderDto(folder);
  }

  async remove(userId: string, folderId: string): Promise<FolderDto> {
    await this.getFolderForUser(userId, folderId);
    const storageKeys = await this.collectStorageKeysInSubtree(folderId);

    await this.storageService.deleteObjects(storageKeys);

    const deleted = await this.prisma.folder.delete({
      where: { id: folderId },
    });

    return toFolderDto(deleted);
  }

  private async getFolderForUser(
    userId: string,
    folderId: string,
  ): Promise<FolderWithDataRoomOwner> {
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

    return folder;
  }

  private async collectStorageKeysInSubtree(
    rootFolderId: string,
  ): Promise<string[]> {
    const folderIds = await this.collectFolderIds(rootFolderId);

    const files = await this.prisma.file.findMany({
      where: { folderId: { in: folderIds } },
    });

    return files.map((file) => file.storageKey);
  }

  private async collectFolderIds(rootFolderId: string): Promise<string[]> {
    const folderIds = [rootFolderId];
    const children = await this.prisma.folder.findMany({
      where: { parentId: rootFolderId },
    });

    for (const child of children) {
      const childIds = await this.collectFolderIds(child.id);
      folderIds.push(...childIds);
    }

    return folderIds;
  }
}
