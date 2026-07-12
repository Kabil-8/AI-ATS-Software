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
    matchScore: raw.match_score,
    skillsMatched: raw.skills_matched || [],
    skillsMissing: raw.skills_missing || [],
    experienceSummary: raw.experience_summary || '',
    strengths: raw.strengths || [],
    weaknesses: raw.weaknesses || [],
    summary: raw.summary || '',
    suggestedQuestions: raw.suggested_questions || [],
  };
};
