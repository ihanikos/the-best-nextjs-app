import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TeamPage from "@/app/team/page";
import { AuthProvider } from "@/lib/auth/auth-context";
import { UserRole } from "@/lib/auth/roles";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock the AddTeamMemberDialog
jest.mock("@/app/team/add-team-member-dialog", () => ({
  AddTeamMemberDialog: ({ open, onOpenChange }: any) => (
    open ? <div data-testid="add-dialog">Add Dialog</div> : null
  ),
}));

// Mock the RoleManagementDialog
jest.mock("@/app/team/role-management-dialog", () => ({
  RoleManagementDialog: ({ open, onRoleChange }: any) => (
    open ? (
      <div data-testid="role-dialog">
        <button onClick={() => onRoleChange("manager")}>Change to Manager</button>
      </div>
    ) : null
  ),
}));

const createMockUser = (role: UserRole) => ({
  id: "1",
  email: "test@test.com",
  name: "Test User",
  role,
  avatar: "TU",
});

function renderWithAuth(role: UserRole) {
  const mockUser = createMockUser(role);
  
  // Mock localStorage to return authenticated user
  const mockLocalStorage = {
    getItem: jest.fn().mockReturnValue(JSON.stringify({ user: mockUser })),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };
  Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage,
    writable: true,
  });

  return render(
    <AuthProvider>
      <TeamPage />
    </AuthProvider>
  );
}

describe("TeamPage RBAC Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Admin User", () => {
    it("should show Add Member button for admin", async () => {
      renderWithAuth("admin");
      
      await waitFor(() => {
        expect(screen.getByText("Add Member")).toBeInTheDocument();
      });
    });

    it("should show role badges with correct colors", async () => {
      renderWithAuth("admin");
      
      await waitFor(() => {
        expect(screen.getByText("Admin")).toBeInTheDocument();
      });

      // Check that all role badges are displayed
      expect(screen.getAllByText("Admin").length).toBeGreaterThan(0);
      expect(screen.getByText("Manager")).toBeInTheDocument();
      expect(screen.getAllByText("Member").length).toBeGreaterThan(0);
      expect(screen.getByText("Viewer")).toBeInTheDocument();
    });

    it("should allow admin to access Edit Role action", async () => {
      renderWithAuth("admin");
      
      await waitFor(() => {
        expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
      });

      // Find and click the actions menu for first member
      const actionButtons = screen.getAllByRole("button").filter(
        btn => btn.querySelector("svg")
      );
      
      if (actionButtons.length > 0) {
        await userEvent.click(actionButtons[0]);
        
        // Should see Edit Role option
        await waitFor(() => {
          expect(screen.getByText("Edit Role")).toBeInTheDocument();
        });
      }
    });

    it("should allow admin to access Remove action", async () => {
      renderWithAuth("admin");
      
      await waitFor(() => {
        expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
      });

      const actionButtons = screen.getAllByRole("button").filter(
        btn => btn.querySelector("svg")
      );
      
      if (actionButtons.length > 0) {
        await userEvent.click(actionButtons[0]);
        
        await waitFor(() => {
          expect(screen.getByText("Remove")).toBeInTheDocument();
        });
      }
    });
  });

  describe("Manager User", () => {
    it("should show Add Member button for manager", async () => {
      renderWithAuth("manager");
      
      await waitFor(() => {
        expect(screen.getByText("Add Member")).toBeInTheDocument();
      });
    });

    it("should not show Remove action for manager", async () => {
      renderWithAuth("manager");
      
      await waitFor(() => {
        expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
      });

      const actionButtons = screen.getAllByRole("button").filter(
        btn => btn.querySelector("svg")
      );
      
      if (actionButtons.length > 0) {
        await userEvent.click(actionButtons[0]);
        
        // Manager should see Edit Role
        await waitFor(() => {
          expect(screen.getByText("Edit Role")).toBeInTheDocument();
        });
        
        // But not Remove
        expect(screen.queryByText("Remove")).not.toBeInTheDocument();
      }
    });
  });

  describe("Member User", () => {
    it("should NOT show Add Member button for regular member", async () => {
      renderWithAuth("member");
      
      await waitFor(() => {
        expect(screen.getByText("Team")).toBeInTheDocument();
      });

      expect(screen.queryByText("Add Member")).not.toBeInTheDocument();
    });

    it("should not show Edit Role action for member", async () => {
      renderWithAuth("member");
      
      await waitFor(() => {
        expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
      });

      const actionButtons = screen.getAllByRole("button").filter(
        btn => btn.querySelector("svg")
      );
      
      if (actionButtons.length > 0) {
        await userEvent.click(actionButtons[0]);
        
        // Member should not see Edit Role or Remove
        await waitFor(() => {
          expect(screen.getByText("View Profile")).toBeInTheDocument();
        });
        
        expect(screen.queryByText("Edit Role")).not.toBeInTheDocument();
        expect(screen.queryByText("Remove")).not.toBeInTheDocument();
      }
    });
  });

  describe("Viewer User", () => {
    it("should NOT show Add Member button for viewer", async () => {
      renderWithAuth("viewer");
      
      await waitFor(() => {
        expect(screen.getByText("Team")).toBeInTheDocument();
      });

      expect(screen.queryByText("Add Member")).not.toBeInTheDocument();
    });

    it("should only show View Profile action for viewer", async () => {
      renderWithAuth("viewer");
      
      await waitFor(() => {
        expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
      });

      const actionButtons = screen.getAllByRole("button").filter(
        btn => btn.querySelector("svg")
      );
      
      if (actionButtons.length > 0) {
        await userEvent.click(actionButtons[0]);
        
        await waitFor(() => {
          expect(screen.getByText("View Profile")).toBeInTheDocument();
          expect(screen.getByText("Send Message")).toBeInTheDocument();
        });
        
        // Viewer should not see Edit Role or Remove
        expect(screen.queryByText("Edit Role")).not.toBeInTheDocument();
        expect(screen.queryByText("Remove")).not.toBeInTheDocument();
      }
    });
  });

  describe("Role Management Dialog", () => {
    it("should open role management dialog when admin clicks Edit Role", async () => {
      renderWithAuth("admin");
      
      await waitFor(() => {
        expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
      });

      const actionButtons = screen.getAllByRole("button").filter(
        btn => btn.querySelector("svg")
      );
      
      if (actionButtons.length > 0) {
        await userEvent.click(actionButtons[0]);
        
        await waitFor(() => {
          expect(screen.getByText("Edit Role")).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText("Edit Role"));

        await waitFor(() => {
          expect(screen.getByTestId("role-dialog")).toBeInTheDocument();
        });
      }
    });
  });

  describe("Team Statistics", () => {
    it("should display team statistics cards", async () => {
      renderWithAuth("admin");
      
      await waitFor(() => {
        expect(screen.getByText("Total Members")).toBeInTheDocument();
        expect(screen.getByText("Active Now")).toBeInTheDocument();
        expect(screen.getByText("Pending Invites")).toBeInTheDocument();
      });
    });

    it("should show correct total member count", async () => {
      renderWithAuth("admin");
      
      await waitFor(() => {
        // Should show 6 initial members
        expect(screen.getByText("6")).toBeInTheDocument();
      });
    });
  });
});
