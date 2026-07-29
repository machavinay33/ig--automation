import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rules = await prisma.autoReplyRule.findMany({
    where: { instagramAccount: { userId: (session.user as any).id } },
    include: { instagramAccount: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ rules });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { instagramAccountId, name, keywords, replyTemplate } = await req.json();

  if (!instagramAccountId || !name || !replyTemplate) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // Make sure the IG account belongs to this user.
  const account = await prisma.instagramAccount.findFirst({
    where: { id: instagramAccountId, userId: (session.user as any).id },
  });
  if (!account) return NextResponse.json({ error: "Instagram account not found." }, { status: 404 });

  const rule = await prisma.autoReplyRule.create({
    data: {
      instagramAccountId,
      name,
      keywords: keywords || "",
      replyTemplate,
    },
  });

  return NextResponse.json({ rule });
}
