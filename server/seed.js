const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedUsers = [
  { name: 'Admin User', email: 'admin@campus.edu', password: 'admin123', role: 'admin', department: 'Administration' },
  { name: 'Dr. Sharma', email: 'faculty@campus.edu', password: 'faculty123', role: 'faculty', department: 'CSE' },
  { name: 'Rahul Student', email: 'student@campus.edu', password: 'student123', role: 'student', department: 'CSE', year: '3rd' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartcampus360');
  console.log('Connected to MongoDB');

  for (const u of seedUsers) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
      console.log(`✅ Created: ${u.email} (${u.role})`);
    } else {
      console.log(`⚠️  Already exists: ${u.email}`);
    }
  }

  console.log('\n🎉 Seed complete! Use these accounts to login:');
  console.log('Admin:   admin@campus.edu / admin123');
  console.log('Faculty: faculty@campus.edu / faculty123');
  console.log('Student: student@campus.edu / student123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
