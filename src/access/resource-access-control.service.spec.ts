import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import type {
  FileEntity,
  FolderEntity,
  FolderWithDataRoomOwner,
  ShareEntity,
} from '../common/entities';
import { DatabaseGateway } from '../prisma/database.gateway';
import { ResourceAccessControlService } from './resource-access-control.service';

type MockedDatabaseGateway = {
  [
    K in keyof Pick<
      DatabaseGateway,
      | 'findDataRoomOwnerId'
      | 'findFolderById'
      | 'findFolderWithOwner'
      | 'findFileById'
      | 'findShareByToken'
      | 'findUserShareGrant'
    >
  ]: jest.MockedFunction<DatabaseGateway[K]>;
};

function createMockDatabaseGateway(): MockedDatabaseGateway {
  return {
    findDataRoomOwnerId: jest.fn<DatabaseGateway['findDataRoomOwnerId']>(),
    findFolderById: jest.fn<DatabaseGateway['findFolderById']>(),
    findFolderWithOwner: jest.fn<DatabaseGateway['findFolderWithOwner']>(),
    findFileById: jest.fn<DatabaseGateway['findFileById']>(),
    findShareByToken: jest.fn<DatabaseGateway['findShareByToken']>(),
    findUserShareGrant: jest.fn<DatabaseGateway['findUserShareGrant']>(),
  };
}

const folderWithOwner = (
  overrides: Partial<FolderWithDataRoomOwner> &
    Pick<FolderWithDataRoomOwner, 'id' | 'dataRoomId' | 'dataRoom'>,
): FolderWithDataRoomOwner => ({
  name: 'Folder',
  parentId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const folderEntity = (
  overrides: Partial<FolderEntity> & Pick<FolderEntity, 'id'>,
): FolderEntity => ({
  name: 'Folder',
  dataRoomId: 'room-1',
  parentId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const fileEntity = (
  overrides: Partial<FileEntity> & Pick<FileEntity, 'id' | 'folderId'>,
): FileEntity => ({
  name: 'File',
  storageKey: 'key',
  mimeType: 'application/pdf',
  size: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const shareEntity = (
  overrides: Partial<ShareEntity> &
    Pick<ShareEntity, 'id' | 'resourceType' | 'resourceId' | 'type'>,
): ShareEntity => ({
  permission: 'VIEWER',
  userId: null,
  token: null,
  createdBy: 'owner-1',
  createdAt: new Date(),
  ...overrides,
});

describe('ResourceAccessControlService', () => {
  let service: ResourceAccessControlService;
  let prisma: MockedDatabaseGateway;

  beforeEach(async () => {
    jest.resetAllMocks();
    prisma = createMockDatabaseGateway();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceAccessControlService,
        { provide: DatabaseGateway, useValue: prisma },
      ],
    }).compile();

    service = module.get(ResourceAccessControlService);
  });

  describe('canAccessResource', () => {
    it('grants owner access', async () => {
      prisma.findFolderWithOwner.mockResolvedValue(
        folderWithOwner({
          id: 'folder-1',
          dataRoomId: 'room-1',
          dataRoom: { ownerId: 'owner-1' },
        }),
      );

      await expect(
        service.canAccessResource(
          { id: 'owner-1' },
          { resourceType: 'FOLDER', resourceId: 'folder-1' },
        ),
      ).resolves.toEqual({ allowed: true, role: 'owner' });
    });

    it('grants viewer access via direct user share', async () => {
      prisma.findFolderWithOwner.mockResolvedValue(
        folderWithOwner({
          id: 'folder-1',
          dataRoomId: 'room-1',
          dataRoom: { ownerId: 'owner-1' },
        }),
      );
      prisma.findUserShareGrant.mockResolvedValue(
        shareEntity({
          id: 'share-1',
          resourceType: 'FOLDER',
          resourceId: 'folder-1',
          type: 'USER',
        }),
      );

      await expect(
        service.canAccessResource(
          { id: 'viewer-1' },
          { resourceType: 'FOLDER', resourceId: 'folder-1' },
        ),
      ).resolves.toEqual({ allowed: true, role: 'viewer' });
    });

    it('grants viewer access via parent folder share', async () => {
      prisma.findFolderWithOwner.mockResolvedValue(
        folderWithOwner({
          id: 'child-1',
          dataRoomId: 'room-1',
          parentId: 'parent-1',
          dataRoom: { ownerId: 'owner-1' },
        }),
      );
      prisma.findUserShareGrant
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(
          shareEntity({
            id: 'share-1',
            resourceType: 'FOLDER',
            resourceId: 'parent-1',
            type: 'USER',
          }),
        );
      prisma.findFolderById.mockResolvedValue(
        folderEntity({ id: 'parent-1', parentId: null }),
      );

      await expect(
        service.canAccessResource(
          { id: 'viewer-1' },
          { resourceType: 'FOLDER', resourceId: 'child-1' },
        ),
      ).resolves.toEqual({ allowed: true, role: 'viewer' });
    });

    it('grants viewer access via public share token', async () => {
      prisma.findFileById.mockResolvedValue(
        fileEntity({ id: 'file-1', folderId: 'folder-1' }),
      );
      prisma.findFolderWithOwner.mockResolvedValue(
        folderWithOwner({
          id: 'folder-1',
          dataRoomId: 'room-1',
          dataRoom: { ownerId: 'owner-1' },
        }),
      );
      prisma.findShareByToken.mockResolvedValue(
        shareEntity({
          id: 'share-1',
          type: 'PUBLIC',
          token: 'token-1',
          resourceType: 'FILE',
          resourceId: 'file-1',
        }),
      );

      await expect(
        service.canAccessResource(
          null,
          { resourceType: 'FILE', resourceId: 'file-1' },
          { publicShareToken: 'token-1' },
        ),
      ).resolves.toEqual({ allowed: true, role: 'viewer' });
    });

    it('denies access without share', async () => {
      prisma.findFolderWithOwner.mockResolvedValue(
        folderWithOwner({
          id: 'folder-1',
          dataRoomId: 'room-1',
          dataRoom: { ownerId: 'owner-1' },
        }),
      );
      prisma.findUserShareGrant.mockResolvedValue(null);

      await expect(
        service.canAccessResource(
          { id: 'viewer-1' },
          { resourceType: 'FOLDER', resourceId: 'folder-1' },
        ),
      ).resolves.toEqual({ allowed: false, role: 'none' });
    });
  });

  describe('canPerformAction', () => {
    it('allows owner all actions', () => {
      expect(
        service.canPerformAction({ allowed: true, role: 'owner' }, 'read'),
      ).toBe(true);
      expect(
        service.canPerformAction({ allowed: true, role: 'owner' }, 'delete'),
      ).toBe(true);
      expect(
        service.canPerformAction({ allowed: true, role: 'owner' }, 'share'),
      ).toBe(true);
    });

    it('allows viewer read only', () => {
      const viewer = { allowed: true, role: 'viewer' as const };
      expect(service.canPerformAction(viewer, 'read')).toBe(true);
      expect(service.canPerformAction(viewer, 'upload')).toBe(false);
      expect(service.canPerformAction(viewer, 'rename')).toBe(false);
      expect(service.canPerformAction(viewer, 'delete')).toBe(false);
      expect(service.canPerformAction(viewer, 'move')).toBe(false);
      expect(service.canPerformAction(viewer, 'share')).toBe(false);
    });
  });

  describe('assertCanPerformAction', () => {
    it('throws when viewer tries to delete', async () => {
      prisma.findFolderWithOwner.mockResolvedValue(
        folderWithOwner({
          id: 'folder-1',
          dataRoomId: 'room-1',
          dataRoom: { ownerId: 'owner-1' },
        }),
      );
      prisma.findUserShareGrant.mockResolvedValue(
        shareEntity({
          id: 'share-1',
          resourceType: 'FOLDER',
          resourceId: 'folder-1',
          type: 'USER',
        }),
      );

      await expect(
        service.assertCanPerformAction(
          { id: 'viewer-1' },
          { resourceType: 'FOLDER', resourceId: 'folder-1' },
          'delete',
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('getValidatedPublicShare', () => {
    it('throws when token is invalid', async () => {
      prisma.findShareByToken.mockResolvedValue(null);

      await expect(
        service.getValidatedPublicShare('bad-token'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
