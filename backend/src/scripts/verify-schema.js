/**
 * Schema & Index Verification Script — AI ATS
 * Usage: node src/scripts/verify-schema.js
 *
 * Connects to MongoDB, validates that all collections and indexes exist,
 * and prints a human-readable health report.
 */
require('dotenv').config();
const mongoose = require('mongoose');

const User        = require('../models/User');
const Job         = require('../models/Job');
const Application = require('../models/Application');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-ats';

// ─── Expected indexes per collection ──────────────────────────────────────────

const EXPECTED_INDEXES = {
  users: [
    '_id_',
    'email_1',
    'role_1',
    'skills_1',
    'experience.company_text_skills_text_bio_text',
  ],
  jobs: [
    '_id_',
    'title_text_description_text_skills_text_department_text_tags_text',
    'status_1_createdAt_-1',
    'postedBy_1_status_1',
    'department_1_status_1',
    'experienceLevel_1_status_1',
    'skills_1',
    'applicationDeadline_1',
    'isFeatured_1_status_1_createdAt_-1',
  ],
  applications: [
    '_id_',
    'job_1_applicant_1',
    'job_1_stage_1_kanbanOrder_1',
    'job_1_status_1',
    'applicant_1_createdAt_-1',
    'job_1_aiAnalysis.matchScore_-1',
    'job_1_rating_-1',
    'aiAnalysis.isAnalyzed_1_aiAnalysis.isAnalyzing_1',
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normaliseIndexName(spec) {
  return Object.entries(spec)
    .map(([k, v]) => `${k}_${v}`)
    .join('_');
}

async function verifyCollection(model, expectedIndexNames) {
  const collection = model.collection;
  const name = collection.collectionName;

  // Count documents
  const count = await model.countDocuments();

  // List actual indexes
  const indexes = await collection.indexes();
  const actualNames = new Set(indexes.map((idx) => idx.name));

  console.log(`\n  📂 Collection: \x1b[36m${name}\x1b[0m  (${count} documents)`);
  console.log('  ─────────────────────────────────────────────');

  let passed = 0;
  let failed = 0;

  for (const expectedName of expectedIndexNames) {
    // Allow partial match for text indexes (MongoDB may abbreviate names)
    const found = [...actualNames].some(
      (actual) =>
        actual === expectedName ||
        actual.startsWith(expectedName.split('_')[0]) && expectedName.includes('text')
    );
    if (found) {
      console.log(`  \x1b[32m  ✓\x1b[0m ${expectedName}`);
      passed++;
    } else {
      console.log(`  \x1b[31m  ✗ MISSING\x1b[0m ${expectedName}`);
      failed++;
    }
  }

  // Print any extra (unexpected) indexes
  for (const actual of actualNames) {
    if (actual === '_id_') continue;
    const known = expectedIndexNames.some(
      (exp) => exp === actual || (actual.includes('text') && exp.includes('text'))
    );
    if (!known) {
      console.log(`  \x1b[33m  ~ EXTRA\x1b[0m  ${actual}`);
    }
  }

  return { name, count, passed, failed };
}

// ─── Field sample check ───────────────────────────────────────────────────────

async function checkFieldSample() {
  console.log('\n\n  🔍 Field Spot-Checks');
  console.log('  ─────────────────────────────────────────────');

  // 1. Recruiter has company field
  const recruiter = await User.findOne({ role: 'recruiter' }).lean();
  if (recruiter) {
    const hasCompany = !!recruiter.company;
    console.log(`  ${hasCompany ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} Recruiter.company: "${recruiter.company || 'MISSING'}"`);
  }

  // 2. Applicant has skills
  const applicant = await User.findOne({ role: 'applicant', skills: { $exists: true } }).lean();
  if (applicant) {
    const hasSkills = Array.isArray(applicant.skills) && applicant.skills.length > 0;
    console.log(`  ${hasSkills ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} Applicant.skills: [${(applicant.skills || []).slice(0, 3).join(', ')}]`);
  }

  // 3. Job has salary sub-document
  const job = await Job.findOne({ 'salary.min': { $exists: true } }).lean();
  if (job) {
    console.log(`  \x1b[32m✓\x1b[0m Job.salary: ${job.salary?.currency} ${job.salary?.min?.toLocaleString()} – ${job.salary?.max?.toLocaleString()}`);
  }

  // 4. Application has aiAnalysis
  const app = await Application.findOne({ 'aiAnalysis.isAnalyzed': true }).lean();
  if (app) {
    console.log(`  \x1b[32m✓\x1b[0m Application.aiAnalysis.matchScore: ${app.aiAnalysis?.matchScore}`);
  }

  // 5. No duplicate (job, applicant) pair
  const dupCheck = await Application.aggregate([
    { $group: { _id: { job: '$job', applicant: '$applicant' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);
  const noDups = dupCheck.length === 0;
  console.log(`  ${noDups ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} No duplicate (job, applicant) pairs: ${noDups ? 'PASS' : dupCheck.length + ' duplicates found!'}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function verify() {
  console.log('\n\x1b[35m╔══════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[35m║     AI ATS — Schema & Index Verification Report       ║\x1b[0m');
  console.log('\x1b[35m╚══════════════════════════════════════════════════════╝\x1b[0m');

  await mongoose.connect(MONGO_URI);
  console.log(`\n  ✅ Connected: \x1b[36m${MONGO_URI}\x1b[0m`);

  const results = [];
  results.push(await verifyCollection(User,        EXPECTED_INDEXES.users));
  results.push(await verifyCollection(Job,         EXPECTED_INDEXES.jobs));
  results.push(await verifyCollection(Application, EXPECTED_INDEXES.applications));

  await checkFieldSample();

  // ── Summary ────────────────────────────────────────────────────────────────
  const totalPassed = results.reduce((s, r) => s + r.passed, 0);
  const totalFailed = results.reduce((s, r) => s + r.failed, 0);
  const totalDocs   = results.reduce((s, r) => s + r.count, 0);

  console.log('\n\n\x1b[35m══════════════════════════════════════════════════════\x1b[0m');
  console.log('  📊 Summary');
  console.log('  ──────────────────────────────────────────────────────');
  console.log(`  Collections checked : ${results.length}`);
  console.log(`  Total documents     : ${totalDocs}`);
  console.log(`  Indexes verified    : \x1b[32m${totalPassed} passed\x1b[0m, ${totalFailed > 0 ? `\x1b[31m${totalFailed} missing\x1b[0m` : '\x1b[32m0 missing\x1b[0m'}`);

  if (totalFailed === 0) {
    console.log('\n  \x1b[32m🎉 All indexes verified — schema is healthy!\x1b[0m');
  } else {
    console.log('\n  \x1b[33m⚠️  Some indexes are missing. Run: npm run seed\x1b[0m');
    console.log('  \x1b[33m   Then restart the server to rebuild indexes.\x1b[0m');
  }

  console.log('\x1b[35m══════════════════════════════════════════════════════\x1b[0m\n');

  await mongoose.disconnect();
  process.exit(totalFailed > 0 ? 1 : 0);
}

verify().catch((err) => {
  console.error('\n❌ Verification failed:', err.message);
  mongoose.disconnect().finally(() => process.exit(1));
});
