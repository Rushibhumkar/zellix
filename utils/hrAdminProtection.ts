export const PROTECTED_ADMIN_ROLES = ["sup_admin", "sub_admin", "developer", "office_admin"] as const;
export const isHRAdminReadOnly = (actorRole?: string, targetRole?: string): boolean =>
  actorRole === "hr" && (!targetRole || (PROTECTED_ADMIN_ROLES as readonly string[]).includes(targetRole));
