import { Transform } from 'class-transformer';
import {
  Allow,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
  ValidateIf,
} from 'class-validator';
import {
  HasFolderTargetConstraint,
  trimOptionalStringTransform,
} from './has-folder-target.constraint';
import {
  FOLDER_TARGET_HELP,
  shouldValidateFolderId,
} from '../utils/folder-target';

export class CreateFileDto {
  @Allow()
  fileName?: string;

  @Transform(({ obj }: { obj: Record<string, unknown> }) =>
    typeof obj.name === 'string' ? obj.name : obj.fileName,
  )
  @IsString()
  @IsNotEmpty()
  @Validate(HasFolderTargetConstraint)
  name!: string;

  @Transform(trimOptionalStringTransform)
  @ValidateIf(shouldValidateFolderId)
  @IsUUID(undefined, { message: FOLDER_TARGET_HELP })
  folderId?: string;

  @Transform(trimOptionalStringTransform)
  folderName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  storageKey?: string;

  @IsOptional()
  @IsString()
  contentType?: string;
}
