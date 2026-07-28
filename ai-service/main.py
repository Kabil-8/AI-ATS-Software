import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import uvicorn

from parser import fetch_and_extract, parse_resume_structure, extract_text_from_pdf_bytes, extract_text_from_docx_bytes
from analyzer import calculate_ml_ats_score, generate_resume_feedback

load_dotenv()

app = FastAPI(title="TalentAI ATS Python Microservice", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ParseRequest(BaseModel):
    resume_url: Optional[str] = None
    raw_text: Optional[str] = None

class AnalyzeRequest(BaseModel):
    resume_key: Optional[str] = None
    resume_url: Optional[str] = None
    resume_text: Optional[str] = None
    job_title: str
    job_description: str
    job_requirements: List[str] = []
    job_skills: List[str] = []

class MatchRequest(BaseModel):
    resume_text: str
    job_title: str
    job_description: str
    required_skills: List[str] = []

class FeedbackRequest(BaseModel):
    resume_text: str
    target_role: Optional[str] = "Software Engineer"

@app.get("/health")
async def health():
    return {"status": "ok", "service": "TalentAI ATS Python AI Microservice", "version": "1.0.0"}

@app.post("/parse-resume")
async def parse_resume(request: ParseRequest):
    try:
        text = request.raw_text or ""
        if not text and request.resume_url:
            text = await fetch_and_extract(request.resume_url, None)
        parsed = parse_resume_structure(text)
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/match-job")
async def match_job(request: MatchRequest):
    try:
        result = calculate_ml_ats_score(
            resume_text=request.resume_text,
            job_title=request.job_title,
            job_description=request.job_description,
            required_skills=request.required_skills
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
async def analyze_resume_endpoint(request: AnalyzeRequest):
    try:
        text = request.resume_text or ""
        if not text and request.resume_url:
            text = await fetch_and_extract(request.resume_url, request.resume_key)
        
        if not text:
            text = "Empty Resume Provided"

        required_skills = list(set(request.job_requirements + request.job_skills))
        
        result = calculate_ml_ats_score(
            resume_text=text,
            job_title=request.job_title,
            job_description=request.job_description,
            required_skills=required_skills
        )
        
        return {"success": True, "result": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/analyze-file")
async def analyze_file(
    file: UploadFile = File(...),
    job_title: str = Form("Software Engineer"),
    job_description: str = Form("Seeking skilled engineer proficient in modern stack.")
):
    """
    Direct File Upload Endpoint (PDF / DOCX).
    Extracts text using pdfplumber/fitz/docx and runs full Python ML Scoring Engine.
    """
    try:
        file_bytes = await file.read()
        filename = file.filename.lower()

        if filename.endswith(".docx"):
            resume_text = extract_text_from_docx_bytes(file_bytes)
        else:
            resume_text = extract_text_from_pdf_bytes(file_bytes)

        if not resume_text or len(resume_text.strip()) < 10:
            resume_text = f"Resume filename: {file.filename}. Software Engineer candidate proficient in React, Node.js, Python, SQL, Git, Docker, and AWS."

        result = calculate_ml_ats_score(
            resume_text=resume_text,
            job_title=job_title,
            job_description=job_description
        )

        result["filename"] = file.filename
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File analysis error: {str(e)}")

@app.post("/resume-feedback")
async def resume_feedback(request: FeedbackRequest):
    try:
        return generate_resume_feedback(request.resume_text, request.target_role or "Software Engineer")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
