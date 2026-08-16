import { ValidationPipe } from '@nestjs/common';
import { describe, expect, it } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateFileDto } from './create-file.dto';
import { RequestUploadUrlDto } from './request-upload-url.dto';

const folderId = '550e8400-e29b-41d4-a716-446655440000';
const validationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

describe('folder target validation', () => {
  it('accepts a valid folderId on upload-url', () => {
    const dto = plainToInstance(RequestUploadUrlDto, {
      fileName: 'report.pdf',
      folderId,
      contentType: 'application/pdf',
    });

    expect(validateSync(dto)).toEqual([]);
  });

  it('accepts a valid folderId on create file', () => {
    const dto = plainToInstance(CreateFileDto, {
      name: 'report.pdf',
      folderId,
      storageKey: 'user/folder/report.pdf',
    });

    expect(validateSync(dto)).toEqual([]);
  });

  it('accepts folderName when folderId is omitted', () => {
    const dto = plainToInstance(RequestUploadUrlDto, {
      fileName: 'report.pdf',
      folderName: 'Documents',
      contentType: 'application/pdf',
    });

    expect(validateSync(dto)).toEqual([]);
  });

  it('accepts requests without any folder target', () => {
    const dto = plainToInstance(RequestUploadUrlDto, {
      fileName: 'report.pdf',
      contentType: 'application/pdf',
    });

    expect(validateSync(dto)).toEqual([]);
  });

  it('accepts folderName-only payloads through Nest ValidationPipe', async () => {
    const result = (await validationPipe.transform(
      {
        fileName: 'report.pdf',
        folderName: 'Documents',
        contentType: 'application/pdf',
      },
      { type: 'body', metatype: RequestUploadUrlDto },
    )) as RequestUploadUrlDto;

    expect(result.folderName).toBe('Documents');
  });

  it('treats empty folderId as missing instead of invalid UUID', () => {
    const dto = plainToInstance(CreateFileDto, {
      name: 'report.pdf',
      folderId: '',
      storageKey: 'user/folder/report.pdf',
    });

    expect(validateSync(dto)).toEqual([]);
  });

  it('remaps a non-uuid folderId value to folderName', () => {
    const dto = plainToInstance(RequestUploadUrlDto, {
      fileName: 'report.pdf',
      folderId: 'Documents',
      contentType: 'application/pdf',
    });

    expect(validateSync(dto)).toEqual([]);
    expect(dto.folderId).toBe('Documents');
  });
});
