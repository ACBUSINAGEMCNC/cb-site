import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function main() {
  const adminEmail = "engenharia.artcompany@gmail.com";
  const adminPassword = "ArtCbusinage@2025";

  const passwordHash = sha256(adminPassword);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
    },
    create: {
      email: adminEmail,
      passwordHash,
    },
  });

  const categories = [
    { name: "Linha Fundida", slug: "linha-fundida" },
    { name: "Ponteiras", slug: "ponteiras" },
    { name: "Linha de Eixos", slug: "linha-de-eixos" },
    { name: "Linha de Buchas", slug: "linha-de-buchas" },
    { name: "Pulverizador", slug: "pulverizador" },
    { name: "Colheitadeira", slug: "colheitadeira" },
    { name: "Plantadeira", slug: "plantadeira" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { name: c.name, slug: c.slug },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
