import dotenv from 'dotenv';

// 1️⃣ Load test env
dotenv.config({ path: '.env.test' });

// 2️⃣ Safety check
if (process.env.NODE_ENV !== 'test') {
  throw new Error('❌ Prisma tests must run in TEST mode');
}