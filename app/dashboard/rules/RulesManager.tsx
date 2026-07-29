"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Rule = {
  id: string;
  name: string;
  keywords: string;
  replyTemplate: string;
  isActive: boolean;
};

type Account = {
  id: string;
  username: string;
  rules: Rule[];
};

export default function RulesManager({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [replyTemplate, setReplyTemplate] = useState("Thanks for your comment, {username}! 🙌");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedAccount = accounts.find((a) => a.id === accountId);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instagramAccountId: accountId, name, keywords, replyTemplate }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create rule.");
      return;
    }
    setName("");
    setKeywords("");
    router.refresh();
  }

  async function toggleActive(rule: Rule) {
    await fetch(`/api/rules/${rule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !rule.isActive }),
    });
    router.refresh();
  }

  async function deleteRule(rule: Rule) {
    if (!confirm(`Delete rule "${rule.name}"?`)) return;
    await fetch(`/api/rules/${rule.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">Create a new rule</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Instagram account</label>
            <select className="input" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>@{a.username}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Rule name</label>
            <input className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Price question" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Keywords (comma-separated, leave empty to match every comment)</label>
            <input className="input" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="price, cost, how much" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Reply template (use {"{username}"} to mention the commenter)</label>
            <textarea className="input" rows={3} required value={replyTemplate} onChange={(e) => setReplyTemplate(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Creating..." : "Create rule"}
          </button>
        </form>
      </div>

      {selectedAccount && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Rules for @{selectedAccount.username}</h2>
          {selectedAccount.rules.length === 0 ? (
            <p className="text-sm text-gray-500">No rules yet for this account.</p>
          ) : (
            <ul className="space-y-3">
              {selectedAccount.rules.map((rule) => (
                <li key={rule.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-sm text-gray-500">
                        Keywords: {rule.keywords || <em>matches all comments</em>}
                      </p>
                      <p className="mt-1 text-sm text-gray-700">"{rule.replyTemplate}"</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleActive(rule)} className="btn-secondary !px-3 !py-1.5 text-xs">
                        {rule.isActive ? "Pause" : "Activate"}
                      </button>
                      <button onClick={() => deleteRule(rule)} className="!px-3 !py-1.5 text-xs text-red-600 hover:underline">
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
