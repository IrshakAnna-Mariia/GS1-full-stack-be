import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateFileDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID()
  folderId!: string;

  @IsString()
  @IsNotEmpty()
  storageKey!: string;
}
