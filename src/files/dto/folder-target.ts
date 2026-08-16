import type { TransformFnParams } from 'class-transformer';
import { isUUID } from 'class-validator';

export const FOLDER_TARGET_HELP =
  'Provide folderId (UUID from GET /folders) or folderName (creates a root folder if needed).';

export function remapFolderIdTransform({
  value,
  obj,
}: TransformFnParams): unknown {
  const target = obj as { folderId?: string; folderName?: string };

  if (typeof value === 'string' && value.length > 0 && !isUUID(value)) {
    target.folderName ??= value;
    return undefined;
  }

  return value;
}
