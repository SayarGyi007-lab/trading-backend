import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient()

async function seed(){
    await prisma.orders_type.upsert({
        where: { order_type_id: 1 },
        update: {},
        create: { name: "BUY" }
    })

    await prisma.orders_type.upsert({
        where: { order_type_id: 2 },
        update: {},
        create: { name: "SELL" }
    });

    console.log("Seeded order types: BUY, SELL");
}

seed()
  .catch((e) => {
    console.error(e);
    return
  })
  .finally(async () => {
    await prisma.$disconnect();
  });