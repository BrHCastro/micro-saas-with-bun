-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'paused', 'trialing', 'unpaid');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "stripe_subscription_status" "SubscriptionStatus";
