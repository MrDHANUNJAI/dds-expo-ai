import { db } from './models/db';

async function runSeed() {
  console.log('--- Running WorkNova Database Seed ---');
  await db.seedDefaultUsersIfEmpty();
  console.log('Seed completed successfully.');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
