export type AuthUserDto = {
  id: string;
  email: string;
};

export function toAuthUserDto(user: {
  id: string;
  email?: string;
}): AuthUserDto {
  return {
    id: user.id,
    email: user.email ?? '',
  };
}
