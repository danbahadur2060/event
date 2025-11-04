export type AppRole = "attendee" | "organizer" | "speaker" | "exhibitor" | "admin" | "superadmin";

export const hasAnyRole = (userRole: AppRole | undefined, allowed: AppRole[]): boolean => {
  if (!userRole) return false;
  if (userRole === "superadmin") return true; // superadmin bypass
  return allowed.includes(userRole);
};

export const requireRole = (userRole: AppRole | undefined, allowed: AppRole[]) => {
  if (!hasAnyRole(userRole, allowed)) {
    const err: any = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
};
