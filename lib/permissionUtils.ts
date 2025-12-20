// utils/permissionUtils.ts
import type { Role, Permissions } from "@/app/components/types";
import { defaultPermissions } from "@/app/components/types";

export const apiPermissionsToObject = (roles: Role[]): Permissions => {
  if (!roles || roles.length === 0) {
    return { ...defaultPermissions };
  }

  const rolePermissions = roles[0].permissions;

  return rolePermissions.reduce<Permissions>((acc, perm) => {
    if (perm.name in acc) {
      acc[perm.name as keyof Permissions] = Boolean(perm.value);
    }
    return acc;
  }, { ...defaultPermissions });
};
