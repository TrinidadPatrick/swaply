import '../setup';
import { PrismaClient } from '../../generated/prisma/test/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { describe, beforeAll, expect, afterAll, it } from 'vitest';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaBetterSqlite3({ url: connectionString });

const prisma = new PrismaClient({adapter});

describe('Prisma client (Sqlite)', () => {
  beforeAll(async () => {
    if (process.env.DATABASE_NAME === 'myapp_test') {
      await prisma.test_user.deleteMany();
    }
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should connect to the database', async () => {
    const result = await prisma.$queryRaw`SELECT 1`;
    expect(result).to.exist;
  });
});
