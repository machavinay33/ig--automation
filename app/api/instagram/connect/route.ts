import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * In production this route is hit at the end of the Instagram/Facebook
 * OAuth redirect (using INSTAGRAM_APP_ID / INSTAGRAM_APP_SECRET from .env).
 * Meta's flow:
 *   1. Redirect user to https://api.instagram.com/oauth/authorize?...
 *   2. Exchange the returned `code` for a short-lived token, then a
 *      long-lived token via /access_token & /oauth/access_token.
 *   3. Call /me?fields=id,username with that token to get igUserId/username.
 *   4. Save the long-lived token below.
 *
 * For now this endpoint accepts those three fields directly so you can test
 * the dashboard end-to-end before wiring the full OAuth dance.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { igUserId, username, accessToken } = await req.json();
  if (!igUserId || !username || !accessToken) {
    return NextResponse.json({ error: "Missing Instagram account details." }, { status: 400 });
  }

  const account = await prisma.instagramAccount.upsert({
    where: { userId_igUserId: { userId: (session.user as any).id, igUserId } },
    update: { username, accessToken },
    create: {
      userId: (session.user as any).id,
      igUserId,
      username,
      accessToken,
    },
  });

  return NextResponse.json({ account });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accounts = await prisma.instagramAccount.findMany({
    where: { userId: (session.user as any).id },
  });
  return NextResponse.json({ accounts });
}
