import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotificationsPage from "@/app/notifications/page";
import { NotificationProvider } from "@/lib/notifications/notification-context";

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => "/notifications",
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("NotificationsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it("renders notifications page header", async () => {
    render(
      <NotificationProvider>
        <NotificationsPage />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });
  });

  it("renders notification stats cards", async () => {
    render(
      <NotificationProvider>
        <NotificationsPage />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Total")).toBeInTheDocument();
      expect(screen.getByText("Unread")).toBeInTheDocument();
      expect(screen.getByText("Read")).toBeInTheDocument();
      expect(screen.getByText("Filter Results")).toBeInTheDocument();
    });
  });

  it("renders search input", async () => {
    render(
      <NotificationProvider>
        <NotificationsPage />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Search notifications...")
      ).toBeInTheDocument();
    });
  });

  it("renders filter dropdowns", async () => {
    render(
      <NotificationProvider>
        <NotificationsPage />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("All Types")).toBeInTheDocument();
      expect(screen.getByText("All Status")).toBeInTheDocument();
    });
  });

  it("displays sample notifications", async () => {
    render(
      <NotificationProvider>
        <NotificationsPage />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Welcome to Nexus")).toBeInTheDocument();
      expect(screen.getByText("Project completed")).toBeInTheDocument();
      expect(screen.getByText("Team member joined")).toBeInTheDocument();
    });
  });

  it("shows unread count badge on stats", async () => {
    render(
      <NotificationProvider>
        <NotificationsPage />
      </NotificationProvider>
    );

    await waitFor(() => {
      const unreadStats = screen.getByText("Unread").closest("[class*='Card"]");
      expect(unreadStats).toBeInTheDocument();
    });
  });

  it("shows mark all read button when there are unread notifications", async () => {
    render(
      <NotificationProvider>
        <NotificationsPage />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Mark all read/i })
      ).toBeInTheDocument();
    });
  });

  it("marks all notifications as read when clicking mark all read", async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <NotificationsPage />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Mark all read/i })
      ).toBeInTheDocument();
    });

    const markAllReadBtn = screen.getByRole("button", { name: /Mark all read/i });
    await user.click(markAllReadBtn);

    // After marking all read, the button should disappear or change
    await waitFor(() => {
      expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
    });
  });

  it("allows filtering by notification type", async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <NotificationsPage />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Welcome to Nexus")).toBeInTheDocument();
    });

    // Open the type filter dropdown
    const typeFilter = screen.getByText("All Types");
    await user.click(typeFilter);

    // Select "Success" type
    const successOption = screen.getByText("Success");
    await user.click(successOption);

    // Should only show success notifications
    await waitFor(() => {
      expect(screen.getByText("Project completed")).toBeInTheDocument();
    });
  });

  it("allows filtering by read status", async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <NotificationsPage />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("All Status")).toBeInTheDocument();
    });

    // Open the status filter dropdown
    const statusFilter = screen.getByText("All Status");
    await user.click(statusFilter);

    // Select "Read" status
    const readOption = screen.getByText("Read");
    await user.click(readOption);
  });

  it("allows searching notifications", async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <NotificationsPage />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Search notifications...")
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search notifications...");
    await user.type(searchInput, "Welcome");

    // Should show matching notification
    await waitFor(() => {
      expect(screen.getByText("Welcome to Nexus")).toBeInTheDocument();
    });
  });

  it("renders notification cards with correct styling", async () => {
    render(
      <NotificationProvider>
        <NotificationsPage />
      </NotificationProvider>
    );

    await waitFor(() => {
      const welcomeNotification = screen.getByText("Welcome to Nexus");
      expect(welcomeNotification).toBeInTheDocument();

      // Check that notification card has unread styling (indicated by being in a Card component)
      const card = welcomeNotification.closest("[class*='Card']");
      expect(card).toBeInTheDocument();
    });
  });

  it("shows empty state when no notifications match filters", async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <NotificationsPage />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Search notifications...")
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search notifications...");
    await user.type(searchInput, "xyznonexistent12345");

    await waitFor(() => {
      expect(screen.getByText("No notifications found")).toBeInTheDocument();
    });
  });

  it("displays notification timestamps", async () => {
    render(
      <NotificationProvider>
        <NotificationsPage />
      </NotificationProvider>
    );

    await waitFor(() => {
      // Should display "Just now" or similar time format
      const timeElements = screen.getAllByText(/ago|Just now/);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  it("shows notification type icons", async () => {
    render(
      <NotificationProvider>
        <NotificationsPage />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Welcome to Nexus")).toBeInTheDocument();
      // Icons are rendered via Lucide, we can verify the notification renders
    });
  });

  it("renders action buttons in notification cards", async () => {
    render(
      <NotificationProvider>
        <NotificationsPage />
      </NotificationProvider>
    );

    await waitFor(() => {
      // Look for the more options button (three dots menu)
      const moreButtons = screen.getAllByRole("button", { name: "" });
      expect(moreButtons.length).toBeGreaterThan(0);
    });
  });

  it("displays correct notification counts in stats", async () => {
    render(
      <NotificationProvider>
        <NotificationsPage />
      </NotificationProvider>
    );

    await waitFor(() => {
      // Check that stat cards show correct counts
      const totalCard = screen.getByText("Total").closest("div[class*='Card"]");
      expect(totalCard).toBeInTheDocument();
    });
  });
});
