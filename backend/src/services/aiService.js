const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Calls the Python AI microservice to analyze a resume against a job description.
 * @param {Object} params - { resumeKey, resumeUrl, jobTitle, jobDescription, jobRequirements, jobSkills }
 * @returns {Object} AI analysis result
 */
exports.analyzeResume = async ({ resumeKey, resumeUrl, jobTitle, jobDescription, jobRequirements, jobSkills }) => {
  const response = await axios.post(
    `${AI_SERVICE_URL}/analyze`,
    {
      resume_key: resumeKey,
      resume_url: resumeUrl,
      job_title: jobTitle,
      job_description: jobDescription,
      job_requirements: jobRequirements || [],
      job_skills: jobSkills || [],
    },
    { timeout: 120000 } // 2 min timeout
  );

  if (!response.data.success) {
    throw new Error(response.data.error || 'AI analysis failed');
  }

  const raw = response.data.result;
  return {
    matchScore: raw.overallScore, // Legacy mapping
    overallScore: raw.overallScore,
    technicalScore: raw.technicalScore,
    semanticScore: raw.semanticScore,
    experienceScore: raw.experienceScore,
    educationScore: raw.educationScore,
    projectScore: raw.projectScore,
    certificationScore: raw.certificationScore,
    resumeQuality: raw.resumeQuality,
    softSkillScore: raw.softSkillScore,
    portfolioScore: raw.portfolioScore,
    
    recommendation: raw.recommendation,
    hiringRecommendation: raw.hiringRecommendation,
    interviewProbability: raw.interviewProbability,
    explanation: raw.explanation,

    skillsMatched: raw.matchedSkills || [],
    skillsMissing: raw.missingSkills || [],
    strengths: raw.strengths || [],
    weaknesses: raw.weaknesses || [],
    
    resumeSuggestions: raw.resumeSuggestions || [],
    projectRelevance: raw.projectRelevance || [],
    
    experienceSummary: raw.explanation || '',
    summary: raw.explanation || '',
    suggestedQuestions: [],
  };
};
