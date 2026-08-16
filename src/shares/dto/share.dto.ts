import type {
  ShareEntity,
  SharePermission,
  ShareResourceType,
  ShareType,
} from '../../common/entities';

export type ShareDto = {
  id: string;
  resourceType: ShareResourceType;
  resourceId: string;
  permission: SharePermission;
  type: ShareType;
  userId: string | null;
  token: string | null;
  createdBy: string;
  createdAt: Date;
};

export function toShareDto(share: ShareEntity): ShareDto {
  return {
    id: share.id,
    resourceType: share.resourceType,
    resourceId: share.resourceId,
    permission: share.permission,
    type: share.type,
    userId: share.userId,
    token: share.token,
    createdBy: share.createdBy,
    createdAt: share.createdAt,
  };
}
