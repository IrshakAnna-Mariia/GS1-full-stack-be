import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseGateway } from '../prisma/database.gateway';
import { ShareAccessService } from './share-access.service';

describe('ShareAccessService', () => {
  let service: ShareAccessService;

  const prisma = {
    findDataRoomById: jest.fn(),
    findDataRoomOwnerId: jest.fn(),
    findFolderById: jest.fn(),
    findFolderWithOwner: jest.fn(),
    findFileById: jest.fn(),
    findShareByToken: jest.fn(),
    findUserShareGrant: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShareAccessService,
        { provide: DatabaseGateway, useValue: prisma },
      ],
    }).compile();

    service = module.get(ShareAccessService);
  });

  describe('canReadFolder', () => {
    it('grants owner read access', async () => {
      prisma.findFolderWithOwner.mockResolvedValue({
        id: 'folder-1',
        dataRoomId: 'room-1',
        parentId: null,
        dataRoom: { ownerId: 'owner-1' },
      });

      await expect(service.canReadFolder('owner-1', 'folder-1')).resolves.toBe(
        true,
      );
    });

    it('grants read access via data room user share', async () => {
      prisma.findFolderWithOwner.mockResolvedValue({
        id: 'folder-1',
        dataRoomId: 'room-1',
        parentId: null,
        dataRoom: { ownerId: 'owner-1' },
      });
      prisma.findUserShareGrant.mockResolvedValue({ id: 'share-1' });

      await expect(service.canReadFolder('viewer-1', 'folder-1')).resolves.toBe(
        true,
      );
    });

    it('grants read access via ancestor folder share', async () => {
      prisma.findFolderWithOwner.mockResolvedValue({
        id: 'child-1',
        dataRoomId: 'room-1',
        parentId: 'parent-1',
        dataRoom: { ownerId: 'owner-1' },
      });
      prisma.findUserShareGrant
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'share-1' });
      prisma.findFolderById.mockResolvedValue({
        id: 'parent-1',
        parentId: null,
      });

      await expect(service.canReadFolder('viewer-1', 'child-1')).resolves.toBe(
        true,
      );
    });

    it('denies access without share', async () => {
      prisma.findFolderWithOwner.mockResolvedValue({
        id: 'folder-1',
        dataRoomId: 'room-1',
        parentId: null,
        dataRoom: { ownerId: 'owner-1' },
      });
      prisma.findUserShareGrant.mockResolvedValue(null);

      await expect(service.canReadFolder('viewer-1', 'folder-1')).resolves.toBe(
        false,
      );
    });
  });

  describe('getValidatedPublicShare', () => {
    it('returns share for valid public token', async () => {
      const share = {
        id: 'share-1',
        type: 'PUBLIC',
        token: 'token-1',
        resourceType: 'FILE',
        resourceId: 'file-1',
      };
      prisma.findShareByToken.mockResolvedValue(share);
      prisma.findFileById.mockResolvedValue({
        id: 'file-1',
        folderId: 'folder-1',
      });
      prisma.findFolderWithOwner.mockResolvedValue({
        id: 'folder-1',
        dataRoom: { ownerId: 'owner-1' },
      });

      await expect(service.getValidatedPublicShare('token-1')).resolves.toEqual(
        share,
      );
    });

    it('throws when token is invalid', async () => {
      prisma.findShareByToken.mockResolvedValue(null);

      await expect(
        service.getValidatedPublicShare('bad-token'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws when shared resource was deleted', async () => {
      prisma.findShareByToken.mockResolvedValue({
        id: 'share-1',
        type: 'PUBLIC',
        token: 'token-1',
        resourceType: 'FILE',
        resourceId: 'file-1',
      });
      prisma.findFileById.mockResolvedValue(null);

      await expect(
        service.getValidatedPublicShare('token-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('isFolderWithinShareScope', () => {
    it('allows nested folders for folder share', async () => {
      prisma.findFolderById
        .mockResolvedValueOnce({
          id: 'child-1',
          dataRoomId: 'room-1',
          parentId: 'parent-1',
        })
        .mockResolvedValueOnce({ id: 'child-1', parentId: 'parent-1' });

      await expect(
        service.isFolderWithinShareScope(
          {
            id: 'share-1',
            resourceType: 'FOLDER',
            resourceId: 'parent-1',
            permission: 'VIEWER',
            type: 'PUBLIC',
            userId: null,
            token: 'token',
            createdBy: 'owner-1',
            createdAt: new Date(),
          },
          'child-1',
        ),
      ).resolves.toBe(true);
    });
  });
});
