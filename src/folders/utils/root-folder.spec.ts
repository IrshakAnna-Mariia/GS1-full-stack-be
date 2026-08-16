import { describe, expect, it, jest } from '@jest/globals';
import type { DatabaseGateway } from '../../prisma/database.gateway';
import {
  DEFAULT_ROOT_FOLDER_NAME,
  getOrCreateRootFolderByName,
} from './root-folder';

describe('getOrCreateRootFolderByName', () => {
  it('returns an existing root folder id', async () => {
    const prisma = {
      findFolders: jest.fn<DatabaseGateway['findFolders']>().mockResolvedValue([
        {
          id: 'folder-1',
          name: 'Documents',
          dataRoomId: 'room-1',
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
      createFolder: jest.fn<DatabaseGateway['createFolder']>(),
    } as Pick<DatabaseGateway, 'findFolders' | 'createFolder'>;

    await expect(
      getOrCreateRootFolderByName(
        prisma as DatabaseGateway,
        'room-1',
        DEFAULT_ROOT_FOLDER_NAME,
      ),
    ).resolves.toBe('folder-1');
    expect(prisma.createFolder).not.toHaveBeenCalled();
  });

  it('creates a root folder when none exists', async () => {
    const prisma = {
      findFolders: jest
        .fn<DatabaseGateway['findFolders']>()
        .mockResolvedValue([]),
      createFolder: jest
        .fn<DatabaseGateway['createFolder']>()
        .mockResolvedValue({
          id: 'folder-2',
          name: DEFAULT_ROOT_FOLDER_NAME,
          dataRoomId: 'room-1',
          parentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
    } as Pick<DatabaseGateway, 'findFolders' | 'createFolder'>;

    await expect(
      getOrCreateRootFolderByName(
        prisma as DatabaseGateway,
        'room-1',
        DEFAULT_ROOT_FOLDER_NAME,
      ),
    ).resolves.toBe('folder-2');
  });
});
