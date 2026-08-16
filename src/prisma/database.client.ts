import type {
  DataRoomEntity,
  FileEntity,
  FolderEntity,
  FolderWithDataRoomOwner,
  ShareEntity,
  ShareResourceType,
  ShareType,
} from '../common/entities';

export type CreateShareData = {
  resourceType: ShareResourceType;
  resourceId: string;
  type: ShareType;
  permission: 'VIEWER';
  userId?: string | null;
  token?: string | null;
  createdBy: string;
};

type FolderFindManyWhere =
  | { dataRoomId: string; parentId: null }
  | { parentId: string }
  | { parentId: string | null; dataRoomId: string }
  | { dataRoomId: string };

type FileFindManyWhere = { folderId: string } | { folderId: { in: string[] } };

type ShareFindManyWhere =
  | { resourceType: ShareResourceType; resourceId: string }
  | { userId: string; type: 'USER' }
  | { OR: Array<{ userId: string } | { createdBy: string }> };

export interface DatabaseClient {
  dataRoom: {
    upsert(args: {
      where: { ownerId: string };
      update: Record<string, never>;
      create: { name: string; ownerId: string };
    }): Promise<DataRoomEntity>;
    findById(args: { where: { id: string } }): Promise<DataRoomEntity | null>;
    findOwnerId(args: {
      where: { id: string };
      select: { ownerId: true };
    }): Promise<{ ownerId: string } | null>;
  };
  folder: {
    findMany(args: {
      where: FolderFindManyWhere;
      orderBy?: { name: 'asc' };
    }): Promise<FolderEntity[]>;
    findById(args: { where: { id: string } }): Promise<FolderEntity | null>;
    findByIdWithOwner(args: {
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
    findById(args: { where: { id: string } }): Promise<FileEntity | null>;
    create(args: {
      data: {
        name: string;
        storageKey: string;
        mimeType: string;
        size: number;
        folderId: string;
      };
    }): Promise<FileEntity>;
    updateFolder(args: {
      where: { id: string };
      data: { folderId: string };
    }): Promise<FileEntity>;
    updateName(args: {
      where: { id: string };
      data: { name: string };
    }): Promise<FileEntity>;
    delete(args: { where: { id: string } }): Promise<FileEntity>;
  };
  share: {
    findMany(args: {
      where: ShareFindManyWhere;
      orderBy?: { createdAt: 'desc' };
    }): Promise<ShareEntity[]>;
    findPublicShare(args: {
      where: {
        resourceType: ShareResourceType;
        resourceId: string;
        type: 'PUBLIC';
      };
    }): Promise<ShareEntity | null>;
    findUserShare(args: {
      where: {
        resourceType: ShareResourceType;
        resourceId: string;
        type: 'USER';
        userId: string;
      };
    }): Promise<ShareEntity | null>;
    findUserShareGrant(args: {
      where: {
        resourceType: ShareResourceType;
        resourceId: string;
        type: 'USER';
        userId: string;
      };
    }): Promise<ShareEntity | null>;
    findById(args: { where: { id: string } }): Promise<ShareEntity | null>;
    findByToken(args: {
      where: { token: string };
    }): Promise<ShareEntity | null>;
    create(args: { data: CreateShareData }): Promise<ShareEntity>;
    delete(args: { where: { id: string } }): Promise<ShareEntity>;
  };
}

export type DatabaseLifecycle = {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
};

export type DatabaseConnection = {
  client: DatabaseClient;
  lifecycle: DatabaseLifecycle;
};
