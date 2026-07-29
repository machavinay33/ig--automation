import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { subscriptionLabel } from "@/lib/subscription";
import AdminUserRow from "./AdminUserRow";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    include: { subscription: true, instagramAccounts: true },
    orderBy: { createdAt: "desc" },
  });

  const totalUsers = users.length;
  const activeCount = users.filter(
    (u) => u.subscription && (u.subscription.status === "ACTIVE" || u.subscription.status === "TRIALING")
  ).length;
  const payingCount = users.filter((u) => u.subscription?.status === "ACTIVE").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-8 text-2xl font-bold">Admin panel</h1>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="card text-center">
            <p className="text-sm text-gray-500">Total users</p>
            <p className="text-3xl font-bold">{totalUsers}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-500">Active / trialing</p>
            <p className="text-3xl font-bold">{activeCount}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-500">Paying (₹5/mo)</p>
            <p className="text-3xl font-bold">{payingCount}</p>
          </div>
        </div>

        <div className="card overflow-x-auto">
          <h2 className="mb-4 text-lg font-semibold">All users</h2>
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">IG accounts</th>
                <th className="py-2 pr-4">Subscription</th>
                <th className="py-2 pr-4">Joined</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <AdminUserRow
                  key={u.id}
                  user={{
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    igCount: u.instagramAccounts.length,
                    subLabel: u.subscription ? subscriptionLabel(u.subscription) : "—",
                    joined: u.createdAt.toLocaleDateString(),
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
