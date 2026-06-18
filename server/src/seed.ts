import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@ecole.fr',
      password: hashedPassword,
      role: 'ADMIN_PRINCIPAL',
      status: 'ACTIVE',
      adminProfile: {
        create: { nom: 'Directeur Principal' }
      }
    }
  });

  console.log("✅ Admin créé avec succès !", admin.email);
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });