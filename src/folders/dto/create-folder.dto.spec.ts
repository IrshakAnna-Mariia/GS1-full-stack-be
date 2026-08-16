import { ValidationPipe } from '@nestjs/common';
import { describe, expect, it } from '@jest/globals';
import { CreateFolderDto } from './create-folder.dto';

const validationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

describe('CreateFolderDto', () => {
  it('accepts name for root folder creation', async () => {
    const result = (await validationPipe.transform(
      { name: 'Financial' },
      { type: 'body', metatype: CreateFolderDto },
    )) as CreateFolderDto;

    expect(result.name).toBe('Financial');
  });

  it('accepts folderName as an alias for name', async () => {
    const result = (await validationPipe.transform(
      { folderName: 'Financial' },
      { type: 'body', metatype: CreateFolderDto },
    )) as CreateFolderDto;

    expect(result.name).toBe('Financial');
  });

  it('treats empty parentId as root folder creation', async () => {
    const result = (await validationPipe.transform(
      { name: 'Financial', parentId: '' },
      { type: 'body', metatype: CreateFolderDto },
    )) as CreateFolderDto;

    expect(result.name).toBe('Financial');
    expect(result.parentId).toBeUndefined();
  });
});
