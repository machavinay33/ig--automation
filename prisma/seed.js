// Optional: run with `npm run seed` after `npx prisma db push`.
// Not required — the first user who signs up via /signup automatically
// becomes an admin. This script is just a convenience if you'd rather
// seed one directly.
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@example.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists:", email);
    return;
  }

  const passwordHash = await bcrypt.hash("changeme123", 10);
  const user = await prisma.user.create({
    data: { name: "Admin", email, passwordHash, role: "ADMIN" },
  });

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 1);
  await prisma.subscription.create({
    data: { userId: user.id, status: "TRIALING", planAmountRs: 5, trialEndsAt },
  });

  console.log("Created admin:", email, "password: changeme123");
}

main().finally(() => prisma.$disconnect());
