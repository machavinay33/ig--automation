"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConnectInstagramForm() {
  const router = useRouter();
  const [igUserId, setIgUserId] = useState("");
  const [username, setUsername] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/instagram/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ igUserId, username, accessToken }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to connect account.");
      return;
    }
    setIgUserId("");
    setUsername("");
    setAccessToken("");
    router.refresh();
  }

  return (
    <details className="rounded-lg border border-gray-200 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-brand-600">
        + Connect an Instagram account
      </summary>
      <p className="mt-3 text-xs text-gray-500">
        Requires an Instagram Business/Creator account and a long-lived Graph API access token
        (see README for the OAuth setup with your Meta App).
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input
          className="input"
          placeholder="Instagram User ID"
          value={igUserId}
          onChange={(e) => setIgUserId(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Username (without @)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Long-lived access token"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full !py-2">
          {loading ? "Connecting..." : "Connect account"}
        </button>
      </form>
    </details>
  );
}
