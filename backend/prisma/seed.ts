import { prisma } from '../src/prismaClient';

async function main() {
  // wipe tables (dev only)
  await prisma.unit.deleteMany();
  await prisma.property.deleteMany();

  const propertyA = await prisma.property.create({
    data: {
      name: 'Sunset Villas',
      address: '123 Main St',
      city: 'San Antonio',
      state: 'TX',
      zip: '78249',
      units: {
        create: [
          {
            unitNumber: '101',
            status: 'OCCUPIED',
            beds: 2,
            baths: 1,
            sqft: 850,
          },
          {
            unitNumber: '102',
            status: 'VACANT',
            beds: 1,
            baths: 1,
            sqft: 650,
          },
        ],
      },
    },
  });

  const propertyB = await prisma.property.create({
    data: {
      name: 'Riverwalk Lofts',
      address: '500 Riverwalk Ave',
      city: 'San Antonio',
      state: 'TX',
      zip: '78205',
      units: {
        create: [
          {
            unitNumber: '201',
            status: 'VACANT',
            beds: 1,
            baths: 1,
            sqft: 700,
          },
        ],
      },
    },
  });

  console.log('Seeded properties:', propertyA.name, propertyB.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
