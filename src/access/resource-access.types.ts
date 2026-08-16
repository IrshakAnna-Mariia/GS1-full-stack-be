import type { ShareResourceType } from '../common/entities';

export type ResourceRef = {
  resourceType: ShareResourceType;
  resourceId: string;
};

export type AccessUser = {
  id: string;
};

export type ResourceAccessRole = 'owner' | 'viewer' | 'none';

export type ResourceAccessResult = {
  allowed: boolean;
  role: ResourceAccessRole;
};

export type ResourceAccessOptions = {
  publicShareToken?: string;
};

/** Backend actions mapped to HTTP operations. Viewers may only `read`. */
export type ResourceAction =
  'read' | 'upload' | 'rename' | 'delete' | 'move' | 'share';

export const VIEWER_ALLOWED_ACTIONS: ReadonlySet<ResourceAction> = new Set([
  'read',
]);

export const OWNER_ONLY_ACTIONS: ReadonlySet<ResourceAction> = new Set([
  'upload',
  'rename',
  'delete',
  'move',
  'share',
]);
