import { AuthGuard } from "@/lib/auth";

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
