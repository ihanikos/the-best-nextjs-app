"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { Notification, NotificationFilters, CreateNotificationInput } from "./types";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  filters: NotificationFilters;
  setFilters: (filters: NotificationFilters) => void;
  addNotification: (input: CreateNotificationInput) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  markAsUnread: (id: string) => void;
  deleteNotification: (id: string) => void;
  deleteAllRead: () => void;
  getFilteredNotifications: () => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const STORAGE_KEY = "nexus_notifications";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createNotification(input: CreateNotificationInput): Notification {
  return {
    id: generateId(),
    ...input,
    read: false,
    createdAt: new Date().toISOString(),
  };
}

const sampleNotifications: CreateNotificationInput[] = [
  {
    title: "Welcome to Nexus",
    message: "Get started by creating your first project",
    type: "info",
    link: "/projects",
  },
  {
    title: "Project completed",
    message: "Website Redesign project has been marked as completed",
    type: "success",
    link: "/projects",
    metadata: { action: "project_completed" },
  },
  {
    title: "Team member joined",
    message: "Sarah Chen has joined the Mobile App project",
    type: "info",
    link: "/team",
    metadata: { action: "team_member_joined" },
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filters, setFilters] = useState<NotificationFilters>({
    type: "all",
    read: "all",
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setNotifications(parsed);
        } catch {
          // If parsing fails, initialize with sample data
          const initialNotifications = sampleNotifications.map(createNotification);
          setNotifications(initialNotifications);
        }
      } else {
        // Initialize with sample notifications
        const initialNotifications = sampleNotifications.map(createNotification);
        setNotifications(initialNotifications);
      }
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage whenever notifications change
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications, isInitialized]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((input: CreateNotificationInput) => {
    const notification = createNotification(input);
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markAsUnread = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: false } : n))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const deleteAllRead = useCallback(() => {
    setNotifications((prev) => prev.filter((n) => !n.read));
  }, []);

  const getFilteredNotifications = useCallback(() => {
    return notifications.filter((notification) => {
      // Filter by type
      if (filters.type && filters.type !== "all" && notification.type !== filters.type) {
        return false;
      }

      // Filter by read status
      if (filters.read !== "all" && filters.read !== undefined) {
        if (notification.read !== filters.read) {
          return false;
        }
      }

      // Filter by search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          notification.title.toLowerCase().includes(searchLower) ||
          notification.message.toLowerCase().includes(searchLower);
        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, filters]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        filters,
        setFilters,
        addNotification,
        markAsRead,
        markAllAsRead,
        markAsUnread,
        deleteNotification,
        deleteAllRead,
        getFilteredNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
