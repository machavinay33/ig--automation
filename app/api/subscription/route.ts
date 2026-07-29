import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive, subscriptionLabel } from "@/lib/subscription";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await prisma.subscription.findUnique({
    where: { userId: (session.user as any).id },
  });
  if (!sub) return NextResponse.json({ error: "No subscription found." }, { status: 404 });

  return NextResponse.json({
    subscription: sub,
    active: isSubscriptionActive(sub),
    label: subscriptionLabel(sub),
  });
}

/**
 * Stub endpoint for "Subscribe now" button on the pricing/dashboard page.
 * Replace the body with a real Razorpay order/subscription creation call,
 * then flip status to ACTIVE inside the Razorpay webhook handler instead
 * of here (never trust the client to confirm payment success).
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Payments are not wired up yet. Add RAZORPAY_KEY_ID/SECRET and implement checkout in lib/subscription.ts.",
    },
    { status: 501 }
  );
}
