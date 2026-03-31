import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const prisma = new PrismaClient();

beforeAll(async () => {
  // Run migrations on test database
  await execPromise('prisma migrate deploy');
});

afterAll(async () => {
  await prisma.$disconnect();
});