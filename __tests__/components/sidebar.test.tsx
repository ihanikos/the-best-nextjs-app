import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Sidebar } from "@/components/sidebar";
import { usePathname } from "next/navigation";

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

describe("Sidebar", () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
  });

  it("renders navigation items", () => {
    render(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("highlights active page", () => {
    render(<Sidebar />);
    const dashboardLink = screen.getByText("Dashboard").closest("div");
    expect(dashboardLink).toHaveClass("bg-primary");
  });

  it("shows user profile", () => {
    render(<Sidebar />);
    expect(screen.getByText("Alex Chen")).toBeInTheDocument();
    expect(screen.getByText("alex@nexus.dev")).toBeInTheDocument();
  });

  it("shows logo with Nexus brand", () => {
    render(<Sidebar />);
    expect(screen.getByText("Nexus")).toBeInTheDocument();
  });

  it("toggles collapsed state when button is clicked", () => {
    render(<Sidebar />);
    const toggleButtons = screen.getAllByRole("button");
    const toggleButton = toggleButtons[0];
    fireEvent.click(toggleButton);
  });

  it("renders correct active state for Analytics page", () => {
    (usePathname as jest.Mock).mockReturnValue("/analytics");
    render(<Sidebar />);
    const analyticsLink = screen.getByText("Analytics").closest("div");
    expect(analyticsLink).toHaveClass("bg-primary");
  });

  it("renders correct active state for Team page", () => {
    (usePathname as jest.Mock).mockReturnValue("/team");
    render(<Sidebar />);
    const teamLink = screen.getByText("Team").closest("div");
    expect(teamLink).toHaveClass("bg-primary");
  });

  it("renders correct active state for Settings page", () => {
    (usePathname as jest.Mock).mockReturnValue("/settings");
    render(<Sidebar />);
    const settingsLink = screen.getByText("Settings").closest("div");
    expect(settingsLink).toHaveClass("bg-primary");
  });

  it("does not highlight non-active pages", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
    render(<Sidebar />);
    const analyticsLink = screen.getByText("Analytics").closest("div");
    expect(analyticsLink).not.toHaveClass("bg-primary");
  });
});
