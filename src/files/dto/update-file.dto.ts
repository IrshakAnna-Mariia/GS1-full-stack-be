import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateFileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsUUID()
  folderId?: string;
}
