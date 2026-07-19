import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Plateforme vide : on efface tout le contenu métier
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();
  await prisma.companySettings.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // Un seul compte Admin pour démarrer (nécessaire pour se connecter)
  const admin = await prisma.user.create({
    data: {
      name: "Administrateur",
      email: "admin@dealzone.local",
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.companySettings.create({
    data: {
      companyName: "DealZone",
      currency: "XOF",
      defaultAlertThreshold: 5,
    },
  });

  console.log("Base vidée. Seul le compte Admin a été créé.");
  console.log({
    email: admin.email,
    password: "Password123!",
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
