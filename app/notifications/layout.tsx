import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | Nexus",
  description: "View and manage your notifications",
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
