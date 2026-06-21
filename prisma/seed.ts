import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin1234', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@univ.ac.kr' },
    update: {},
    create: {
      password,
      name: '관리자',
      email: 'admin@univ.ac.kr',
      phone: '0000000000',
      role: 'ADMIN',
      activated: true,
    },
  });
  console.log(`seed 완료 : ${admin.email}`);
}
main()
  .catch((e) => {
    console.log(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
// npm run seed
