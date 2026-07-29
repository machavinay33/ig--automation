import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive } from "@/lib/subscription";

/**
 * Meta calls this GET once, when you register the webhook URL in your
 * Facebook App > Instagram > Webhooks settings, to verify you own it.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * Meta POSTs a payload here every time someone comments on a connected
 * account's post. Shape (simplified):
 * {
 *   entry: [{
 *     id: "<igUserId>",
 *     changes: [{
 *       field: "comments",
 *       value: { id: "<commentId>", text: "...", from: { username } }
 *     }]
 *   }]
 * }
 */
export async function POST(req: Request) {
  const payload = await req.json();

  try {
    for (const entry of payload.entry ?? []) {
      const igUserId = entry.id;
      const account = await prisma.instagramAccount.findFirst({
        where: { igUserId },
        include: { user: { include: { subscription: true } }, rules: true },
      });
      if (!account) continue;

      // Gate automation behind an active trial/subscription.
      const sub = account.user.subscription;
      if (!sub || !isSubscriptionActive(sub)) continue;

      for (const change of entry.changes ?? []) {
        if (change.field !== "comments") continue;
        const commentId: string = change.value?.id;
        const commentText: string = change.value?.text ?? "";
        const commenterUsername: string | undefined = change.value?.from?.username;

        const matchedRule = account.rules
          .filter((r) => r.isActive)
          .find((r) => {
            if (!r.keywords) return true; // empty keywords = match every comment
            const keys = r.keywords.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean);
            return keys.some((k) => commentText.toLowerCase().includes(k));
          });

        if (!matchedRule) {
          await prisma.commentLog.create({
            data: {
              instagramAccountId: account.id,
              commentId,
              commenterUsername,
              commentText,
              status: "skipped",
            },
          });
          continue;
        }

        const replyText = matchedRule.replyTemplate.replace(
          "{username}",
          commenterUsername ? `@${commenterUsername}` : ""
        );

        try {
          await replyToInstagramComment(account.accessToken, commentId, replyText);
          await prisma.commentLog.create({
            data: {
              instagramAccountId: account.id,
              commentId,
              commenterUsername,
              commentText,
              matchedRuleId: matchedRule.id,
              replyText,
              status: "replied",
            },
          });
        } catch (err) {
          console.error("Instagram reply failed", err);
          await prisma.commentLog.create({
            data: {
              instagramAccountId: account.id,
              commentId,
              commenterUsername,
              commentText,
              matchedRuleId: matchedRule.id,
              replyText,
              status: "failed",
            },
          });
        }
      }
    }
  } catch (err) {
    console.error("Webhook processing error", err);
  }

  // Always 200 quickly so Meta doesn't retry/disable the webhook.
  return NextResponse.json({ ok: true });
}

/**
 * Calls the real Instagram Graph API to reply to a comment.
 * Docs: https://developers.facebook.com/docs/instagram-api/guides/comment-moderation
 */
async function replyToInstagramComment(accessToken: string, commentId: string, message: string) {
  const url = `https://graph.facebook.com/v20.0/${commentId}/replies`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, access_token: accessToken }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Instagram API error: ${res.status} ${body}`);
  }
  return res.json();
}
