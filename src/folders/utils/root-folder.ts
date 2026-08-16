import type { DatabaseGateway } from '../../prisma/database.gateway';

export const DEFAULT_ROOT_FOLDER_NAME = 'Documents';

export async function getOrCreateRootFolderByName(
  prisma: DatabaseGateway,
  dataRoomId: string,
  folderName: string,
): Promise<string> {
  const folders = await prisma.findFolders({
    where: { dataRoomId, parentId: null },
    orderBy: { name: 'asc' },
  });

  const normalizedName = folderName.toLowerCase();
  const existing = folders.find(
    (folder) => folder.name.toLowerCase() === normalizedName,
  );
  if (existing) {
    return existing.id;
  }

  const folder = await prisma.createFolder({
    name: folderName,
    dataRoomId,
    parentId: null,
  });

  return folder.id;
}
