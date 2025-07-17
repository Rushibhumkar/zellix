export const checkPermission = (perm, module, task, userRole) => {
  return userRole === "sup_admin" || perm[module]?.[task]?.value === true;
};
