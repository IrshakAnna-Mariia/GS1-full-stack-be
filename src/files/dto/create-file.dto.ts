import { Transform } from 'class-transformer';
import {
  Allow,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateFileDto {
  @Allow()
  fileName?: string;

  @Transform(({ obj }: { obj: Record<string, unknown> }) =>
    typeof obj.name === 'string' ? obj.name : obj.fileName,
  )
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID()
  folderId!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  storageKey?: string;

  @IsOptional()
  @IsString()
  contentType?: string;
}
