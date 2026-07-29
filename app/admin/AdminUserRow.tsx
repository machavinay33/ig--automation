"use client";

import { useRouter } from "next/navigation";

type Row = {
  id: string;
  name: string;
  email: string;
  role: string;
  igCount: number;
  subLabel: string;
  joined: string;
};

export default function AdminUserRow({ user }: { user: Row }) {
  const router = useRouter();

  async function setStatus(status: string) {
    await fetch("/api/admin/subscriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, status }),
    });
    router.refresh();
  }

  return (
    <tr className="border-t border-gray-100">
      <td className="py-2 pr-4">{user.name} {user.role === "ADMIN" && <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs">admin</span>}</td>
      <td className="py-2 pr-4">{user.email}</td>
      <td className="py-2 pr-4">{user.igCount}</td>
      <td className="py-2 pr-4">{user.subLabel}</td>
      <td className="py-2 pr-4 text-gray-500">{user.joined}</td>
      <td className="py-2">
        <div className="flex gap-2">
          <button onClick={() => setStatus("ACTIVE")} className="text-xs text-green-700 hover:underline">
            Mark active
          </button>
          <button onClick={() => setStatus("CANCELED")} className="text-xs text-red-600 hover:underline">
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
}
