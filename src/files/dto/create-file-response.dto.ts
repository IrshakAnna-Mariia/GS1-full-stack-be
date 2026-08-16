import type { FileDto } from './file.dto';

export type CreateFileResponseDto = FileDto & {
  uploadUrl?: string;
};
