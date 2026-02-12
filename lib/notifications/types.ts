export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
  metadata?: {
    projectId?: string;
    userId?: string;
    action?: string;
  };
}

export interface NotificationFilters {
  type?: NotificationType | "all";
  read?: boolean | "all";
  search?: string;
}

export interface CreateNotificationInput {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Notification["metadata"];
}
