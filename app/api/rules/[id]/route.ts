import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertOwnership(ruleId: string, userId: string) {
  return prisma.autoReplyRule.findFirst({
    where: { id: ruleId, instagramAccount: { userId } },
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const owned = await assertOwnership(params.id, (session.user as any).id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const rule = await prisma.autoReplyRule.update({
    where: { id: params.id },
    data: {
      name: body.name ?? owned.name,
      keywords: body.keywords ?? owned.keywords,
      replyTemplate: body.replyTemplate ?? owned.replyTemplate,
      isActive: typeof body.isActive === "boolean" ? body.isActive : owned.isActive,
    },
  });

  return NextResponse.json({ rule });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const owned = await assertOwnership(params.id, (session.user as any).id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.autoReplyRule.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
