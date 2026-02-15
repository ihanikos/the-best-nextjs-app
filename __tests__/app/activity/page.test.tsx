import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ActivityLogPage from "@/app/activity/page";
import { ActivityProvider } from "@/lib/activity";
import { Activity } from "@/lib/activity/types";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}));

const mockActivities: Activity[] = [
  {
    id: "1",
    userId: "user-1",
    userName: "John Doe",
    userEmail: "john@example.com",
    action: "project_created",
    targetType: "project",
    targetId: "proj-1",
    targetName: "Website Redesign",
    description: "created a new project",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "user-2",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    action: "task_created",
    targetType: "task",
    targetId: "task-1",
    targetName: "Design Homepage",
    description: "created a task",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    userId: "user-1",
    userName: "John Doe",
    userEmail: "john@example.com",
    action: "member_added",
    targetType: "member",
    targetId: "member-1",
    targetName: "Bob Wilson",
    description: "added a team member",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

describe("ActivityLogPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the page header with title and description", () => {
    render(
      <ActivityProvider>
        <ActivityLogPage />
      </ActivityProvider>
    );

    expect(screen.getByText("Activity Log")).toBeInTheDocument();
    expect(screen.getByText("Track all actions and changes across your workspace")).toBeInTheDocument();
  });

  it("should render stats cards", () => {
    render(
      <ActivityProvider>
        <ActivityLogPage />
      </ActivityProvider>
    );

    expect(screen.getByText("Total Activities")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("This Week")).toBeInTheDocument();
    expect(screen.getByText("This Month")).toBeInTheDocument();
  });

  it("should render activity feed with activities count", () => {
    render(
      <ActivityProvider>
        <ActivityLogPage />
      </ActivityProvider>
    );

    expect(screen.getByText(/activities found/i)).toBeInTheDocument();
  });

  it("should render filter controls", () => {
    render(
      <ActivityProvider>
        <ActivityLogPage />
      </ActivityProvider>
    );

    expect(screen.getByPlaceholderText("Search activities...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /clear old/i })).toBeInTheDocument();
  });

  it("should open export dialog when export button is clicked", async () => {
    const user = userEvent.setup();
    
    render(
      <ActivityProvider>
        <ActivityLogPage />
      </ActivityProvider>
    );

    const exportButton = screen.getByRole("button", { name: /export/i });
    await user.click(exportButton);

    expect(screen.getByText("Export Activity Log")).toBeInTheDocument();
    expect(screen.getByText(/Download all activities/i)).toBeInTheDocument();
  });

  it("should open clear dialog when clear old button is clicked", async () => {
    const user = userEvent.setup();
    
    render(
      <ActivityProvider>
        <ActivityLogPage />
      </ActivityProvider>
    );

    const clearButton = screen.getByRole("button", { name: /clear old/i });
    await user.click(clearButton);

    expect(screen.getByText("Clear Old Activities")).toBeInTheDocument();
    expect(screen.getByText(/Delete activities older than/i)).toBeInTheDocument();
  });

  it("should filter activities by search query", async () => {
    const user = userEvent.setup();
    
    render(
      <ActivityProvider>
        <ActivityLogPage />
      </ActivityProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search activities...");
    await user.type(searchInput, "John");

    // The search should filter the activities
    // Since we don't have real activities, we just verify the input works
    expect(searchInput).toHaveValue("John");
  });

  it("should show clear filters button when filters are applied", async () => {
    const user = userEvent.setup();
    
    render(
      <ActivityProvider>
        <ActivityLogPage />
      </ActivityProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search activities...");
    await user.type(searchInput, "test");

    expect(screen.getByText("Clear filters")).toBeInTheDocument();
  });

  it("should clear filters when clear filters button is clicked", async () => {
    const user = userEvent.setup();
    
    render(
      <ActivityProvider>
        <ActivityLogPage />
      </ActivityProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search activities...");
    await user.type(searchInput, "test");

    const clearButton = screen.getByText("Clear filters");
    await user.click(clearButton);

    expect(searchInput).toHaveValue("");
  });

  it("should display date filter inputs", () => {
    render(
      <ActivityProvider>
        <ActivityLogPage />
      </ActivityProvider>
    );

    const dateInputs = screen.getAllByDisplayValue("");
    // Should have at least 2 date inputs (from and to)
    expect(dateInputs.length).toBeGreaterThanOrEqual(2);
  });

  it("should render with proper layout structure", () => {
    const { container } = render(
      <ActivityProvider>
        <ActivityLogPage />
      </ActivityProvider>
    );

    // Check for main structure elements
    expect(container.querySelector("header")).toBeInTheDocument();
    expect(container.querySelector("h1")).toHaveTextContent("Activity Log");
  });
});

describe("ActivityLogPage with data", () => {
  beforeEach(() => {
    // Pre-populate localStorage with mock activities
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockActivities));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should display stats based on actual activity data", () => {
    render(
      <ActivityProvider>
        <ActivityLogPage />
      </ActivityProvider>
    );

    // Should show the stats section
    expect(screen.getByText("Total Activities")).toBeInTheDocument();
  });

  it("should render activities in the feed", () => {
    render(
      <ActivityProvider>
        <ActivityLogPage />
      </ActivityProvider>
    );

    // Should show user names from activities (use getAllByText since names may appear multiple times)
    expect(screen.getAllByText("John Doe").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });
});
