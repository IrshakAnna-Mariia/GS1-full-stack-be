import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { normalizeEmail } from '../../common/utils/normalize-email';

export class LoginDto {
  @Transform(({ value }) => normalizeEmail(value))
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
