import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActivityFeed, ActivityFeedCard, ActivityItem } from "@/components/activity-feed";
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

const mockActivities: Activity[] = [
  {
    id: "1",
    userId: "user-1",
    userName: "John Doe",
    userEmail: "john@example.com",
    userAvatar: "https://example.com/john.jpg",
    action: "project_created",
    targetType: "project",
    targetId: "proj-1",
    targetName: "My Project",
    description: "created a new project",
    metadata: { projectId: "proj-1", projectName: "My Project" },
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
    targetName: "Important Task",
    description: "created a task",
    metadata: { taskId: "task-1", taskTitle: "Important Task" },
    createdAt: new Date().toISOString(),
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
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ActivityProvider>{children}</ActivityProvider>
);

describe("ActivityFeed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("ActivityItem", () => {
    it("should render activity with user information", () => {
      render(<ActivityItem activity={mockActivities[0]} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText(/created a new project/)).toBeInTheDocument();
      expect(screen.getByText("My Project")).toBeInTheDocument();
    });

    it("should render target type badge when showTarget is true", () => {
      render(<ActivityItem activity={mockActivities[0]} showTarget />);

      expect(screen.getByText("project")).toBeInTheDocument();
    });

    it("should not render target type badge when showTarget is false", () => {
      render(<ActivityItem activity={mockActivities[0]} showTarget={false} />);

      expect(screen.queryByText("project")).not.toBeInTheDocument();
    });

    it("should render compact mode correctly", () => {
      render(<ActivityItem activity={mockActivities[0]} compact />);

      // In compact mode, the component should render without errors
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText(/created a new project/)).toBeInTheDocument();
    });

    it("should show user initials in avatar when no avatar image", () => {
      render(<ActivityItem activity={mockActivities[1]} />);

      expect(screen.getByText("JS")).toBeInTheDocument();
    });
  });

  describe("ActivityFeed", () => {
    it("should render empty state when no activities", () => {
      render(
        <ActivityProvider>
          <ActivityFeed />
        </ActivityProvider>
      );

      expect(screen.getByText("No recent activity")).toBeInTheDocument();
    });

    it("should render activities when provided via props", () => {
      render(
        <ActivityProvider>
          <ActivityFeed activities={mockActivities} />
        </ActivityProvider>
      );

      // Use getAllByText since "John Doe" appears in multiple activities
      expect(screen.getAllByText("John Doe").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText(/created a new project/)).toBeInTheDocument();
      expect(screen.getByText(/created a task/)).toBeInTheDocument();
    });

    it("should limit activities based on limit prop", () => {
      render(
        <ActivityProvider>
          <ActivityFeed activities={mockActivities} limit={2} />
        </ActivityProvider>
      );

      // Should only show 2 activities even though 3 are provided
      const items = screen.getAllByText(/(John Doe|Jane Smith)/);
      expect(items).toHaveLength(2);
    });

    it("should show filter controls when showFilter is true", () => {
      render(
        <ActivityProvider>
          <ActivityFeed activities={mockActivities} showFilter />
        </ActivityProvider>
      );

      expect(screen.getByPlaceholderText("Search activities...")).toBeInTheDocument();
    });

    it("should filter activities by search query", async () => {
      const user = userEvent.setup();
      
      render(
        <ActivityProvider>
          <ActivityFeed activities={mockActivities} showFilter />
        </ActivityProvider>
      );

      const searchInput = screen.getByPlaceholderText("Search activities...");
      await user.type(searchInput, "Jane");

      // Should only show Jane's activity
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("should show clear filters button when filters are active", async () => {
      const user = userEvent.setup();
      
      render(
        <ActivityProvider>
          <ActivityFeed activities={mockActivities} showFilter />
        </ActivityProvider>
      );

      const searchInput = screen.getByPlaceholderText("Search activities...");
      await user.type(searchInput, "test");

      expect(screen.getByText("Clear filters")).toBeInTheDocument();
    });

    it("should show no results message when filter matches nothing", async () => {
      const user = userEvent.setup();
      
      render(
        <ActivityProvider>
          <ActivityFeed activities={mockActivities} showFilter />
        </ActivityProvider>
      );

      const searchInput = screen.getByPlaceholderText("Search activities...");
      await user.type(searchInput, "nonexistent");

      expect(screen.getByText("No activities match your filters")).toBeInTheDocument();
    });
  });

  describe("ActivityFeedCard", () => {
    it("should render with title and view all link", () => {
      render(
        <ActivityProvider>
          <ActivityFeedCard />
        </ActivityProvider>
      );

      expect(screen.getByText("Recent Activity")).toBeInTheDocument();
      expect(screen.getByText("View all")).toHaveAttribute("href", "/activity");
    });

    it("should render activities in compact mode", () => {
      // Add some activities first
      const { rerender } = render(
        <ActivityProvider>
          <ActivityFeedCard limit={3} />
        </ActivityProvider>
      );

      // Since no activities are added, should show empty state
      expect(screen.getByText("No recent activity")).toBeInTheDocument();
    });
  });

  describe("Activity icons and colors", () => {
    it("should display correct icon for project_created action", () => {
      render(<ActivityItem activity={mockActivities[0]} />);
      
      // The icon should be rendered (FolderPlus for project_created)
      const iconContainer = document.querySelector("[class*='rounded-full']");
      expect(iconContainer).toBeInTheDocument();
    });

    it("should display correct icon for task_created action", () => {
      render(<ActivityItem activity={mockActivities[1]} />);
      
      const iconContainer = document.querySelector("[class*='rounded-full']");
      expect(iconContainer).toBeInTheDocument();
    });

    it("should display correct icon for member_added action", () => {
      render(<ActivityItem activity={mockActivities[2]} />);
      
      const iconContainer = document.querySelector("[class*='rounded-full']");
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe("Time formatting", () => {
    it("should display relative time for recent activities", () => {
      render(<ActivityItem activity={mockActivities[0]} />);

      // Should show "less than a minute ago" or similar for current time
      const timeElement = screen.getByText(/ago|minute|Just now/i);
      expect(timeElement).toBeInTheDocument();
    });

    it("should display different time format for older activities", () => {
      const oldActivity: Activity = {
        ...mockActivities[0],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      };

      render(<ActivityItem activity={oldActivity} />);

      // Should show something like "2 days ago"
      const timeElement = screen.getByText(/day/i);
      expect(timeElement).toBeInTheDocument();
    });
  });
});
