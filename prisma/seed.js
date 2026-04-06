const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting database seed...');

  const password = await bcrypt.hash('Password123!', 12);

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ispani.co.za' },
    update: {},
    create: {
      email: 'admin@ispani.co.za',
      password_hash: password,
      first_name: 'Admin',
      last_name: 'User',
      type: 'admin',
      phone: '+27123456789',
      kyc_status: 'verified',
      trust_score: 100,
    },
  });
  console.log(`👤 Created admin: ${admin.email}`);

  const client = await prisma.user.upsert({
    where: { email: 'client@ispani.co.za' },
    update: {},
    create: {
      email: 'client@ispani.co.za',
      password_hash: password,
      first_name: 'Jane',
      last_name: 'Client',
      type: 'client',
      phone: '+27987654321',
      kyc_status: 'verified',
      trust_score: 85,
    },
  });
  console.log(`👤 Created client: ${client.email}`);

  const worker = await prisma.user.upsert({
    where: { email: 'worker@ispani.co.za' },
    update: {},
    create: {
      email: 'worker@ispani.co.za',
      password_hash: password,
      first_name: 'John',
      last_name: 'Worker',
      type: 'worker',
      phone: '+27555000111',
      kyc_status: 'verified',
      trust_score: 75,
      skills: ['gardening', 'plumbing', 'electrical'],
      location_lat: -26.2041,
      location_lng: 28.0473,
    },
  });
  console.log(`👤 Created worker: ${worker.email}`);

  // Create sample jobs
  const job1 = await prisma.job.create({
    data: {
      title: 'Garden Maintenance',
      description: 'Weekly garden maintenance including mowing, trimming, and weeding.',
      category: 'gardening',
      location_lat: -26.2041,
      location_lng: 28.0473,
      location_address: 'Sandton, Johannesburg',
      payment_amount: 500,
      status: 'open',
      client_id: client.id,
    },
  });
  console.log(`💼 Created job: ${job1.title}`);

  const job2 = await prisma.job.create({
    data: {
      title: 'House Painting',
      description: 'Interior painting for a 3-bedroom house. Paint supplied.',
      category: 'painting',
      location_lat: -26.1076,
      location_lng: 28.0567,
      location_address: 'Midrand, Johannesburg',
      payment_amount: 2500,
      status: 'open',
      client_id: client.id,
    },
  });
  console.log(`💼 Created job: ${job2.title}`);

  // Create sample application
  await prisma.application.create({
    data: {
      job_id: job1.id,
      user_id: worker.id,
      message: 'I have 5 years of gardening experience. Available to start immediately.',
      status: 'pending',
    },
  });
  console.log(`📝 Created application for: ${job1.title}`);

  console.log('');
  console.log('✅ Seed complete!');
  console.log('');
  console.log('🔑 Login credentials (all accounts):');
  console.log('   Password: Password123!');
  console.log(`   Admin:  ${admin.email}`);
  console.log(`   Client: ${client.email}`);
  console.log(`   Worker: ${worker.email}`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
