import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.create({
    data: {
      email: 'admin@ecole.com',
      password: hashedPassword,
      role: 'ADMIN_PRINCIPAL',
      status: 'ACTIVE',
      adminProfile: {
        create: {
          nom: 'Administrateur Principal',
          mobile: ''
        }
      }
    }
  });

  console.log('Admin créé avec succès :', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());