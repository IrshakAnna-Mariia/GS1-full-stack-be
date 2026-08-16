import type {
  DataRoomEntity,
  FileEntity,
  FolderEntity,
  FolderWithDataRoomOwner,
  ShareEntity,
  ShareResourceType,
} from '../common/entities';
import type { CreateShareData } from './database.client';

export type { CreateShareData } from './database.client';

export type FolderFindManyWhere =
  | { dataRoomId: string; parentId: null }
  | { parentId: string }
  | { parentId: string | null; dataRoomId: string }
  | { dataRoomId: string };

export type FileFindManyWhere =
  { folderId: string } | { folderId: { in: string[] } };

export abstract class DatabaseGateway {
  abstract upsertDataRoom(
    ownerId: string,
    name: string,
  ): Promise<DataRoomEntity>;

  abstract findDataRoomById(id: string): Promise<DataRoomEntity | null>;

  abstract findDataRoomOwnerId(id: string): Promise<string | null>;

  abstract findFolders(args: {
    where: FolderFindManyWhere;
    orderBy?: { name: 'asc' };
  }): Promise<FolderEntity[]>;

  abstract findFolderById(id: string): Promise<FolderEntity | null>;

  abstract findFolderWithOwner(
    id: string,
  ): Promise<FolderWithDataRoomOwner | null>;

  abstract createFolder(data: {
    name: string;
    dataRoomId: string;
    parentId?: string | null;
  }): Promise<FolderEntity>;

  abstract updateFolder(id: string, name: string): Promise<FolderEntity>;

  abstract deleteFolder(id: string): Promise<FolderEntity>;

  abstract findFiles(args: {
    where: FileFindManyWhere;
    orderBy?: { name: 'asc' };
  }): Promise<FileEntity[]>;

  abstract findFileById(id: string): Promise<FileEntity | null>;

  abstract updateFileFolder(id: string, folderId: string): Promise<FileEntity>;

  abstract updateFileName(id: string, name: string): Promise<FileEntity>;

  abstract createFile(data: {
    name: string;
    storageKey: string;
    mimeType: string;
    size: number;
    folderId: string;
  }): Promise<FileEntity>;

  abstract deleteFile(id: string): Promise<FileEntity>;

  abstract findSharesByResource(
    resourceType: ShareResourceType,
    resourceId: string,
  ): Promise<ShareEntity[]>;

  abstract findShareByToken(token: string): Promise<ShareEntity | null>;

  abstract findShareById(id: string): Promise<ShareEntity | null>;

  abstract findPublicShare(
    resourceType: ShareResourceType,
    resourceId: string,
  ): Promise<ShareEntity | null>;

  abstract findUserShare(
    resourceType: ShareResourceType,
    resourceId: string,
    userId: string,
  ): Promise<ShareEntity | null>;

  abstract findUserShareGrant(
    resourceType: ShareResourceType,
    resourceId: string,
    userId: string,
  ): Promise<ShareEntity | null>;

  abstract createShare(data: CreateShareData): Promise<ShareEntity>;

  abstract deleteShare(id: string): Promise<ShareEntity>;
}
