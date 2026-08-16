import { Inject, Injectable } from '@nestjs/common';
import type {
  DataRoomEntity,
  FileEntity,
  FolderEntity,
  FolderWithDataRoomOwner,
  ShareEntity,
  ShareResourceType,
} from '../common/entities';
import type { CreateShareData, DatabaseClient } from './database.client';
import {
  DatabaseGateway,
  type FileFindManyWhere,
  type FolderFindManyWhere,
} from './database.gateway';

@Injectable()
export class PrismaService extends DatabaseGateway {
  constructor(
    @Inject('DATABASE_CLIENT')
    private readonly client: DatabaseClient,
  ) {
    super();
  }

  override upsertDataRoom(
    ownerId: string,
    name: string,
  ): Promise<DataRoomEntity> {
    return this.client.dataRoom.upsert({
      where: { ownerId },
      update: {},
      create: { name, ownerId },
    });
  }

  override findDataRoomById(id: string): Promise<DataRoomEntity | null> {
    return this.client.dataRoom.findById({ where: { id } });
  }

  override findDataRoomOwnerId(id: string): Promise<string | null> {
    return this.client.dataRoom
      .findOwnerId({ where: { id }, select: { ownerId: true } })
      .then((dataRoom) => dataRoom?.ownerId ?? null);
  }

  override findFolders(args: {
    where: FolderFindManyWhere;
    orderBy?: { name: 'asc' };
  }): Promise<FolderEntity[]> {
    return this.client.folder.findMany(args);
  }

  override findFolderById(id: string): Promise<FolderEntity | null> {
    return this.client.folder.findById({ where: { id } });
  }

  override findFolderWithOwner(
    id: string,
  ): Promise<FolderWithDataRoomOwner | null> {
    return this.client.folder.findByIdWithOwner({
      where: { id },
      include: { dataRoom: { select: { ownerId: true } } },
    });
  }

  override createFolder(data: {
    name: string;
    dataRoomId: string;
    parentId?: string | null;
  }): Promise<FolderEntity> {
    return this.client.folder.create({ data });
  }

  override updateFolder(id: string, name: string): Promise<FolderEntity> {
    return this.client.folder.update({
      where: { id },
      data: { name },
    });
  }

  override deleteFolder(id: string): Promise<FolderEntity> {
    return this.client.folder.delete({ where: { id } });
  }

  override findFiles(args: {
    where: FileFindManyWhere;
    orderBy?: { name: 'asc' };
  }): Promise<FileEntity[]> {
    return this.client.file.findMany(args);
  }

  override findFileById(id: string): Promise<FileEntity | null> {
    return this.client.file.findById({ where: { id } });
  }

  override updateFileFolder(id: string, folderId: string): Promise<FileEntity> {
    return this.client.file.updateFolder({
      where: { id },
      data: { folderId },
    });
  }

  override updateFileName(id: string, name: string): Promise<FileEntity> {
    return this.client.file.updateName({
      where: { id },
      data: { name },
    });
  }

  override createFile(data: {
    name: string;
    storageKey: string;
    mimeType: string;
    size: number;
    folderId: string;
  }): Promise<FileEntity> {
    return this.client.file.create({ data });
  }

  override deleteFile(id: string): Promise<FileEntity> {
    return this.client.file.delete({ where: { id } });
  }

  override findSharesByResource(
    resourceType: ShareResourceType,
    resourceId: string,
  ): Promise<ShareEntity[]> {
    return this.client.share.findMany({
      where: { resourceType, resourceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  override findShareByToken(token: string): Promise<ShareEntity | null> {
    return this.client.share.findByToken({ where: { token } });
  }

  override findShareById(id: string): Promise<ShareEntity | null> {
    return this.client.share.findById({ where: { id } });
  }

  override findPublicShare(
    resourceType: ShareResourceType,
    resourceId: string,
  ): Promise<ShareEntity | null> {
    return this.client.share.findPublicShare({
      where: { resourceType, resourceId, type: 'PUBLIC' },
    });
  }

  override findUserShare(
    resourceType: ShareResourceType,
    resourceId: string,
    userId: string,
  ): Promise<ShareEntity | null> {
    return this.client.share.findUserShare({
      where: { resourceType, resourceId, type: 'USER', userId },
    });
  }

  override findUserShareGrant(
    resourceType: ShareResourceType,
    resourceId: string,
    userId: string,
  ): Promise<ShareEntity | null> {
    return this.client.share.findUserShareGrant({
      where: { resourceType, resourceId, type: 'USER', userId },
    });
  }

  override createShare(data: CreateShareData): Promise<ShareEntity> {
    return this.client.share.create({ data });
  }

  override deleteShare(id: string): Promise<ShareEntity> {
    return this.client.share.delete({ where: { id } });
  }
}
