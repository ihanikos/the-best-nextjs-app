// Role definitions for the RBAC system
export type UserRole = "admin" | "manager" | "member" | "viewer";

export interface Permission {
  action: string;
  resource: string;
}

// Define all available permissions
export const PERMISSIONS = {
  // Team permissions
  TEAM_VIEW: { action: "view", resource: "team" },
  TEAM_CREATE: { action: "create", resource: "team" },
  TEAM_EDIT: { action: "edit", resource: "team" },
  TEAM_DELETE: { action: "delete", resource: "team" },
  TEAM_MANAGE_ROLES: { action: "manage_roles", resource: "team" },

  // Project permissions
  PROJECT_VIEW: { action: "view", resource: "project" },
  PROJECT_CREATE: { action: "create", resource: "project" },
  PROJECT_EDIT: { action: "edit", resource: "project" },
  PROJECT_DELETE: { action: "delete", resource: "project" },

  // Task permissions
  TASK_VIEW: { action: "view", resource: "task" },
  TASK_CREATE: { action: "create", resource: "task" },
  TASK_EDIT: { action: "edit", resource: "task" },
  TASK_DELETE: { action: "delete", resource: "task" },

  // Analytics permissions
  ANALYTICS_VIEW: { action: "view", resource: "analytics" },

  // Settings permissions
  SETTINGS_VIEW: { action: "view", resource: "settings" },
  SETTINGS_EDIT: { action: "edit", resource: "settings" },

  // User permissions
  USER_INVITE: { action: "invite", resource: "user" },
  USER_REMOVE: { action: "remove", resource: "user" },
} as const;

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.TEAM_CREATE,
    PERMISSIONS.TEAM_EDIT,
    PERMISSIONS.TEAM_DELETE,
    PERMISSIONS.TEAM_MANAGE_ROLES,
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_EDIT,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.USER_INVITE,
    PERMISSIONS.USER_REMOVE,
  ],
  manager: [
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.TEAM_EDIT,
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_EDIT,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.USER_INVITE,
  ],
  member: [
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT,
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_EDIT,
    PERMISSIONS.SETTINGS_VIEW,
  ],
  viewer: [
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],
};

// Role display information
export const ROLE_INFO: Record<UserRole, { label: string; description: string; color: string }> = {
  admin: {
    label: "Admin",
    description: "Full access to all features and settings",
    color: "bg-red-500",
  },
  manager: {
    label: "Manager",
    description: "Can manage projects and team members",
    color: "bg-blue-500",
  },
  member: {
    label: "Member",
    description: "Can create and edit tasks and projects",
    color: "bg-green-500",
  },
  viewer: {
    label: "Viewer",
    description: "Read-only access to projects and tasks",
    color: "bg-gray-500",
  },
};

// Check if a role has a specific permission
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.some(
    (p) => p.action === permission.action && p.resource === permission.resource
  );
}

// Check if a role has any of the specified permissions
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

// Check if a role has all of the specified permissions
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

// Get all permissions for a role
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

// Get human-readable role label
export function getRoleLabel(role: UserRole): string {
  return ROLE_INFO[role].label;
}

// Get role description
export function getRoleDescription(role: UserRole): string {
  return ROLE_INFO[role].description;
}

// Get role badge color
export function getRoleColor(role: UserRole): string {
  return ROLE_INFO[role].color;
}

// Validate if a string is a valid role
export function isValidRole(role: string): role is UserRole {
  return ["admin", "manager", "member", "viewer"].includes(role);
}

// Get all available roles
export function getAllRoles(): UserRole[] {
  return ["admin", "manager", "member", "viewer"];
}
