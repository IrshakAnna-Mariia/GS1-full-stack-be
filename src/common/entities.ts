export type DataRoomEntity = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
};

export type FolderEntity = {
  id: string;
  name: string;
  dataRoomId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FolderWithDataRoomOwner = FolderEntity & {
  dataRoom: {
    ownerId: string;
  };
};

export type FileEntity = {
  id: string;
  name: string;
  storageKey: string;
  mimeType: string;
  size: number;
  folderId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ShareResourceType = 'DATA_ROOM' | 'FOLDER' | 'FILE';
export type SharePermission = 'VIEWER';
export type ShareType = 'PUBLIC' | 'USER';

export type ShareEntity = {
  id: string;
  resourceType: ShareResourceType;
  resourceId: string;
  permission: SharePermission;
  type: ShareType;
  userId: string | null;
  token: string | null;
  createdBy: string;
  createdAt: Date;
};

export type DataRoomOwnerEntity = {
  ownerId: string;
};
