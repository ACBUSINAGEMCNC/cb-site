import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/adminAuth";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminUser();
  if (!admin) redirect("/admin/login");

  return <>{children}</>;
}
