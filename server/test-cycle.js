const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  try {
    const r = await p.cycle.create({ data: { libelle: 'Test Cycle ' + Date.now(), description: 'test desc' } });
    console.log('OK', JSON.stringify(r));
  } catch(e) {
    console.log('ERR', e.code, e.message);
  } finally {
    await p.$disconnect();
  }
}
main();
