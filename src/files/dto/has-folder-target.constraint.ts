import type { TransformFnParams } from 'class-transformer';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  FOLDER_TARGET_HELP,
  hasValidFolderTarget,
} from '../utils/folder-target';

export const trimOptionalStringTransform = ({
  value,
}: TransformFnParams): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

@ValidatorConstraint({ name: 'HasFolderTarget', async: false })
export class HasFolderTargetConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    return hasValidFolderTarget(args.object);
  }

  defaultMessage(): string {
    return FOLDER_TARGET_HELP;
  }
}
