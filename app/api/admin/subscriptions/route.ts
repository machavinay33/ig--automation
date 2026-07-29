import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, status } = await req.json();
  if (!userId || !status) {
    return NextResponse.json({ error: "userId and status are required." }, { status: 400 });
  }

  const sub = await prisma.subscription.update({
    where: { userId },
    data: { status },
  });

  return NextResponse.json({ subscription: sub });
}
