import { isUUID } from 'class-validator';

export const FOLDER_TARGET_HELP =
  'Provide folderId (UUID from GET /folders) or folderName (creates a root folder if needed).';

export type FolderTargetInput = {
  folderId?: unknown;
  folderName?: unknown;
};

export type NormalizedFolderTarget = {
  folderId?: string;
  folderName?: string;
};

export function normalizeFolderTarget(
  target: FolderTargetInput,
): NormalizedFolderTarget {
  const folderId =
    typeof target.folderId === 'string' && target.folderId.trim().length > 0
      ? target.folderId.trim()
      : undefined;
  const folderName =
    typeof target.folderName === 'string' && target.folderName.trim().length > 0
      ? target.folderName.trim()
      : undefined;

  if (folderId && !isUUID(folderId)) {
    return {
      folderId: undefined,
      folderName: folderName ?? folderId,
    };
  }

  return { folderId, folderName };
}

export function hasValidFolderTarget(target: FolderTargetInput): boolean {
  const { folderId, folderName } = normalizeFolderTarget(target);
  return Boolean((folderId && isUUID(folderId)) || folderName);
}

export function shouldValidateFolderId(target: FolderTargetInput): boolean {
  return Boolean(normalizeFolderTarget(target).folderId);
}
