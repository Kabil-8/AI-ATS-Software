const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Application = require('./src/models/Application');
const Job = require('./src/models/Job');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/talentai_ats', {
});

const assignApplication = async () => {
  try {
    const kabilUsers = await User.find({ name: { $regex: 'Kabil', $options: 'i' } });
    console.log('Found Kabil users:', kabilUsers.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role })));

    if (kabilUsers.length === 0) {
      console.log('No user named Kabil found.');
      process.exit();
    }

    // Sort to get the most recently created one (likely the one they just registered)
    kabilUsers.sort((a, b) => b.createdAt - a.createdAt);
    const targetUser = kabilUsers[0];

    console.log('Target user:', targetUser.name, targetUser.email);

    // Get the seeded job
    const job = await Job.findOne({ title: 'Senior Full Stack Engineer' });
    if (!job) {
      console.log('Job not found.');
      process.exit();
    }

    // Assign ALL applications to this user
    await Application.updateMany({}, { applicant: targetUser._id });

    console.log(`Successfully assigned all applications to ${targetUser.email}`);
    process.exit();
  } catch (err) {
    console.error('Error assigning application:', err);
    process.exit(1);
  }
};

assignApplication();
