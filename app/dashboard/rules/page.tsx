import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import RulesManager from "./RulesManager";

export default async function RulesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;

  const accounts = await prisma.instagramAccount.findMany({
    where: { userId },
    include: { rules: { orderBy: { createdAt: "desc" } } },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-8 text-2xl font-bold">Auto-reply rules</h1>
        {accounts.length === 0 ? (
          <div className="card">
            <p className="text-gray-600">
              Connect an Instagram account from the dashboard first, then come back to create rules.
            </p>
          </div>
        ) : (
          <RulesManager accounts={accounts as any} />
        )}
      </main>
    </div>
  );
}
