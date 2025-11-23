import { prisma } from '../src/prismaClient';

async function main() {
  // wipe tables (dev only)
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users (staff)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@leaselink.com',
      password: 'hashed_password_123', // In real app, use bcrypt
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@leaselink.com',
      password: 'hashed_password_456',
      role: 'MANAGER',
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@leaselink.com',
      password: 'hashed_password_789',
      role: 'STAFF',
    },
  });

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

  // Fetch units to create tenants
  const unit101 = await prisma.unit.findFirst({
    where: { unitNumber: '101', propertyId: propertyA.id },
  });

  const unit102 = await prisma.unit.findFirst({
    where: { unitNumber: '102', propertyId: propertyA.id },
  });

  const unit201 = await prisma.unit.findFirst({
    where: { unitNumber: '201', propertyId: propertyB.id },
  });

  // Create sample tenants
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '210-555-0101',
      unitId: unit101!.id,
    },
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '210-555-0102',
      unitId: unit201!.id,
    },
  });

  // Create sample tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      unitId: unit101!.id,
      tenantId: tenant1.id,
      title: 'Leaking faucet in kitchen',
      description:
        'The kitchen faucet has been dripping constantly for the past week. Water pressure seems low as well.',
      priority: 'HIGH',
      status: 'OPEN',
      assignedToId: staff.id,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      unitId: unit101!.id,
      tenantId: tenant1.id,
      title: 'AC not cooling properly',
      description:
        'Air conditioner is running but not cooling the apartment. Temperature is above 80°F.',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      assignedToId: manager.id,
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      unitId: unit201!.id,
      tenantId: tenant2.id,
      title: 'Request for lightbulb replacement',
      description: 'Need replacement lightbulbs for living room ceiling fixture.',
      priority: 'LOW',
      status: 'OPEN',
    },
  });

  // Create sample comments
  await prisma.comment.create({
    data: {
      ticketId: ticket1.id,
      authorId: staff.id,
      body: 'I will check this out tomorrow morning.',
    },
  });

  await prisma.comment.create({
    data: {
      ticketId: ticket2.id,
      authorId: manager.id,
      body: 'HVAC technician scheduled for today at 2 PM.',
    },
  });

  await prisma.comment.create({
    data: {
      ticketId: ticket2.id,
      authorId: manager.id,
      body: 'Technician replaced the compressor. Testing now.',
    },
  });

  console.log('Seeded properties:', propertyA.name, propertyB.name);
  console.log('Seeded users:', admin.email, manager.email, staff.email);
  console.log('Seeded tenants:', tenant1.name, tenant2.name);
  console.log('Seeded 3 tickets with comments');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
