import { render, screen } from "@testing-library/react";
import {
  PermissionGuard,
  PermissionGuardAny,
  PermissionGuardAll,
  RoleGuard,
  usePermissionCheck,
  useAnyPermissionCheck,
  useAllPermissionsCheck,
} from "@/components/permission-guard";
import { PERMISSIONS } from "@/lib/auth/roles";

describe("PermissionGuard Components", () => {
  const protectedContent = "Protected Content";
  const fallbackContent = "Fallback Content";

  describe("PermissionGuard", () => {
    it("renders children when user has permission", () => {
      render(
        <PermissionGuard
          userRole="admin"
          permission={PERMISSIONS.TEAM_DELETE}
        >
          <div>{protectedContent}</div>
        </PermissionGuard>
      );

      expect(screen.getByText(protectedContent)).toBeInTheDocument();
    });

    it("renders fallback when user lacks permission", () => {
      render(
        <PermissionGuard
          userRole="viewer"
          permission={PERMISSIONS.TEAM_DELETE}
          fallback={<div>{fallbackContent}</div>}
        >
          <div>{protectedContent}</div>
        </PermissionGuard>
      );

      expect(screen.queryByText(protectedContent)).not.toBeInTheDocument();
      expect(screen.getByText(fallbackContent)).toBeInTheDocument();
    });

    it("renders null when userRole is null", () => {
      const { container } = render(
        <PermissionGuard
          userRole={null}
          permission={PERMISSIONS.TEAM_VIEW}
        >
          <div>{protectedContent}</div>
        </PermissionGuard>
      );

      expect(container).toBeEmptyDOMElement();
    });

    it("renders null when userRole is undefined", () => {
      const { container } = render(
        <PermissionGuard
          userRole={undefined}
          permission={PERMISSIONS.TEAM_VIEW}
        >
          <div>{protectedContent}</div>
        </PermissionGuard>
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("PermissionGuardAny", () => {
    it("renders children when user has any of the permissions", () => {
      render(
        <PermissionGuardAny
          userRole="member"
          permissions={[PERMISSIONS.TASK_DELETE, PERMISSIONS.TASK_EDIT]}
        >
          <div>{protectedContent}</div>
        </PermissionGuardAny>
      );

      expect(screen.getByText(protectedContent)).toBeInTheDocument();
    });

    it("renders fallback when user has none of the permissions", () => {
      render(
        <PermissionGuardAny
          userRole="viewer"
          permissions={[PERMISSIONS.TEAM_DELETE, PERMISSIONS.USER_REMOVE]}
          fallback={<div>{fallbackContent}</div>}
        >
          <div>{protectedContent}</div>
        </PermissionGuardAny>
      );

      expect(screen.getByText(fallbackContent)).toBeInTheDocument();
    });
  });

  describe("PermissionGuardAll", () => {
    it("renders children when user has all permissions", () => {
      render(
        <PermissionGuardAll
          userRole="admin"
          permissions={[PERMISSIONS.TEAM_VIEW, PERMISSIONS.TEAM_DELETE]}
        >
          <div>{protectedContent}</div>
        </PermissionGuardAll>
      );

      expect(screen.getByText(protectedContent)).toBeInTheDocument();
    });

    it("renders fallback when user is missing any permission", () => {
      render(
        <PermissionGuardAll
          userRole="member"
          permissions={[PERMISSIONS.TASK_EDIT, PERMISSIONS.USER_INVITE]}
          fallback={<div>{fallbackContent}</div>}
        >
          <div>{protectedContent}</div>
        </PermissionGuardAll>
      );

      expect(screen.getByText(fallbackContent)).toBeInTheDocument();
    });
  });

  describe("RoleGuard", () => {
    it("renders children when user has allowed role", () => {
      render(
        <RoleGuard userRole="admin" allowedRoles={["admin", "manager"]}>
          <div>{protectedContent}</div>
        </RoleGuard>
      );

      expect(screen.getByText(protectedContent)).toBeInTheDocument();
    });

    it("renders fallback when user does not have allowed role", () => {
      render(
        <RoleGuard
          userRole="viewer"
          allowedRoles={["admin", "manager"]}
          fallback={<div>{fallbackContent}</div>}
        >
          <div>{protectedContent}</div>
        </RoleGuard>
      );

      expect(screen.getByText(fallbackContent)).toBeInTheDocument();
    });
  });

  describe("usePermissionCheck", () => {
    it("returns true when user has permission", () => {
      const TestComponent = () => {
        const hasAccess = usePermissionCheck("manager", PERMISSIONS.PROJECT_CREATE);
        return <div>{hasAccess ? "Has Access" : "No Access"}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByText("Has Access")).toBeInTheDocument();
    });

    it("returns false when user lacks permission", () => {
      const TestComponent = () => {
        const hasAccess = usePermissionCheck("viewer", PERMISSIONS.PROJECT_CREATE);
        return <div>{hasAccess ? "Has Access" : "No Access"}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByText("No Access")).toBeInTheDocument();
    });

    it("returns false when userRole is null", () => {
      const TestComponent = () => {
        const hasAccess = usePermissionCheck(null, PERMISSIONS.TEAM_VIEW);
        return <div>{hasAccess ? "Has Access" : "No Access"}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByText("No Access")).toBeInTheDocument();
    });
  });

  describe("useAnyPermissionCheck", () => {
    it("returns true when user has any permission", () => {
      const TestComponent = () => {
        const hasAccess = useAnyPermissionCheck("member", [
          PERMISSIONS.TASK_DELETE,
          PERMISSIONS.TASK_EDIT,
        ]);
        return <div>{hasAccess ? "Has Access" : "No Access"}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByText("Has Access")).toBeInTheDocument();
    });

    it("returns false when user has no permissions", () => {
      const TestComponent = () => {
        const hasAccess = useAnyPermissionCheck("viewer", [
          PERMISSIONS.TEAM_DELETE,
          PERMISSIONS.USER_REMOVE,
        ]);
        return <div>{hasAccess ? "Has Access" : "No Access"}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByText("No Access")).toBeInTheDocument();
    });
  });

  describe("useAllPermissionsCheck", () => {
    it("returns true when user has all permissions", () => {
      const TestComponent = () => {
        const hasAccess = useAllPermissionsCheck("admin", [
          PERMISSIONS.TEAM_VIEW,
          PERMISSIONS.TEAM_DELETE,
        ]);
        return <div>{hasAccess ? "Has Access" : "No Access"}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByText("Has Access")).toBeInTheDocument();
    });

    it("returns false when user lacks any permission", () => {
      const TestComponent = () => {
        const hasAccess = useAllPermissionsCheck("member", [
          PERMISSIONS.TASK_EDIT,
          PERMISSIONS.USER_INVITE,
        ]);
        return <div>{hasAccess ? "Has Access" : "No Access"}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByText("No Access")).toBeInTheDocument();
    });
  });
});
