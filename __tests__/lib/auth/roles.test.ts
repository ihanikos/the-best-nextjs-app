import {
  UserRole,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_INFO,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  getRoleLabel,
  getRoleDescription,
  getRoleColor,
  isValidRole,
  getAllRoles,
} from "@/lib/auth/roles";

describe("RBAC Roles System", () => {
  describe("Role Definitions", () => {
    it("should define all four roles", () => {
      const roles = getAllRoles();
      expect(roles).toEqual(["admin", "manager", "member", "viewer"]);
    });

    it("should validate role strings correctly", () => {
      expect(isValidRole("admin")).toBe(true);
      expect(isValidRole("manager")).toBe(true);
      expect(isValidRole("member")).toBe(true);
      expect(isValidRole("viewer")).toBe(true);
      expect(isValidRole("invalid")).toBe(false);
      expect(isValidRole("")).toBe(false);
    });
  });

  describe("Permission Definitions", () => {
    it("should define TEAM permissions", () => {
      expect(PERMISSIONS.TEAM_VIEW).toEqual({ action: "view", resource: "team" });
      expect(PERMISSIONS.TEAM_CREATE).toEqual({ action: "create", resource: "team" });
      expect(PERMISSIONS.TEAM_EDIT).toEqual({ action: "edit", resource: "team" });
      expect(PERMISSIONS.TEAM_DELETE).toEqual({ action: "delete", resource: "team" });
      expect(PERMISSIONS.TEAM_MANAGE_ROLES).toEqual({ action: "manage_roles", resource: "team" });
    });

    it("should define PROJECT permissions", () => {
      expect(PERMISSIONS.PROJECT_VIEW).toEqual({ action: "view", resource: "project" });
      expect(PERMISSIONS.PROJECT_CREATE).toEqual({ action: "create", resource: "project" });
      expect(PERMISSIONS.PROJECT_EDIT).toEqual({ action: "edit", resource: "project" });
      expect(PERMISSIONS.PROJECT_DELETE).toEqual({ action: "delete", resource: "project" });
    });

    it("should define TASK permissions", () => {
      expect(PERMISSIONS.TASK_VIEW).toEqual({ action: "view", resource: "task" });
      expect(PERMISSIONS.TASK_CREATE).toEqual({ action: "create", resource: "task" });
      expect(PERMISSIONS.TASK_EDIT).toEqual({ action: "edit", resource: "task" });
      expect(PERMISSIONS.TASK_DELETE).toEqual({ action: "delete", resource: "task" });
    });
  });

  describe("Role Permission Mapping", () => {
    it("admin should have all permissions", () => {
      const adminPermissions = ROLE_PERMISSIONS.admin;
      expect(adminPermissions).toContainEqual(PERMISSIONS.TEAM_VIEW);
      expect(adminPermissions).toContainEqual(PERMISSIONS.TEAM_DELETE);
      expect(adminPermissions).toContainEqual(PERMISSIONS.TEAM_MANAGE_ROLES);
      expect(adminPermissions).toContainEqual(PERMISSIONS.USER_REMOVE);
    });

    it("manager should have project and team management permissions but not all admin permissions", () => {
      const managerPermissions = ROLE_PERMISSIONS.manager;
      expect(managerPermissions).toContainEqual(PERMISSIONS.PROJECT_CREATE);
      expect(managerPermissions).toContainEqual(PERMISSIONS.USER_INVITE);
      expect(managerPermissions).not.toContainEqual(PERMISSIONS.TEAM_DELETE);
      expect(managerPermissions).not.toContainEqual(PERMISSIONS.USER_REMOVE);
    });

    it("member should have limited edit permissions", () => {
      const memberPermissions = ROLE_PERMISSIONS.member;
      expect(memberPermissions).toContainEqual(PERMISSIONS.TASK_CREATE);
      expect(memberPermissions).toContainEqual(PERMISSIONS.TASK_EDIT);
      expect(memberPermissions).not.toContainEqual(PERMISSIONS.TEAM_MANAGE_ROLES);
      expect(memberPermissions).not.toContainEqual(PERMISSIONS.USER_INVITE);
    });

    it("viewer should only have view permissions", () => {
      const viewerPermissions = ROLE_PERMISSIONS.viewer;
      expect(viewerPermissions).toContainEqual(PERMISSIONS.TEAM_VIEW);
      expect(viewerPermissions).toContainEqual(PERMISSIONS.PROJECT_VIEW);
      expect(viewerPermissions).toContainEqual(PERMISSIONS.TASK_VIEW);
      expect(viewerPermissions).not.toContainEqual(PERMISSIONS.PROJECT_CREATE);
      expect(viewerPermissions).not.toContainEqual(PERMISSIONS.TASK_EDIT);
    });
  });

  describe("hasPermission", () => {
    it("should return true when role has permission", () => {
      expect(hasPermission("admin", PERMISSIONS.TEAM_DELETE)).toBe(true);
      expect(hasPermission("manager", PERMISSIONS.PROJECT_CREATE)).toBe(true);
      expect(hasPermission("member", PERMISSIONS.TASK_EDIT)).toBe(true);
      expect(hasPermission("viewer", PERMISSIONS.TASK_VIEW)).toBe(true);
    });

    it("should return false when role does not have permission", () => {
      expect(hasPermission("viewer", PERMISSIONS.TEAM_DELETE)).toBe(false);
      expect(hasPermission("member", PERMISSIONS.USER_REMOVE)).toBe(false);
      expect(hasPermission("manager", PERMISSIONS.TEAM_MANAGE_ROLES)).toBe(false);
    });
  });

  describe("hasAnyPermission", () => {
    it("should return true if role has any of the permissions", () => {
      expect(
        hasAnyPermission("member", [PERMISSIONS.TASK_DELETE, PERMISSIONS.TASK_EDIT])
      ).toBe(true);
    });

    it("should return false if role has none of the permissions", () => {
      expect(
        hasAnyPermission("viewer", [PERMISSIONS.TEAM_DELETE, PERMISSIONS.USER_REMOVE])
      ).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    it("should return true if role has all permissions", () => {
      expect(
        hasAllPermissions("admin", [PERMISSIONS.TEAM_VIEW, PERMISSIONS.TEAM_DELETE])
      ).toBe(true);
    });

    it("should return false if role is missing any permission", () => {
      expect(
        hasAllPermissions("member", [PERMISSIONS.TASK_EDIT, PERMISSIONS.USER_INVITE])
      ).toBe(false);
    });
  });

  describe("getRolePermissions", () => {
    it("should return correct permissions for each role", () => {
      expect(getRolePermissions("admin")).toBe(ROLE_PERMISSIONS.admin);
      expect(getRolePermissions("viewer")).toBe(ROLE_PERMISSIONS.viewer);
    });
  });

  describe("Role Info Helpers", () => {
    it("should return correct role labels", () => {
      expect(getRoleLabel("admin")).toBe("Admin");
      expect(getRoleLabel("manager")).toBe("Manager");
      expect(getRoleLabel("member")).toBe("Member");
      expect(getRoleLabel("viewer")).toBe("Viewer");
    });

    it("should return correct role descriptions", () => {
      expect(getRoleDescription("admin")).toBe("Full access to all features and settings");
      expect(getRoleDescription("viewer")).toBe("Read-only access to projects and tasks");
    });

    it("should return correct role colors", () => {
      expect(getRoleColor("admin")).toBe("bg-red-500");
      expect(getRoleColor("manager")).toBe("bg-blue-500");
      expect(getRoleColor("member")).toBe("bg-green-500");
      expect(getRoleColor("viewer")).toBe("bg-gray-500");
    });
  });

  describe("ROLE_INFO", () => {
    it("should contain complete information for all roles", () => {
      expect(ROLE_INFO.admin).toEqual({
        label: "Admin",
        description: "Full access to all features and settings",
        color: "bg-red-500",
      });

      expect(ROLE_INFO.manager).toEqual({
        label: "Manager",
        description: "Can manage projects and team members",
        color: "bg-blue-500",
      });

      expect(ROLE_INFO.member).toEqual({
        label: "Member",
        description: "Can create and edit tasks and projects",
        color: "bg-green-500",
      });

      expect(ROLE_INFO.viewer).toEqual({
        label: "Viewer",
        description: "Read-only access to projects and tasks",
        color: "bg-gray-500",
      });
    });
  });
});
