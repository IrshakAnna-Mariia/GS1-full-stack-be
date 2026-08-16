import type {
  DataRoomEntity,
  FileEntity,
  FolderEntity,
  FolderWithDataRoomOwner,
  ShareEntity,
} from '../common/entities';

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
      where: { dataRoomId: string; parentId: null };
      orderBy: { name: 'asc' };
    }): Promise<FolderEntity[]>;
    findUnique(args: {
      where: { id: string };
      include: { dataRoom: { select: { ownerId: true } } };
    }): Promise<FolderWithDataRoomOwner | null>;
  };
  file: {
    findMany(args: {
      where: { folderId: string };
      orderBy: { name: 'asc' };
    }): Promise<FileEntity[]>;
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
