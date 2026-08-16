import { describe, expect, it } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateFileDto } from './create-file.dto';
import { FOLDER_TARGET_HELP } from '../utils/folder-target';
import { RequestUploadUrlDto } from './request-upload-url.dto';

const folderId = '550e8400-e29b-41d4-a716-446655440000';

function messages(errors: ReturnType<typeof validateSync>): string[] {
  return errors.flatMap((error) => Object.values(error.constraints ?? {}));
}

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

  it('returns a single folder target error when neither target is provided', () => {
    const dto = plainToInstance(RequestUploadUrlDto, {
      fileName: 'report.pdf',
      contentType: 'application/pdf',
    });

    expect(messages(validateSync(dto))).toEqual([FOLDER_TARGET_HELP]);
  });

  it('treats empty folderId as missing instead of invalid UUID', () => {
    const dto = plainToInstance(CreateFileDto, {
      name: 'report.pdf',
      folderId: '',
      storageKey: 'user/folder/report.pdf',
    });

    expect(messages(validateSync(dto))).toEqual([FOLDER_TARGET_HELP]);
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
