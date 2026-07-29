import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive, subscriptionLabel } from "@/lib/subscription";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import ConnectInstagramForm from "./ConnectInstagramForm";
import SubscribeButton from "./SubscribeButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;

  const [subscription, accounts, recentLogs] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.instagramAccount.findMany({ where: { userId }, include: { rules: true } }),
    prisma.commentLog.findMany({
      where: { instagramAccount: { userId } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const active = subscription ? isSubscriptionActive(subscription) : false;
  const label = subscription ? subscriptionLabel(subscription) : "No subscription";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-8 text-2xl font-bold">Dashboard</h1>

        {/* Subscription status banner */}
        <div className={`card mb-8 flex flex-wrap items-center justify-between gap-4 ${!active ? "border-amber-300 bg-amber-50" : ""}`}>
          <div>
            <p className="text-sm text-gray-500">Subscription status</p>
            <p className="text-lg font-semibold">{label}</p>
          </div>
          {!active && <SubscribeButton />}
        </div>

        {!active && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Automation is paused because your trial/subscription is not active. Subscribe to
            resume auto-replies.
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Connect Instagram */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold">Connected Instagram accounts</h2>
            {accounts.length === 0 && (
              <p className="mb-4 text-sm text-gray-500">No accounts connected yet.</p>
            )}
            <ul className="mb-6 space-y-2">
              {accounts.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                  <span className="font-medium">@{a.username}</span>
                  <span className="text-xs text-gray-500">{a.rules.length} rule(s)</span>
                </li>
              ))}
            </ul>
            <ConnectInstagramForm />
          </div>

          {/* Rules shortcut */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold">Auto-reply rules</h2>
            <p className="mb-4 text-sm text-gray-600">
              Create keyword-based rules so comments get replied to automatically.
            </p>
            <Link href="/dashboard/rules" className="btn-primary">
              Manage rules →
            </Link>
          </div>
        </div>

        {/* Recent activity */}
        <div className="card mt-8">
          <h2 className="mb-4 text-lg font-semibold">Recent comment activity</h2>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-gray-500">No comments processed yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="py-2">Comment</th>
                  <th className="py-2">From</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">When</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id} className="border-t border-gray-100">
                    <td className="max-w-xs truncate py-2">{log.commentText}</td>
                    <td className="py-2">{log.commenterUsername ? `@${log.commenterUsername}` : "—"}</td>
                    <td className="py-2 capitalize">{log.status}</td>
                    <td className="py-2 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
