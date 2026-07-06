const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  try {
    const matieres = await p.matiere.findMany({
      include: {
        _count: { select: { livres: true, cours: true } },
        classe: { include: { cycle: true } },
      },
      orderBy: { nom: 'asc' }
    });
    console.log('Matieres count:', matieres.length);
    console.log('First matiere:', JSON.stringify(matieres[0], null, 2));
  } catch(e) {
    console.log('ERR:', e.code, e.message);
  } finally {
    await p.$disconnect();
  }
}
main();
