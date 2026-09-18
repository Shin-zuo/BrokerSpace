import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

/**
 * Migration Utility: Grant 30 Days Complimentary Grace Period
 * Run this on your production database upon deployment to ensure
 * all existing registered brokers receive 30 days of free active access.
 *
 * Usage:
 *   npx tsx scripts/grant-grace-period.ts
 */
async function main() {
  console.log('🔄 Checking existing brokers for grace period allocation...');

  const graceExpires = new Date();
  graceExpires.setDate(graceExpires.getDate() + 30);

  // Find all brokers who do not have an active expiration date set yet
  const result = await prisma.broker.updateMany({
    where: {
      OR: [
        { subscriptionExpiresAt: null },
        { subscriptionStatus: { not: 'active' } },
      ],
    },
    data: {
      subscriptionStatus: 'active',
      subscriptionPlan: 'monthly',
      subscriptionExpiresAt: graceExpires,
    },
  });

  console.log(`✅ Successfully allocated 30-day grace period to ${result.count} broker accounts!`);
  console.log(`📅 Valid until: ${graceExpires.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`);
}

main()
  .catch((e) => {
    console.error('❌ Error applying grace period:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
