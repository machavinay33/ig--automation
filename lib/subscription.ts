import { prisma } from "./prisma";

export const TRIAL_DAYS = 1;
export const PLAN_PRICE_RS = 5;

export async function createTrialSubscription(userId: string) {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

  return prisma.subscription.create({
    data: {
      userId,
      status: "TRIALING",
      planAmountRs: PLAN_PRICE_RS,
      trialEndsAt,
    },
  });
}

export function isSubscriptionActive(sub: {
  status: string;
  trialEndsAt: Date;
  currentPeriodEnd?: Date | null;
}): boolean {
  const now = new Date();
  if (sub.status === "TRIALING") {
    return now < new Date(sub.trialEndsAt);
  }
  if (sub.status === "ACTIVE") {
    return sub.currentPeriodEnd ? now < new Date(sub.currentPeriodEnd) : true;
  }
  return false;
}

export function subscriptionLabel(sub: {
  status: string;
  trialEndsAt: Date;
}): string {
  const now = new Date();
  if (sub.status === "TRIALING") {
    const msLeft = new Date(sub.trialEndsAt).getTime() - now.getTime();
    if (msLeft <= 0) return "Trial expired";
    const hoursLeft = Math.max(1, Math.round(msLeft / (1000 * 60 * 60)));
    return `Free trial · ${hoursLeft}h left`;
  }
  if (sub.status === "ACTIVE") return "Active · ₹5/month";
  if (sub.status === "PAST_DUE") return "Payment due";
  if (sub.status === "CANCELED") return "Canceled";
  return "Expired";
}

export async function activateSubscriptionAfterPayment(
  userId: string,
  providerSubscriptionId: string,
  periodEndsAt: Date
) {
  return prisma.subscription.update({
    where: { userId },
    data: {
      status: "ACTIVE",
      paymentProvider: "razorpay",
      providerSubscriptionId,
      currentPeriodEnd: periodEndsAt,
    },
  });
}
