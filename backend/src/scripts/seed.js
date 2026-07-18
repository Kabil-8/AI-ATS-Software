/**
 * Database Seed Script — AI ATS
 * Usage: node src/scripts/seed.js
 * All accounts use password: Password123!
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-ats';

// ─── Seed Data ─────────────────────────────────────────────────────────────

const RECRUITERS = [
  {
    name: 'Sarah Mitchell', email: 'recruiter1@demo.com', password: 'Password123!',
    role: 'recruiter', company: 'TechNova Solutions', jobTitle: 'Head of Talent',
    industry: 'Software & Technology', companySize: 'medium',
    companyWebsite: 'https://technova.io',
    companyDescription: 'Building next-gen enterprise software.',
    location: 'San Francisco, CA', phone: '+1-415-555-0101',
    bio: 'Passionate about connecting great engineers with meaningful work.',
  },
  {
    name: 'James Carter', email: 'recruiter2@demo.com', password: 'Password123!',
    role: 'recruiter', company: 'DataBridge Corp', jobTitle: 'Senior Recruiter',
    industry: 'Data & Analytics', companySize: 'large',
    companyWebsite: 'https://databridge.com',
    companyDescription: 'Turning raw data into actionable intelligence.',
    location: 'New York, NY', phone: '+1-212-555-0202',
    bio: 'Specialist in data engineering and ML talent acquisition.',
  },
];

const APPLICANTS = [
  {
    name: 'Alex Rivera', email: 'alex@demo.com', password: 'Password123!',
    role: 'applicant', phone: '+1-650-555-1001', location: 'Austin, TX',
    bio: 'Full-stack engineer with 4 years building scalable web apps.',
    skills: ['react', 'node.js', 'typescript', 'postgresql', 'docker', 'aws'],
    linkedIn: 'https://linkedin.com/in/alexrivera',
    experience: [{
      title: 'Software Engineer', company: 'StartupXYZ',
      startDate: new Date('2021-06-01'), current: true,
      description: 'Built React/Node microservices serving 50K daily users.',
    }],
    education: [{ degree: 'BSc Computer Science', institution: 'UT Austin', field: 'CS', endYear: 2021 }],
  },
  {
    name: 'Priya Sharma', email: 'priya@demo.com', password: 'Password123!',
    role: 'applicant', phone: '+1-408-555-1002', location: 'Seattle, WA',
    bio: 'ML engineer specializing in NLP and recommendation systems.',
    skills: ['python', 'tensorflow', 'pytorch', 'nlp', 'sql', 'spark', 'aws'],
    linkedIn: 'https://linkedin.com/in/priyasharma',
    experience: [{
      title: 'ML Engineer', company: 'AI Ventures',
      startDate: new Date('2020-03-01'), current: true,
      description: 'Developed NLP pipelines reducing manual review time by 60%.',
    }],
    education: [{ degree: 'MSc Machine Learning', institution: 'University of Washington', field: 'ML', endYear: 2020 }],
  },
  {
    name: 'Marcus Thompson', email: 'marcus@demo.com', password: 'Password123!',
    role: 'applicant', phone: '+1-312-555-1003', location: 'Chicago, IL',
    bio: 'DevOps and cloud infrastructure engineer. 5 years of AWS/GCP experience.',
    skills: ['aws', 'kubernetes', 'terraform', 'ci/cd', 'docker', 'python', 'bash'],
    linkedIn: 'https://linkedin.com/in/marcusthompson',
    experience: [{
      title: 'DevOps Engineer', company: 'CloudSystems Inc',
      startDate: new Date('2019-01-01'), current: true,
      description: 'Managed Kubernetes clusters handling 200+ microservices.',
    }],
    education: [{ degree: 'BSc Information Systems', institution: 'DePaul University', field: 'IS', endYear: 2019 }],
  },
  {
    name: 'Emily Chen', email: 'emily@demo.com', password: 'Password123!',
    role: 'applicant', phone: '+1-415-555-1004', location: 'San Francisco, CA',
    bio: 'Frontend specialist who loves crafting pixel-perfect UIs.',
    skills: ['react', 'vue.js', 'typescript', 'css', 'figma', 'graphql'],
    linkedIn: 'https://linkedin.com/in/emilychen',
    experience: [{
      title: 'Frontend Engineer', company: 'DesignFirst Agency',
      startDate: new Date('2022-01-01'), current: true,
      description: 'Led UI revamp increasing user engagement by 35%.',
    }],
    education: [{ degree: 'BSc Computer Science', institution: 'Stanford University', field: 'CS', endYear: 2022 }],
  },
  {
    name: 'David Park', email: 'david@demo.com', password: 'Password123!',
    role: 'applicant', phone: '+1-503-555-1005', location: 'Portland, OR',
    bio: 'Backend engineer focused on high-performance APIs and databases.',
    skills: ['java', 'spring boot', 'postgresql', 'redis', 'kafka', 'microservices'],
    linkedIn: 'https://linkedin.com/in/davidpark',
    experience: [{
      title: 'Backend Engineer', company: 'FinTech Solutions',
      startDate: new Date('2018-09-01'), current: true,
      description: 'Designed payment processing APIs handling $2M/day transactions.',
    }],
    education: [{ degree: 'BSc Software Engineering', institution: 'Oregon State', field: 'SE', endYear: 2018 }],
  },
  {
    name: 'Sofia Martinez', email: 'sofia@demo.com', password: 'Password123!',
    role: 'applicant', phone: '+1-305-555-1006', location: 'Miami, FL',
    bio: 'Data analyst and BI specialist turning complex data into clear insights.',
    skills: ['python', 'sql', 'tableau', 'power bi', 'excel', 'pandas', 'statistics'],
    linkedIn: 'https://linkedin.com/in/sofiamartinez',
    experience: [{
      title: 'Data Analyst', company: 'RetailMetrics',
      startDate: new Date('2021-03-01'), current: true,
      description: 'Built dashboards used by C-suite to drive $10M in decisions.',
    }],
    education: [{ degree: 'BSc Statistics', institution: 'University of Miami', field: 'Statistics', endYear: 2021 }],
  },
  {
    name: 'Ryan O\'Brien', email: 'ryan@demo.com', password: 'Password123!',
    role: 'applicant', phone: '+1-617-555-1007', location: 'Boston, MA',
    bio: 'Security engineer with expertise in penetration testing and cloud security.',
    skills: ['cybersecurity', 'penetration testing', 'aws security', 'python', 'linux', 'siem'],
    linkedIn: 'https://linkedin.com/in/ryanobrien',
    experience: [{
      title: 'Security Engineer', company: 'SecureNet',
      startDate: new Date('2020-06-01'), current: true,
      description: 'Conducted 50+ penetration tests for Fortune 500 clients.',
    }],
    education: [{ degree: 'BSc Cybersecurity', institution: 'Northeastern University', field: 'Security', endYear: 2020 }],
  },
  {
    name: 'Lisa Wang', email: 'lisa@demo.com', password: 'Password123!',
    role: 'applicant', phone: '+1-206-555-1008', location: 'Seattle, WA',
    bio: 'Product engineer bridging design and engineering for consumer apps.',
    skills: ['react native', 'react', 'node.js', 'swift', 'product management', 'agile'],
    linkedIn: 'https://linkedin.com/in/lisawang',
    experience: [{
      title: 'Product Engineer', company: 'MobileFirst Inc',
      startDate: new Date('2021-09-01'), current: true,
      description: 'Shipped 3 major app releases to 500K+ active users.',
    }],
    education: [{ degree: 'BSc Human-Computer Interaction', institution: 'Carnegie Mellon', field: 'HCI', endYear: 2021 }],
  },
];

// ─── Helper ────────────────────────────────────────────────────────────────

function futureDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function mockAI(score) {
  const skills = ['react', 'node.js', 'typescript', 'python', 'docker', 'aws', 'sql'];
  const matched = skills.slice(0, Math.floor(score / 15));
  const missing = skills.slice(Math.floor(score / 15));
  return {
    matchScore: score,
    confidence: parseFloat((0.7 + Math.random() * 0.28).toFixed(2)),
    skillsMatched: matched,
    skillsMissing: missing.slice(0, 3),
    experienceSummary: `Candidate has ${Math.floor(score / 20) + 1} years of relevant experience.`,
    strengths: [`Strong ${matched[0] || 'technical'} skills`, 'Good communication', 'Team player'],
    weaknesses: missing.length ? [`Limited ${missing[0]} experience`] : [],
    summary: `Candidate scored ${score}/100. ${score >= 70 ? 'Recommended for interview.' : 'May need further evaluation.'}`,
    suggestedQuestions: [
      'Describe your most challenging technical project.',
      `How have you used ${matched[0] || 'your skills'} in production?`,
      'Tell me about a time you disagreed with your team.',
    ],
    isAnalyzed: true,
    isAnalyzing: false,
    analyzedAt: new Date(),
  };
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱 AI ATS — Database Seed Script\n');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
  ]);
  console.log('   Done.\n');

  // Create recruiters
  console.log('👤 Creating recruiters...');
  const recruiters = await User.create(RECRUITERS);
  console.log(`   ✓ ${recruiters.length} recruiters created\n`);

  // Create applicants
  console.log('👥 Creating applicants...');
  const applicants = await User.create(APPLICANTS);
  console.log(`   ✓ ${applicants.length} applicants created\n`);

  const [rec1, rec2] = recruiters;

  // Create jobs
  console.log('💼 Creating jobs...');
  const jobs = await Job.create([
    {
      title: 'Senior Full-Stack Engineer',
      description: 'We are looking for a Senior Full-Stack Engineer to join TechNova Solutions and lead development of our enterprise SaaS platform. You will architect scalable APIs, build rich React frontends, and mentor junior engineers. This is a high-impact role with direct ownership over core product features used by thousands of businesses worldwide.',
      requirements: ['5+ years full-stack experience', 'Proficiency in React and Node.js', 'Experience with cloud infrastructure (AWS/GCP)', 'Strong TypeScript skills', 'Experience with PostgreSQL or MongoDB'],
      responsibilities: ['Architect and implement new features end-to-end', 'Code review and mentor junior engineers', 'Collaborate with design and product teams', 'Own deployments and monitor production systems'],
      skills: ['react', 'node.js', 'typescript', 'postgresql', 'aws', 'docker'],
      tags: ['senior', 'full-stack', 'saas', 'mentorship'],
      department: 'Engineering', location: 'San Francisco, CA', isRemote: true,
      type: 'full-time', experienceLevel: 'senior',
      salary: { min: 150000, max: 200000, currency: 'USD', isVisible: true, period: 'annual' },
      benefits: ['Health, Dental & Vision', '401(k) with 4% match', 'Remote-first', '$2,000 learning budget', 'Unlimited PTO'],
      status: 'active', postedBy: rec1._id,
      company: rec1.company, industry: rec1.industry,
      applicationDeadline: futureDate(30), isFeatured: true,
      applicationCount: 0, views: 142,
    },
    {
      title: 'Machine Learning Engineer',
      description: 'DataBridge Corp is hiring an ML Engineer to build and scale our data intelligence platform. You will design and deploy NLP models for automated data classification, build recommendation engines, and work closely with data scientists to move models from research to production.',
      requirements: ['3+ years ML engineering experience', 'Strong Python skills', 'Experience with PyTorch or TensorFlow', 'Knowledge of MLOps and model deployment', 'Familiarity with Spark or Kafka'],
      responsibilities: ['Design and train ML models for production', 'Build MLOps pipelines (training, evaluation, deployment)', 'Collaborate with data scientists on research-to-prod transition', 'Monitor model performance and data drift'],
      skills: ['python', 'pytorch', 'tensorflow', 'nlp', 'spark', 'sql', 'mlops'],
      tags: ['ml', 'nlp', 'data science', 'python'],
      department: 'Data Science', location: 'New York, NY', isRemote: false,
      type: 'full-time', experienceLevel: 'mid',
      salary: { min: 130000, max: 170000, currency: 'USD', isVisible: true, period: 'annual' },
      benefits: ['Comprehensive health coverage', '401(k)', 'Stock options', 'Flexible hours', '$1,500 conference budget'],
      status: 'active', postedBy: rec2._id,
      company: rec2.company, industry: rec2.industry,
      applicationDeadline: futureDate(21), isFeatured: true,
      applicationCount: 0, views: 98,
    },
    {
      title: 'DevOps & Cloud Infrastructure Engineer',
      description: 'TechNova Solutions is growing fast and we need a DevOps Engineer to help us scale reliably. You will manage our Kubernetes clusters, build CI/CD pipelines, and ensure our infrastructure is secure, cost-optimized, and highly available across multiple AWS regions.',
      requirements: ['4+ years DevOps or SRE experience', 'Expert-level Kubernetes and Terraform', 'Strong AWS knowledge', 'Experience with Prometheus/Grafana', 'Scripting in Python or Bash'],
      responsibilities: ['Manage multi-region Kubernetes infrastructure', 'Build and maintain CI/CD pipelines', 'Implement infrastructure as code with Terraform', 'On-call rotation and incident response'],
      skills: ['kubernetes', 'terraform', 'aws', 'docker', 'ci/cd', 'python', 'bash'],
      tags: ['devops', 'sre', 'cloud', 'infrastructure'],
      department: 'Infrastructure', location: 'Remote', isRemote: true,
      type: 'full-time', experienceLevel: 'senior',
      salary: { min: 140000, max: 180000, currency: 'USD', isVisible: true, period: 'annual' },
      benefits: ['Full remote', 'Health & Dental', '401(k)', 'Home office stipend $1,000', 'Unlimited PTO'],
      status: 'active', postedBy: rec1._id,
      company: rec1.company, industry: rec1.industry,
      applicationDeadline: futureDate(45), isFeatured: false,
      applicationCount: 0, views: 76,
    },
    {
      title: 'Frontend Engineer (React)',
      description: 'Join DataBridge Corp as a Frontend Engineer and help us build beautiful, performant data visualization dashboards used by analysts at top enterprises. You will collaborate closely with our design team to translate Figma mockups into production-ready React components.',
      requirements: ['3+ years React experience', 'Proficiency in TypeScript', 'Experience with data visualization (Recharts, D3)', 'Knowledge of GraphQL', 'Strong CSS/design sensibility'],
      responsibilities: ['Build reusable React component library', 'Implement data visualization dashboards', 'Optimize frontend performance', 'Write unit and integration tests'],
      skills: ['react', 'typescript', 'graphql', 'css', 'jest', 'recharts'],
      tags: ['frontend', 'react', 'data-viz', 'ui'],
      department: 'Engineering', location: 'New York, NY', isRemote: true,
      type: 'full-time', experienceLevel: 'mid',
      salary: { min: 110000, max: 145000, currency: 'USD', isVisible: true, period: 'annual' },
      benefits: ['Health, Dental & Vision', '401(k)', 'Remote-friendly', '$500/month coworking stipend'],
      status: 'active', postedBy: rec2._id,
      company: rec2.company, industry: rec2.industry,
      applicationDeadline: futureDate(14), isFeatured: false,
      applicationCount: 0, views: 54,
    },
    {
      title: 'Junior Data Analyst',
      description: 'TechNova Solutions is looking for a motivated Junior Data Analyst to join our Business Intelligence team. You will work with large datasets, create reports and dashboards, and help the business make data-driven decisions. Great opportunity for growth with mentorship from senior analysts.',
      requirements: ['1-2 years data analysis experience', 'Strong SQL skills', 'Experience with BI tools (Tableau or Power BI)', 'Python or R for data manipulation', 'Excellent communication skills'],
      responsibilities: ['Build and maintain BI dashboards', 'Write complex SQL queries for reporting', 'Present findings to business stakeholders', 'Assist in data quality and governance'],
      skills: ['sql', 'tableau', 'python', 'excel', 'statistics', 'power bi'],
      tags: ['data', 'analytics', 'bi', 'entry-level'],
      department: 'Data & Analytics', location: 'San Francisco, CA', isRemote: false,
      type: 'full-time', experienceLevel: 'entry',
      salary: { min: 70000, max: 90000, currency: 'USD', isVisible: true, period: 'annual' },
      benefits: ['Health insurance', '401(k)', 'Mentorship program', 'Annual bonus'],
      status: 'active', postedBy: rec1._id,
      company: rec1.company, industry: rec1.industry,
      applicationDeadline: futureDate(20), isFeatured: false,
      applicationCount: 0, views: 39,
    },
    {
      title: 'Product Manager — Platform',
      description: 'DataBridge Corp is hiring a Product Manager to own our core data platform product. You will define the roadmap, write detailed specs, work with engineering and design, and launch features that delight enterprise customers. Strong technical background preferred.',
      requirements: ['4+ years product management experience', 'Technical background (engineering or data)', 'Experience with B2B/enterprise SaaS', 'Data-driven mindset', 'Excellent stakeholder communication'],
      responsibilities: ['Define product roadmap and prioritization', 'Write PRDs and user stories', 'Lead sprint planning and cross-team coordination', 'Analyze product metrics and user feedback'],
      skills: ['product management', 'agile', 'sql', 'jira', 'figma', 'analytics'],
      tags: ['product', 'platform', 'b2b', 'saas'],
      department: 'Product', location: 'New York, NY', isRemote: true,
      type: 'full-time', experienceLevel: 'lead',
      salary: { min: 155000, max: 195000, currency: 'USD', isVisible: false, period: 'annual' },
      benefits: ['Equity package', 'Health & Dental', '401(k)', 'Unlimited PTO', 'Executive coaching'],
      status: 'draft', postedBy: rec2._id,
      company: rec2.company, industry: rec2.industry,
      applicationDeadline: futureDate(60), isFeatured: false,
      applicationCount: 0, views: 0,
    },
  ]);
  console.log(`   ✓ ${jobs.length} jobs created\n`);

  // Map applicants and jobs by name/title for readability
  const byEmail = (email) => applicants.find((a) => a.email === email);
  const [job1, job2, job3, job4, job5] = jobs; // skip draft job6

  // Create applications with realistic AI scores
  console.log('📋 Creating applications...');
  const applicationDefs = [
    // Job 1 — Senior Full-Stack Engineer (rec1)
    { job: job1, applicant: byEmail('alex@demo.com'),   score: 88, status: 'interview',  stage: 'interview_scheduled', rating: 5 },
    { job: job1, applicant: byEmail('emily@demo.com'),  score: 74, status: 'screening',  stage: 'reviewed',             rating: 4 },
    { job: job1, applicant: byEmail('lisa@demo.com'),   score: 62, status: 'screening',  stage: 'shortlisted',          rating: 3 },
    { job: job1, applicant: byEmail('david@demo.com'),  score: 51, status: 'applied',    stage: 'new',                  rating: null },

    // Job 2 — ML Engineer (rec2)
    { job: job2, applicant: byEmail('priya@demo.com'),  score: 92, status: 'interview',  stage: 'interview_scheduled', rating: 5 },
    { job: job2, applicant: byEmail('sofia@demo.com'),  score: 55, status: 'screening',  stage: 'reviewed',             rating: 3 },
    { job: job2, applicant: byEmail('alex@demo.com'),   score: 44, status: 'applied',    stage: 'new',                  rating: null },

    // Job 3 — DevOps (rec1)
    { job: job3, applicant: byEmail('marcus@demo.com'), score: 95, status: 'offered',    stage: 'offer_extended',       rating: 5 },
    { job: job3, applicant: byEmail('ryan@demo.com'),   score: 78, status: 'interview',  stage: 'interview_scheduled', rating: 4 },
    { job: job3, applicant: byEmail('david@demo.com'),  score: 40, status: 'rejected',   stage: 'rejected',             rating: 2 },

    // Job 4 — Frontend Engineer (rec2)
    { job: job4, applicant: byEmail('emily@demo.com'),  score: 90, status: 'interview',  stage: 'interview_scheduled', rating: 5 },
    { job: job4, applicant: byEmail('lisa@demo.com'),   score: 82, status: 'screening',  stage: 'shortlisted',          rating: 4 },
    { job: job4, applicant: byEmail('alex@demo.com'),   score: 65, status: 'screening',  stage: 'reviewed',             rating: 3 },

    // Job 5 — Junior Data Analyst (rec1)
    { job: job5, applicant: byEmail('sofia@demo.com'),  score: 83, status: 'interview',  stage: 'interview_scheduled', rating: 4 },
    { job: job5, applicant: byEmail('ryan@demo.com'),   score: 48, status: 'screening',  stage: 'reviewed',             rating: 2 },
    { job: job5, applicant: byEmail('priya@demo.com'),  score: 71, status: 'screening',  stage: 'shortlisted',          rating: 4 },
    { job: job5, applicant: byEmail('marcus@demo.com'), score: 38, status: 'applied',    stage: 'new',                  rating: null },
    { job: job5, applicant: byEmail('lisa@demo.com'),   score: 59, status: 'applied',    stage: 'new',                  rating: 3 },
    { job: job5, applicant: byEmail('emily@demo.com'),  score: 45, status: 'applied',    stage: 'new',                  rating: null },
    { job: job5, applicant: byEmail('david@demo.com'),  score: 30, status: 'rejected',   stage: 'rejected',             rating: 1 },
  ];

  const applications = await Application.create(
    applicationDefs.map(({ job, applicant, score, status, stage, rating }) => ({
      job: job._id,
      applicant: applicant._id,
      status,
      stage,
      rating: rating || undefined,
      aiAnalysis: mockAI(score),
      coverLetter: `I am excited to apply for the ${job.title} position at ${job.company}. My background aligns strongly with your requirements and I look forward to contributing to your team.`,
      statusHistory: [
        { from: null, to: 'applied', changedBy: applicant._id },
        ...(status !== 'applied' ? [{ from: 'applied', to: status, changedBy: job.postedBy }] : []),
      ],
    }))
  );
  console.log(`   ✓ ${applications.length} applications created\n`);

  // Update applicationCount on each job
  await Promise.all(
    jobs.map(async (job) => {
      const count = await Application.countDocuments({ job: job._id });
      await Job.findByIdAndUpdate(job._id, { applicationCount: count });
    })
  );

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════');
  console.log('                  🎉  SEED COMPLETE                    ');
  console.log('═══════════════════════════════════════════════════════');
  console.log('\n📊 Summary:');
  console.log(`   Recruiters  : ${recruiters.length}`);
  console.log(`   Applicants  : ${applicants.length}`);
  console.log(`   Jobs        : ${jobs.length} (${jobs.filter(j=>j.status==='active').length} active, 1 draft)`);
  console.log(`   Applications: ${applications.length}`);
  console.log('\n🔑 Demo Credentials (all use password: Password123!)');
  console.log('   Recruiter 1 : recruiter1@demo.com  (TechNova Solutions)');
  console.log('   Recruiter 2 : recruiter2@demo.com  (DataBridge Corp)');
  console.log('   Applicant   : alex@demo.com        (Top-scored candidate)');
  console.log('   Applicant   : priya@demo.com       (ML specialist, 92 score)');
  console.log('   Applicant   : marcus@demo.com      (DevOps, offered)');
  console.log('\n🌐 Open the app at http://localhost:5173');
  console.log('═══════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err.message);
  console.error(err.stack);
  mongoose.disconnect().finally(() => process.exit(1));
});
