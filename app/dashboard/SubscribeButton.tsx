"use client";

import { useState } from "react";

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleClick() {
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/subscription", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    setMsg(data.error || "Subscribed!");
  }

  return (
    <div className="text-right">
      <button onClick={handleClick} disabled={loading} className="btn-primary">
        {loading ? "Processing..." : "Subscribe · ₹5/month"}
      </button>
      {msg && <p className="mt-2 max-w-xs text-xs text-gray-500">{msg}</p>}
    </div>
  );
}
