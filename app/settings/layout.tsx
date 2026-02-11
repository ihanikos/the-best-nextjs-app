import { AuthGuard } from "@/lib/auth";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
