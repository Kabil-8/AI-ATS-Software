const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const Application = require('./src/models/Application');
const Job = require('./src/models/Job');
const User = require('./src/models/User');
const Company = require('./src/models/Company');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/talentai_ats', {
});

const seedDatabase = async () => {
  try {
    console.log('Clearing existing data...');
    await Application.deleteMany();
    await Job.deleteMany();
    await User.deleteMany();
    await Company.deleteMany();

    console.log('Seeding mock company...');
    const company = await Company.create({
      name: 'TechFlow Solutions',
      website: 'https://techflow.example.com',
      industry: 'Software',
      size: '51-200',
      description: 'A leading tech company',
    });

    console.log('Seeding mock users...');
    const recruiter = await User.create({
      name: 'Sarah Recruiter',
      email: 'sarah@techflow.com',
      password: 'password123',
      role: 'recruiter',
      company: company._id,
    });

    const applicant = await User.create({
      name: 'Kabil Applicant',
      email: 'kabil@example.com',
      password: 'password123',
      role: 'candidate',
      linkedIn: 'https://linkedin.com/in/kabil',
      github: 'https://github.com/kabil',
      portfolio: 'https://kabil.dev',
    });

    console.log('Seeding mock job...');
    const job = await Job.create({
      title: 'Senior Full Stack Engineer',
      department: 'Engineering',
      location: 'Remote, US',
      type: 'full-time',
      experienceLevel: 'senior',
      salaryRange: { min: 140000, max: 180000, currency: 'USD' },
      description: 'Seeking an experienced Senior Full Stack Engineer proficient in React, Node.js, TypeScript, Python, Docker, and Cloud AWS infrastructure.',
      requirements: '5+ years experience in Full Stack Development.',
      requiredSkills: ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'TypeScript'],
      status: 'active',
      company: company._id,
      recruiter: recruiter._id,
    });

    console.log('Seeding mock application with 9-dimensional AI scores...');
    const application = await Application.create({
      job: job._id,
      applicant: applicant._id,
      company: company._id,
      recruiter: recruiter._id,
      resumeFileName: 'Kabil_Resume.pdf',
      status: 'screening',
      aiScore: 96,
      aiSummary: '**Overall Match:** 96/100\n* **Top Strengths:** Excellent technical alignment and semantic similarity to the Job Description.',
      scoreBreakdown: {
        technicalScore: 95,
        semanticScore: 98,
        experienceScore: 90,
        educationScore: 90,
        projectScore: 85,
        certificationScore: 80,
        resumeQuality: 92,
        softSkillScore: 88,
        portfolioScore: 100,
        locationMatch: 100,
      },
      aiAnalysis: {
        skillsMatched: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
        skillsMissing: ['TypeScript'],
        strengths: ['Highly relevant modern tech stack', 'Great portfolio links'],
        weaknesses: ['Missing TypeScript'],
        resumeSuggestions: ['Add TypeScript experience if any'],
        projectRelevance: ['Strong relevance in full stack architecture'],
        hiringRecommendation: 'Strong Hire',
        recommendation: 'Highly Recommended',
        interviewProbability: '95%',
        explanation: 'Candidate shows exceptional alignment with the core requirements.',
        isAnalyzed: true,
        analyzedAt: new Date(),
      },
      appliedDate: new Date(),
    });

    console.log('Database successfully seeded with realistic 9-dimensional AI Application data!');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
