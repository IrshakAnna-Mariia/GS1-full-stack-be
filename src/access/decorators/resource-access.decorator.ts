import { SetMetadata } from '@nestjs/common';
import type { ShareResourceType } from '../../common/entities';
import type { ResourceAction } from '../resource-access.types';

export type ResourceAccessMetadata = {
  action: ResourceAction;
  resourceType: ShareResourceType;
  resourceIdParam: string;
};

export const RESOURCE_ACCESS_KEY = 'resourceAccess';

export const ResourceAccess = (
  action: ResourceAction,
  resourceType: ShareResourceType,
  resourceIdParam: string,
) =>
  SetMetadata(RESOURCE_ACCESS_KEY, {
    action,
    resourceType,
    resourceIdParam,
  } satisfies ResourceAccessMetadata);
