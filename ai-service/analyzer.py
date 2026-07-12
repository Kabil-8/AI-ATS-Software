import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

ANALYSIS_PROMPT = """You are an expert HR analyst and ATS system. Analyze the following resume against the job description and return a detailed, objective assessment.

JOB TITLE: {job_title}

JOB DESCRIPTION:
{job_description}

JOB REQUIREMENTS:
{job_requirements}

REQUIRED SKILLS:
{job_skills}

CANDIDATE RESUME:
{resume_text}

Analyze the resume and return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{{
  "match_score": <integer 0-100 based on overall fit>,
  "skills_matched": [<list of required skills found in resume>],
  "skills_missing": [<list of required skills NOT found in resume>],
  "experience_summary": "<2-3 sentence summary of candidate's relevant experience>",
  "strengths": [<3-5 key strengths relevant to this role>],
  "weaknesses": [<2-3 gaps or concerns>],
  "summary": "<3-4 sentence comprehensive AI-generated candidate summary for recruiters>",
  "suggested_questions": [<3-5 targeted interview questions based on the resume and job requirements>]
}}

Scoring guide:
- 90-100: Exceptional match, meets all requirements, strong relevant experience
- 75-89: Strong match, meets most requirements  
- 60-74: Good match, meets core requirements with some gaps
- 40-59: Partial match, significant skill gaps
- 0-39: Poor match, does not meet key requirements

Be objective, data-driven, and bias-free. Focus on skills and experience, not demographics."""


async def analyze_resume(
    resume_text: str,
    job_title: str,
    job_description: str,
    job_requirements: list[str],
    job_skills: list[str],
) -> dict:
    """
    Use Gemini API to analyze resume against job description.
    Returns structured JSON analysis result.
    """
    if not resume_text or len(resume_text.strip()) < 50:
        return {
            "match_score": 0,
            "skills_matched": [],
            "skills_missing": job_skills,
            "experience_summary": "Resume text could not be extracted.",
            "strengths": [],
            "weaknesses": ["Resume could not be parsed"],
            "summary": "Unable to analyze resume due to extraction failure.",
            "suggested_questions": [],
        }

    # Truncate resume text to avoid token limits (keep ~4000 chars)
    truncated_resume = resume_text[:4000] if len(resume_text) > 4000 else resume_text

    prompt = ANALYSIS_PROMPT.format(
        job_title=job_title,
        job_description=job_description[:2000],
        job_requirements="\n".join(f"- {r}" for r in job_requirements[:20]),
        job_skills=", ".join(job_skills[:30]),
        resume_text=truncated_resume,
    )

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,
                max_output_tokens=1500,
            ),
        )

        raw_text = response.text.strip()

        # Strip markdown code fences if present
        raw_text = re.sub(r"^```(?:json)?\n?", "", raw_text)
        raw_text = re.sub(r"\n?```$", "", raw_text)

        result = json.loads(raw_text)

        # Validate and clamp score
        result["match_score"] = max(0, min(100, int(result.get("match_score", 0))))

        return result

    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid JSON: {e}")
    except Exception as e:
        raise RuntimeError(f"Gemini API error: {str(e)}")
