import os
import re
import math
from typing import List, Dict
from sentence_transformers import SentenceTransformer, util
from parser import parse_resume_structure, parse_job_description

# Load model globally to avoid reloading on every request
# all-MiniLM-L6-v2 is fast and effective for semantic similarity
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
except Exception:
    model = None

def compute_semantic_similarity(text1: str, text2: str) -> float:
    """Calculate Semantic Similarity using Sentence Transformers."""
    if not model or not text1.strip() or not text2.strip():
        # Fallback if model fails to load
        return 0.5
    try:
        embeddings1 = model.encode(text1, convert_to_tensor=True)
        embeddings2 = model.encode(text2, convert_to_tensor=True)
        cosine_score = util.cos_sim(embeddings1, embeddings2).item()
        return float(cosine_score)
    except Exception:
        return 0.5

def calculate_ml_ats_score(
    resume_text: str,
    job_title: str,
    job_description: str,
    required_skills: List[str] = None
) -> Dict:
    """
    Enterprise ATS Resume Scoring Engine.
    Evaluates candidates using multiple weighted dimensions, penalties, and bonuses.
    """
    # Step 1 & 2: Parse
    resume_data = parse_resume_structure(resume_text)
    jd_data = parse_job_description(job_title, job_description)
    
    # JD info
    jd_tech_skills = jd_data["skills"]["technical"] if not required_skills else required_skills
    jd_tech_lower = [s.lower() for s in jd_tech_skills]
    jd_soft_skills = jd_data["skills"]["soft"]
    jd_exp_req = jd_data["required_experience_years"]

    # Resume info
    resume_tech_skills = resume_data["skills"]["technical"]
    resume_tech_lower = [s.lower() for s in resume_tech_skills]
    resume_soft_skills = resume_data["skills"]["soft"]
    
    # Step 3 & 4: Calculate Individual Scores
    
    # 1. Semantic Match (30%)
    raw_cosine = compute_semantic_similarity(resume_text, job_title + " " + job_description)
    # Map raw_cosine [-1, 1] to [0, 100], usually raw_cosine > 0 for related text
    semantic_score = min(100, max(0, int((raw_cosine * 100))))
    # Boost if it's very low because general text might have lower cosine, let's say 40 is a baseline
    if semantic_score < 40 and raw_cosine > 0:
        semantic_score = min(100, semantic_score + 40)
    
    # 2. Technical Skills (20%)
    matched_tech = [s for s in resume_tech_lower if s in jd_tech_lower]
    missing_tech = [s for s in jd_tech_lower if s not in resume_tech_lower]
    tech_ratio = len(matched_tech) / max(1, len(jd_tech_lower))
    technical_score = int(tech_ratio * 100) if jd_tech_lower else (min(100, len(resume_tech_skills) * 10))
    
    # 3. Experience Match (15%)
    res_exp = resume_data["experience_years"]
    if jd_exp_req > 0:
        if res_exp >= jd_exp_req:
            experience_score = 100
        else:
            experience_score = int((res_exp / jd_exp_req) * 100)
    else:
        experience_score = min(100, int(res_exp * 20 + 20))
    
    # 4. Education (10%)
    education_score = 100 if resume_data["has_degree"] else 60

    # 5. Project Relevance (10%)
    project_score = 100 if resume_data["has_projects"] else 40
    
    # 6. Certification Score (5%)
    certification_score = 100 if resume_data["has_certifications"] else 0
    
    # 7. Resume Quality (5%)
    quality_score = 100
    if resume_data["grammar_errors_proxy"]: quality_score -= 20
    if resume_data["text_length"] < 500: quality_score -= 30
    if not resume_data["email"] and not resume_data["phone"]: quality_score -= 40
    quality_score = max(0, quality_score)
    
    # 8. Soft Skills (3%)
    matched_soft = [s for s in resume_soft_skills if s.lower() in [j.lower() for j in jd_soft_skills]]
    soft_ratio = len(matched_soft) / max(1, len(jd_soft_skills)) if jd_soft_skills else (1 if resume_soft_skills else 0.5)
    soft_skill_score = int(soft_ratio * 100)

    # 9. Portfolio Presence (2%)
    portfolio_items = [resume_data["github"], resume_data["linkedin"], resume_data["portfolio"]]
    portfolio_count = sum([1 for item in portfolio_items if item])
    portfolio_score = min(100, portfolio_count * 50)
    
    # Step 5: Penalty Engine (Deductions from raw final score)
    penalties = 0
    if res_exp == 0: penalties += 10
    if not resume_data["has_projects"]: penalties += 5
    if len(missing_tech) > len(jd_tech_lower) * 0.5 and jd_tech_lower: penalties += 10
    if resume_data["text_length"] < 500: penalties += 10
    if resume_data["keyword_stuffing_proxy"]: penalties += 15
    if not resume_data["email"] and not resume_data["phone"]: penalties += 10
    
    # Step 6: Bonus Engine
    bonuses = 0
    if resume_data["has_open_source"]: bonuses += 5
    if resume_data["has_hackathons"]: bonuses += 5
    if resume_data["has_publications"]: bonuses += 5
    if resume_data["has_metrics"]: bonuses += 5
    if "docker" in resume_tech_lower or "kubernetes" in resume_tech_lower: bonuses += 3
    if "ci/cd" in resume_tech_lower: bonuses += 3
    if portfolio_count == 3: bonuses += 5

    # Step 7: Calculate Final Score
    raw_final_score = (
        (semantic_score * 0.30) +
        (technical_score * 0.20) +
        (experience_score * 0.15) +
        (education_score * 0.10) +
        (project_score * 0.10) +
        (certification_score * 0.05) +
        (quality_score * 0.05) +
        (soft_skill_score * 0.03) +
        (portfolio_score * 0.02)
    )
    
    overall_score = int(round(raw_final_score))
    overall_score -= penalties
    overall_score += bonuses
    overall_score = max(0, min(100, overall_score))

    # Recommendations & Grades
    if overall_score >= 85:
        recommendation = "Highly Recommended"
        hiring_recommendation = "Strong Hire"
        interview_probability = "90%"
    elif overall_score >= 70:
        recommendation = "Recommended"
        hiring_recommendation = "Hire"
        interview_probability = "75%"
    elif overall_score >= 50:
        recommendation = "Needs Review"
        hiring_recommendation = "Possible Hire"
        interview_probability = "40%"
    else:
        recommendation = "Not Recommended"
        hiring_recommendation = "No Hire"
        interview_probability = "10%"

    strengths = []
    if technical_score >= 80: strengths.append("Strong technical skill alignment.")
    if semantic_score >= 80: strengths.append("High semantic match with job description context.")
    if experience_score == 100: strengths.append("Meets or exceeds experience requirements.")
    if portfolio_score >= 50: strengths.append("Good portfolio/social presence.")
    
    weaknesses = []
    if missing_tech: weaknesses.append(f"Missing key skills: {', '.join(missing_tech[:3])}.")
    if experience_score < 50: weaknesses.append("Falls short of experience requirements.")
    if quality_score < 80: weaknesses.append("Resume formatting or length could be improved.")
    if not resume_data["has_projects"]: weaknesses.append("No explicit projects section found.")
    
    resume_suggestions = []
    if not resume_data["has_metrics"]: resume_suggestions.append("Add measurable achievements (e.g., 'Reduced API latency by 35%').")
    if missing_tech: resume_suggestions.append(f"Consider adding experience with {', '.join(missing_tech[:3])} if applicable.")
    if not portfolio_score: resume_suggestions.append("Add GitHub repository or Portfolio links.")

    # Step 8: Return Detailed ATS Report
    return {
        "overallScore": overall_score,
        "recommendation": recommendation,
        "technicalScore": technical_score,
        "semanticScore": semantic_score,
        "experienceScore": experience_score,
        "educationScore": education_score,
        "projectScore": project_score,
        "certificationScore": certification_score,
        "resumeQuality": quality_score,
        "softSkillScore": soft_skill_score,
        "portfolioScore": portfolio_score,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "missingSkills": [s.title() for s in missing_tech],
        "matchedSkills": [s.title() for s in matched_tech],
        "projectRelevance": ["Projects closely align with JD"] if project_score >= 80 else ["Consider tailoring projects more closely to JD"],
        "resumeSuggestions": resume_suggestions,
        "interviewProbability": interview_probability,
        "hiringRecommendation": hiring_recommendation,
        "explanation": f"**Overall Match:** {overall_score}/100\n* **Top Strengths:** {', '.join(strengths[:2]) if strengths else 'N/A'}\n* **Key Gaps:** {', '.join(weaknesses[:2]) if weaknesses else 'N/A'}\n* **Recommendation:** {hiring_recommendation}."
    }

def generate_resume_feedback(resume_text: str, target_role: str) -> Dict:
    # Just wrap around calculate_ml_ats_score with generic target
    result = calculate_ml_ats_score(resume_text, target_role, "Looking for a candidate with strong background.")
    return {
        "overall_score": result["overallScore"],
        "ats_compatibility": result["resumeQuality"],
        "formatting_score": result["resumeQuality"],
        "improvements": result["resumeSuggestions"],
        "strength_areas": result["strengths"],
        "weakness_areas": result["weaknesses"]
    }
