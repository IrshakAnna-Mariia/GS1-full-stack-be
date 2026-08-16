import { Expose, Transform } from 'class-transformer';
import {
  Allow,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

const trimOptionalString = ({
  value,
}: {
  value: unknown;
}): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export class CreateFolderDto {
  @Allow()
  folderName?: string;

  @Expose()
  @Transform(({ obj }: { obj: Record<string, unknown> }) =>
    typeof obj.name === 'string' ? obj.name : obj.folderName,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @Transform(trimOptionalString)
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
