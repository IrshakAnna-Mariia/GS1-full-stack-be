import type { TransformFnParams } from 'class-transformer';

export const trimOptionalStringTransform = ({
  value,
}: TransformFnParams): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};
