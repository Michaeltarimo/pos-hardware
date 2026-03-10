import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = "pos1234";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { username: "tarimo" },
    update: { passwordHash, name: "Tarimo", role: "ADMIN" },
    create: {
      name: "Tarimo",
      username: "tarimo",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Seed done: Admin user 'tarimo' created/updated.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
