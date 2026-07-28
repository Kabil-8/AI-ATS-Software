import os
import re
import io
import httpx
import pdfplumber
import fitz  # PyMuPDF
from docx import Document

def clean_text(text: str) -> str:
    """Clean extracted text for NLP & ML processing."""
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)
    text = re.sub(r'[^\x20-\x7E\n]', ' ', text)
    return text.strip()

def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    """Extract text from PDF using pdfplumber with PyMuPDF fallback."""
    text = ""
    # Try pdfplumber
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception:
        pass

    # If pdfplumber returned minimal text, fallback to PyMuPDF (fitz)
    if len(text.strip()) < 50:
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text() + "\n"
        except Exception as e:
            raise ValueError(f"Failed to parse PDF bytes: {str(e)}")

    return clean_text(text)

def extract_text_from_docx_bytes(file_bytes: bytes) -> str:
    """Extract text from DOCX byte content."""
    try:
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        return clean_text("\n".join(paragraphs))
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX bytes: {str(e)}")

def parse_resume_structure(text: str) -> dict:
    """Extract structured fields from resume text using regex & NLP heuristics."""
    text_lower = text.lower()
    
    # 150+ Technical Vocabulary List
    tech_vocab = [
        'react', 'react.js', 'vue', 'angular', 'javascript', 'typescript', 'node.js', 'node', 'express',
        'python', 'django', 'fastapi', 'flask', 'java', 'spring', 'spring boot', 'c++', 'c#', '.net', 'golang', 'go',
        'rust', 'ruby', 'rails', 'php', 'laravel', 'html', 'css', 'tailwind', 'material ui', 'mui', 'redux', 'sql',
        'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'docker', 'kubernetes', 'k8s',
        'aws', 'gcp', 'azure', 'git', 'github', 'ci/cd', 'jenkins', 'terraform', 'rest api', 'graphql', 'kafka',
        'spark', 'hadoop', 'machine learning', 'deep learning', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch',
        'microservices', 'system design'
    ]
    soft_vocab = [
        'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
        'project management', 'agile', 'scrum', 'time management', 'adaptability', 'mentorship', 'collaboration', 'ownership'
    ]
    
    extracted_tech = [skill for skill in tech_vocab if re.search(r'\b' + re.escape(skill) + r'\b', text_lower)]
    extracted_soft = [skill for skill in soft_vocab if re.search(r'\b' + re.escape(skill) + r'\b', text_lower)]
    
    # Contact Details
    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    phone_match = re.search(r'\(?\+?\d{1,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}', text)
    linkedin_match = re.search(r'(linkedin\.com/in/[a-zA-Z0-9_-]+)', text_lower)
    github_match = re.search(r'(github\.com/[a-zA-Z0-9_-]+)', text_lower)
    portfolio_match = re.search(r'\b(?:portfolio|personal website)\b.*?(https?://[^\s]+)', text_lower)
    
    # Years of Experience Calculation
    year_matches = re.findall(r'\b(20[0-2][0-9]|19[8-9][0-9])\b', text)
    experience_years = 0
    if year_matches:
        years = [int(y) for y in year_matches]
        if len(years) >= 2:
            experience_years = max(1, min(25, max(years) - min(years)))
    if experience_years == 0 and ('experience' in text_lower or 'employment' in text_lower):
        experience_years = 1 

    # Education Detection
    has_degree = any(deg in text_lower for deg in ['bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'degree', 'university', 'b.s', 'm.s', 'b.e'])
    education = []
    if 'bachelor' in text_lower or 'b.s' in text_lower or 'b.tech' in text_lower or 'b.e' in text_lower:
        education.append({'degree': "Bachelor's Degree", 'field': 'Computer Science / Engineering'})
    if 'master' in text_lower or 'm.s' in text_lower or 'm.tech' in text_lower or 'mba' in text_lower:
        education.append({'degree': "Master's Degree", 'field': 'Computer Science / Management'})
    if not education:
        education.append({'degree': "Bachelor's Degree" if has_degree else "Diploma / Certification", 'field': 'Relevant Field'})

    # Project and Open Source indicators
    has_projects = bool(re.search(r'\b(projects|personal projects|academic projects)\b', text_lower))
    has_open_source = bool(re.search(r'\b(open source|contributions|pull requests?)\b', text_lower))
    has_hackathons = bool(re.search(r'\b(hackathon|hackathons)\b', text_lower))
    has_publications = bool(re.search(r'\b(research|publication|paper|published)\b', text_lower))
    has_certifications = bool(re.search(r'\b(certification|certifications|certificate|certified)\b', text_lower))
    
    # Quantified achievements (e.g. "increased by 20%", "reduced 50ms")
    has_metrics = bool(re.search(r'\b(increased|reduced|improved|decreased|saved|achieved).*?(\d+%|\$\d+|\d+x|\d+ms)\b', text_lower))
    
    grammar_errors_proxy = False # simplified proxy for grammar penalty
    keyword_stuffing_proxy = len(extracted_tech) > 40 # too many skills might be stuffing

    return {
        "email": email_match.group(0) if email_match else "",
        "phone": phone_match.group(0) if phone_match else "",
        "linkedin": linkedin_match.group(0) if linkedin_match else "",
        "github": github_match.group(0) if github_match else "",
        "portfolio": portfolio_match.group(1) if portfolio_match else "",
        "skills": {
            "technical": list(set([s.title() for s in extracted_tech])),
            "soft": list(set([s.title() for s in extracted_soft]))
        },
        "education": education,
        "has_degree": has_degree,
        "experience_years": experience_years,
        "has_projects": has_projects,
        "has_open_source": has_open_source,
        "has_hackathons": has_hackathons,
        "has_publications": has_publications,
        "has_certifications": has_certifications,
        "has_metrics": has_metrics,
        "grammar_errors_proxy": grammar_errors_proxy,
        "keyword_stuffing_proxy": keyword_stuffing_proxy,
        "text_length": len(text),
        "summary": f"Candidate with {experience_years}+ years experience skilled in {', '.join([s.title() for s in extracted_tech[:5]])}."
    }

def parse_job_description(title: str, text: str) -> dict:
    """Extract structured info from JD."""
    text_lower = (title + " " + text).lower()
    
    tech_vocab = [
        'react', 'react.js', 'vue', 'angular', 'javascript', 'typescript', 'node.js', 'node', 'express',
        'python', 'django', 'fastapi', 'flask', 'java', 'spring', 'spring boot', 'c++', 'c#', '.net', 'golang', 'go',
        'rust', 'ruby', 'rails', 'php', 'laravel', 'html', 'css', 'tailwind', 'material ui', 'mui', 'redux', 'sql',
        'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'docker', 'kubernetes', 'k8s',
        'aws', 'gcp', 'azure', 'git', 'github', 'ci/cd', 'jenkins', 'terraform', 'rest api', 'graphql', 'kafka',
        'spark', 'hadoop', 'machine learning', 'deep learning', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch',
        'microservices', 'system design'
    ]
    soft_vocab = [
        'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
        'project management', 'agile', 'scrum', 'time management', 'adaptability', 'mentorship', 'collaboration', 'ownership'
    ]
    
    extracted_tech = [skill for skill in tech_vocab if re.search(r'\b' + re.escape(skill) + r'\b', text_lower)]
    extracted_soft = [skill for skill in soft_vocab if re.search(r'\b' + re.escape(skill) + r'\b', text_lower)]
    
    # Try to find experience requirements (e.g., "3+ years", "2-4 years")
    exp_matches = re.findall(r'(\d+)(?:\s*-\s*\d+)?\s*\+?\s*(?:years?|yrs?)(?:\s*of)?\s*experience', text_lower)
    required_years = 0
    if exp_matches:
        required_years = max([int(m) for m in exp_matches])
    
    return {
        "title": title,
        "skills": {
            "technical": list(set([s.title() for s in extracted_tech])),
            "soft": list(set([s.title() for s in extracted_soft]))
        },
        "required_experience_years": required_years,
    }

async def fetch_and_extract(resume_url: str | None, resume_key: str | None) -> str:
    if not resume_url:
        return ""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(resume_url)
        response.raise_for_status()

    file_bytes = response.content
    if resume_url.lower().endswith('.docx'):
        return extract_text_from_docx_bytes(file_bytes)
    return extract_text_from_pdf_bytes(file_bytes)
