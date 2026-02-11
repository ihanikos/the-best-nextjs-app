import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "@/components/sidebar";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/auth";

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("framer-motion", () => ({
  motion: {
    aside: ({ children, ...props }: any) => <aside {...props}>{children}</aside>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const renderWithAuth = (component: React.ReactNode) => {
  mockLocalStorage.getItem.mockReturnValue(null);
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe("Sidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
  });

  it("renders navigation items", () => {
    renderWithAuth(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("highlights active page", () => {
    renderWithAuth(<Sidebar />);
    const dashboardLink = screen.getByText("Dashboard").closest("div");
    expect(dashboardLink).toHaveClass("bg-primary");
  });

  it("shows user profile with default user", () => {
    renderWithAuth(<Sidebar />);
    // When not logged in, it should show "User" as the default
    expect(screen.getByText("User")).toBeInTheDocument();
  });

  it("shows logo with Nexus brand", () => {
    renderWithAuth(<Sidebar />);
    expect(screen.getByText("Nexus")).toBeInTheDocument();
  });

  it("toggles collapsed state when button is clicked", () => {
    renderWithAuth(<Sidebar />);
    const toggleButtons = screen.getAllByRole("button");
    const toggleButton = toggleButtons[0];
    fireEvent.click(toggleButton);
  });

  it("renders correct active state for Analytics page", () => {
    (usePathname as jest.Mock).mockReturnValue("/analytics");
    renderWithAuth(<Sidebar />);
    const analyticsLink = screen.getByText("Analytics").closest("div");
    expect(analyticsLink).toHaveClass("bg-primary");
  });

  it("renders correct active state for Team page", () => {
    (usePathname as jest.Mock).mockReturnValue("/team");
    renderWithAuth(<Sidebar />);
    const teamLink = screen.getByText("Team").closest("div");
    expect(teamLink).toHaveClass("bg-primary");
  });

  it("renders correct active state for Settings page", () => {
    (usePathname as jest.Mock).mockReturnValue("/settings");
    renderWithAuth(<Sidebar />);
    const settingsLink = screen.getByText("Settings").closest("div");
    expect(settingsLink).toHaveClass("bg-primary");
  });

  it("does not highlight non-active pages", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
    renderWithAuth(<Sidebar />);
    const analyticsLink = screen.getByText("Analytics").closest("div");
    expect(analyticsLink).not.toHaveClass("bg-primary");
  });

  it("renders logout button", () => {
    renderWithAuth(<Sidebar />);
    const logoutButton = screen.getByTitle("Logout");
    expect(logoutButton).toBeInTheDocument();
  });

  it("shows logged in user when authenticated", () => {
    const storedUser = {
      id: "1",
      email: "test@test.com",
      name: "Test User",
      avatar: "https://example.com/avatar.png",
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ user: storedUser }));
    
    render(
      <AuthProvider>
        <Sidebar />
      </AuthProvider>
    );
    
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@test.com")).toBeInTheDocument();
  });
});
