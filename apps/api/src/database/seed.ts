import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { Job } from '../entities/job.entity';

async function seed() {
  console.log('\u{1F331} Starting database seed...');

  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://ispani:ispani_dev_password@localhost:5432/ispani',
    entities: [User, Organization, Job],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('\u{2705} Database connected');

  // Create organizations
  const orgRepo = dataSource.getRepository(Organization);
  const org = orgRepo.create({
    name: 'Ispani Demo Corp',
    plan: 'professional',
    plan_status: 'active',
  });
  const savedOrg = await orgRepo.save(org);
  console.log(`\u{1F3E2} Created org: ${savedOrg.name}`);

  // Create users
  const userRepo = dataSource.getRepository(User);
  const password = await bcrypt.hash('Password123!', 12);

  const admin = userRepo.create({
    email: 'admin@ispani.co.za',
    password_hash: password,
    first_name: 'Admin',
    last_name: 'User',
    type: 'admin',
    phone: '+27123456789',
    kyc_status: 'verified',
    trust_score: 100,
    organization_id: savedOrg.id,
  });

  const client = userRepo.create({
    email: 'client@ispani.co.za',
    password_hash: password,
    first_name: 'Jane',
    last_name: 'Client',
    type: 'client',
    phone: '+27987654321',
    kyc_status: 'verified',
    trust_score: 85,
    organization_id: savedOrg.id,
  });

  const worker = userRepo.create({
    email: 'worker@ispani.co.za',
    password_hash: password,
    first_name: 'John',
    last_name: 'Worker',
    type: 'worker',
    phone: '+27555000111',
    kyc_status: 'verified',
    trust_score: 75,
  });

  const [savedAdmin, savedClient, savedWorker] = await userRepo.save([admin, client, worker]);
  console.log(`\u{1F464} Created ${3} users`);

  // Create jobs
  const jobRepo = dataSource.getRepository(Job);
  const jobs = [
    {
      organization_id: savedOrg.id,
      client_id: savedClient.id,
      title: 'Garden Maintenance',
      description: 'Weekly garden maintenance including mowing, trimming, and weeding.',
      category: 'gardening',
      location_lat: -26.2041,
      location_lng: 28.0473,
      location_address: 'Sandton, Johannesburg',
      payment_amount: 500,
      status: 'open' as const,
    },
    {
      organization_id: savedOrg.id,
      client_id: savedClient.id,
      title: 'House Cleaning',
      description: 'Deep clean of 3-bedroom house including windows and floors.',
      category: 'cleaning',
      location_lat: -33.9249,
      location_lng: 18.4241,
      location_address: 'Cape Town CBD',
      payment_amount: 800,
      status: 'open' as const,
    },
    {
      organization_id: savedOrg.id,
      client_id: savedClient.id,
      worker_id: savedWorker.id,
      title: 'Electrical Repair',
      description: 'Fix faulty wiring in kitchen and install new power outlets.',
      category: 'electrical',
      location_lat: -29.8587,
      location_lng: 31.0218,
      location_address: 'Durban North',
      payment_amount: 1200,
      status: 'assigned' as const,
    },
  ];

  await jobRepo.save(jobs.map((j) => jobRepo.create(j)));
  console.log(`\u{1F4BC} Created ${jobs.length} jobs`);

  console.log('\n\u{2728} Seed completed!');
  console.log('\u{1F511} Login credentials: email=admin@ispani.co.za password=Password123!');

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('\u{274C} Seed failed:', err);
  process.exit(1);
});
