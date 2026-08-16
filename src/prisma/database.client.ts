import type {
  DataRoomEntity,
  FileEntity,
  FolderEntity,
  FolderWithDataRoomOwner,
  ShareEntity,
} from '../common/entities';

type FolderFindManyWhere =
  | { dataRoomId: string; parentId: null }
  | { parentId: string }
  | { parentId: string | null; dataRoomId: string };

type FileFindManyWhere = { folderId: string } | { folderId: { in: string[] } };

export interface DatabaseClient {
  dataRoom: {
    upsert(args: {
      where: { ownerId: string };
      update: Record<string, never>;
      create: { name: string; ownerId: string };
    }): Promise<DataRoomEntity>;
    findUnique(args: {
      where: { id: string };
      select: { ownerId: true };
    }): Promise<{ ownerId: string } | null>;
  };
  folder: {
    findMany(args: {
      where: FolderFindManyWhere;
      orderBy?: { name: 'asc' };
    }): Promise<FolderEntity[]>;
    findUnique(args: {
      where: { id: string };
      include: { dataRoom: { select: { ownerId: true } } };
    }): Promise<FolderWithDataRoomOwner | null>;
    create(args: {
      data: {
        name: string;
        dataRoomId: string;
        parentId?: string | null;
      };
    }): Promise<FolderEntity>;
    update(args: {
      where: { id: string };
      data: { name: string };
    }): Promise<FolderEntity>;
    delete(args: { where: { id: string } }): Promise<FolderEntity>;
  };
  file: {
    findMany(args: {
      where: FileFindManyWhere;
      orderBy?: { name: 'asc' };
    }): Promise<FileEntity[]>;
    findUnique(args: { where: { id: string } }): Promise<FileEntity | null>;
    update(args: {
      where: { id: string };
      data: { folderId: string };
    }): Promise<FileEntity>;
  };
  share: {
    findMany(args: {
      where: {
        OR: Array<{ userId: string } | { createdBy: string }>;
      };
      orderBy: { createdAt: 'desc' };
    }): Promise<ShareEntity[]>;
  };
}
