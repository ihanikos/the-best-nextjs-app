import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  NotificationProvider,
  useNotifications,
} from "@/lib/notifications/notification-context";
import { CreateNotificationInput } from "@/lib/notifications/types";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Test component that uses the notification context
function TestComponent() {
  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    markAsUnread,
    deleteNotification,
    deleteAllRead,
    getFilteredNotifications,
    filters,
    setFilters,
  } = useNotifications();

  return (
    <div>
      <div data-testid="notification-count">{notifications.length}</div>
      <div data-testid="unread-count">{unreadCount}</div>
      <div data-testid="filtered-count">{getFilteredNotifications().length}</div>
      <button
        data-testid="add-notification"
        onClick={() =>
          addNotification({
            title: "Test Notification",
            message: "This is a test",
            type: "info",
          })
        }
      >
        Add Notification
      </button>
      <button
        data-testid="mark-all-read"
        onClick={markAllAsRead}
      >
        Mark All Read
      </button>
      <button
        data-testid="delete-all-read"
        onClick={deleteAllRead}
      >
        Delete All Read
      </button>
      <button
        data-testid="set-filter"
        onClick={() => setFilters({ ...filters, type: "success" })}
      >
        Filter Success
      </button>
      {notifications.map((n) => (
        <div key={n.id} data-testid={`notification-${n.id}`}>
          <span data-testid={`notification-title-${n.id}`}>{n.title}</span>
          <span data-testid={`notification-read-${n.id}`}>
            {n.read ? "read" : "unread"}
          </span>
          <button
            data-testid={`mark-read-${n.id}`}
            onClick={() => markAsRead(n.id)}
          >
            Mark Read
          </button>
          <button
            data-testid={`mark-unread-${n.id}`}
            onClick={() => markAsUnread(n.id)}
          >
            Mark Unread
          </button>
          <button
            data-testid={`delete-${n.id}`}
            onClick={() => deleteNotification(n.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

describe("NotificationContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it("provides initial sample notifications", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Wait for initialization
    await waitFor(() => {
      expect(screen.getByTestId("notification-count")).toHaveTextContent("3");
    });
  });

  it("calculates unread count correctly", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("unread-count")).toHaveTextContent("3");
    });
  });

  it("adds a new notification", async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("notification-count")).toHaveTextContent("3");
    });

    await user.click(screen.getByTestId("add-notification"));

    await waitFor(() => {
      expect(screen.getByTestId("notification-count")).toHaveTextContent("4");
    });
  });

  it("marks a notification as read", async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("unread-count")).toHaveTextContent("3");
    });

    // Get the first notification's mark read button
    const markReadButtons = screen.getAllByText("Mark Read");
    await user.click(markReadButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId("unread-count")).toHaveTextContent("2");
    });
  });

  it("marks all notifications as read", async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("unread-count")).toHaveTextContent("3");
    });

    await user.click(screen.getByTestId("mark-all-read"));

    await waitFor(() => {
      expect(screen.getByTestId("unread-count")).toHaveTextContent("0");
    });
  });

  it("marks a notification as unread", async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // First mark as read
    await waitFor(() => {
      expect(screen.getByTestId("unread-count")).toHaveTextContent("3");
    });

    const markReadButtons = screen.getAllByText("Mark Read");
    await user.click(markReadButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId("unread-count")).toHaveTextContent("2");
    });

    // Then mark as unread
    const markUnreadButtons = screen.getAllByText("Mark Unread");
    await user.click(markUnreadButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId("unread-count")).toHaveTextContent("3");
    });
  });

  it("deletes a notification", async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("notification-count")).toHaveTextContent("3");
    });

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId("notification-count")).toHaveTextContent("2");
    });
  });

  it("deletes all read notifications", async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("notification-count")).toHaveTextContent("3");
    });

    // Mark one as read
    const markReadButtons = screen.getAllByText("Mark Read");
    await user.click(markReadButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId("unread-count")).toHaveTextContent("2");
    });

    // Delete all read
    await user.click(screen.getByTestId("delete-all-read"));

    await waitFor(() => {
      expect(screen.getByTestId("notification-count")).toHaveTextContent("2");
    });
  });

  it("filters notifications by type", async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("filtered-count")).toHaveTextContent("3");
    });

    await user.click(screen.getByTestId("set-filter"));

    await waitFor(() => {
      expect(screen.getByTestId("filtered-count")).toHaveTextContent("1");
    });
  });

  it("loads notifications from localStorage", async () => {
    const storedNotifications = [
      {
        id: "1",
        title: "Stored Notification",
        message: "From localStorage",
        type: "info",
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedNotifications));

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("notification-count")).toHaveTextContent("1");
    });
  });

  it("saves notifications to localStorage when changed", async () => {
    const user = userEvent.setup();
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("notification-count")).toHaveTextContent("3");
    });

    await user.click(screen.getByTestId("add-notification"));

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  it("throws error when useNotifications is used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    function BadComponent() {
      useNotifications();
      return null;
    }

    expect(() => render(<BadComponent />)).toThrow(
      "useNotifications must be used within a NotificationProvider"
    );

    consoleSpy.mockRestore();
  });
});
