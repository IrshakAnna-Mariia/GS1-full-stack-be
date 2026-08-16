import { BadRequestException, Injectable } from '@nestjs/common';
import { ResourceAccessGateway } from '../access/resource-access.gateway';
import { toFileDto } from '../files/dto/file.dto';
import { DatabaseGateway } from '../prisma/database.gateway';
import { StorageGateway } from '../storage/storage.gateway';
import { DataRoomService } from '../data-room/data-room.service';
import type { CreateFolderDto } from './dto/create-folder.dto';
import type { FolderContentsDto } from './dto/folder-contents.dto';
import { FolderDto, toFolderDto } from './dto/folder.dto';
import type { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  constructor(
    private readonly prisma: DatabaseGateway,
    private readonly dataRoomService: DataRoomService,
    private readonly storageService: StorageGateway,
    private readonly resourceAccess: ResourceAccessGateway,
  ) {}

  async findRootFolders(userId: string): Promise<FolderDto[]> {
    const dataRoom = await this.dataRoomService.getOrCreateForUser(userId);

    const folders = await this.prisma.findFolders({
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
      const parent = await this.resourceAccess.getFolderForWrite(
        userId,
        dto.parentId,
      );

      if (parent.dataRoomId !== dataRoom.id) {
        throw new BadRequestException(
          'Parent folder must belong to your data room',
        );
      }
    }

    const folder = await this.prisma.createFolder({
      name: dto.name,
      dataRoomId: dataRoom.id,
      parentId: dto.parentId ?? null,
    });

    return toFolderDto(folder);
  }

  async findOne(userId: string, folderId: string): Promise<FolderDto> {
    const folder = await this.resourceAccess.getFolderForRead(userId, folderId);
    return toFolderDto(folder);
  }

  async getContents(
    userId: string,
    folderId: string,
  ): Promise<FolderContentsDto> {
    const folder = await this.resourceAccess.getFolderForRead(userId, folderId);

    const [childFolders, files] = await Promise.all([
      this.prisma.findFolders({
        where: { parentId: folderId },
        orderBy: { name: 'asc' },
      }),
      this.prisma.findFiles({
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
    await this.resourceAccess.getFolderForWrite(userId, folderId);

    const folder = await this.prisma.updateFolder(folderId, dto.name);

    return toFolderDto(folder);
  }

  async remove(userId: string, folderId: string): Promise<FolderDto> {
    await this.resourceAccess.getFolderForWrite(userId, folderId);
    const storageKeys = await this.collectStorageKeysInSubtree(folderId);

    await this.storageService.deleteObjects(storageKeys);

    const deleted = await this.prisma.deleteFolder(folderId);

    return toFolderDto(deleted);
  }

  private async collectStorageKeysInSubtree(
    rootFolderId: string,
  ): Promise<string[]> {
    const folderIds = await this.collectFolderIds(rootFolderId);

    const files = await this.prisma.findFiles({
      where: { folderId: { in: folderIds } },
    });

    return files.map((file) => file.storageKey);
  }

  private async collectFolderIds(rootFolderId: string): Promise<string[]> {
    const folderIds = [rootFolderId];
    const children = await this.prisma.findFolders({
      where: { parentId: rootFolderId },
    });

    for (const child of children) {
      const childIds = await this.collectFolderIds(child.id);
      folderIds.push(...childIds);
    }

    return folderIds;
  }
}
