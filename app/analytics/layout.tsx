import { AuthGuard } from "@/lib/auth";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
