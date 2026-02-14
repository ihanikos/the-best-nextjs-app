import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "@/app/profile/page";
import { AuthProvider, useAuth } from "@/lib/auth";
import { toast } from "sonner";

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock useAuth hook
const mockLogout = jest.fn();
jest.mock("@/lib/auth", () => ({
  ...jest.requireActual("@/lib/auth"),
  useAuth: jest.fn(),
}));

const mockUser = {
  id: "1",
  email: "test@example.com",
  name: "Test User",
  avatar: "https://example.com/avatar.png",
};

describe("Profile Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when user is authenticated", () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        logout: mockLogout,
      });
    });

    it("renders profile page with user information", () => {
      render(<ProfilePage />);

      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("Manage your account and view activity")).toBeInTheDocument();
      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
      expect(screen.getByText("Verified")).toBeInTheDocument();
    });

    it("displays account statistics", () => {
      render(<ProfilePage />);

      expect(screen.getByText("Projects Created")).toBeInTheDocument();
      expect(screen.getByText("12")).toBeInTheDocument();
      expect(screen.getByText("Tasks Completed")).toBeInTheDocument();
      expect(screen.getByText("47")).toBeInTheDocument();
      expect(screen.getByText("Team Invites")).toBeInTheDocument();
      expect(screen.getByText("8")).toBeInTheDocument();
      expect(screen.getByText("Login Streak")).toBeInTheDocument();
      expect(screen.getByText("15")).toBeInTheDocument();
    });

    it("displays activity log with all activities by default", () => {
      render(<ProfilePage />);

      expect(screen.getByText("Activity Log")).toBeInTheDocument();
      expect(screen.getByText("Recent actions and events")).toBeInTheDocument();
      expect(screen.getByText("Login")).toBeInTheDocument();
      expect(screen.getByText("Project Updated")).toBeInTheDocument();
      expect(screen.getByText("Task Completed")).toBeInTheDocument();
    });

    it("filters activity log by auth tab", async () => {
      render(<ProfilePage />);

      const authTab = screen.getByRole("tab", { name: "Auth" });
      await userEvent.click(authTab);

      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument();
        expect(screen.getByText("Password Changed")).toBeInTheDocument();
      });
    });

    it("filters activity log by project tab", async () => {
      render(<ProfilePage />);

      const projectTab = screen.getByRole("tab", { name: "Projects" });
      await userEvent.click(projectTab);

      await waitFor(() => {
        expect(screen.getByText("Project Updated")).toBeInTheDocument();
        expect(screen.getByText("Task Completed")).toBeInTheDocument();
        expect(screen.getByText("Project Created")).toBeInTheDocument();
      });
    });

    it("filters activity log by team tab", async () => {
      render(<ProfilePage />);

      const teamTab = screen.getByRole("tab", { name: "Team" });
      await userEvent.click(teamTab);

      await waitFor(() => {
        expect(screen.getByText("Member Added")).toBeInTheDocument();
      });
    });

    it("has Edit Profile button linking to settings", () => {
      render(<ProfilePage />);

      const editButtons = screen.getAllByText("Edit Profile");
      expect(editButtons.length).toBeGreaterThan(0);
      
      editButtons.forEach(button => {
        expect(button.closest("a")).toHaveAttribute("href", "/settings");
      });
    });

    it("has quick action links to Settings, Projects, and Team", () => {
      render(<ProfilePage />);

      const settingsLink = screen.getByText("Settings").closest("a");
      expect(settingsLink).toHaveAttribute("href", "/settings");

      const projectsLink = screen.getByText("Projects").closest("a");
      expect(projectsLink).toHaveAttribute("href", "/projects");

      const teamLink = screen.getByText("Team").closest("a");
      expect(teamLink).toHaveAttribute("href", "/team");
    });

    it("handles logout when logout button is clicked", async () => {
      render(<ProfilePage />);

      const logoutButton = screen.getAllByText("Logout")[0];
      await userEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith("Logged out successfully");
      });
    });

    it("displays user initials as avatar fallback", () => {
      const userWithoutAvatar = {
        ...mockUser,
        avatar: undefined,
      };
      (useAuth as jest.Mock).mockReturnValue({
        user: userWithoutAvatar,
        logout: mockLogout,
      });

      render(<ProfilePage />);

      expect(screen.getByText("TU")).toBeInTheDocument();
    });

    it("displays member since and last active information", () => {
      render(<ProfilePage />);

      expect(screen.getByText(/Member since/)).toBeInTheDocument();
      expect(screen.getByText("3 months")).toBeInTheDocument();
      expect(screen.getByText(/Last active/)).toBeInTheDocument();
    });

    it("renders quick actions section", () => {
      render(<ProfilePage />);

      expect(screen.getByText("Quick Actions")).toBeInTheDocument();
      expect(screen.getByText("Common tasks and settings")).toBeInTheDocument();
    });
  });

  describe("when user is not authenticated", () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        logout: mockLogout,
      });
    });

    it("renders not authenticated message with login link", () => {
      render(<ProfilePage />);

      expect(screen.getByText("Not Authenticated")).toBeInTheDocument();
      expect(screen.getByText("Please log in to view your profile")).toBeInTheDocument();
      
      const loginLink = screen.getByText("Go to Login").closest("a");
      expect(loginLink).toHaveAttribute("href", "/login");
    });
  });

  describe("activity log timestamp formatting", () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        logout: mockLogout,
      });
    });

    it("displays relative timestamps for activities", () => {
      render(<ProfilePage />);

      // Should show relative timestamps like "2 minutes ago", "hours ago", etc.
      const timestampElements = screen.getAllByText(/ago|Yesterday/);
      expect(timestampElements.length).toBeGreaterThan(0);
    });
  });
});
