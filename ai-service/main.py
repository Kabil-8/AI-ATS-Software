import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from parser import fetch_and_extract
from analyzer import analyze_resume

load_dotenv()

app = FastAPI(title="AI ATS Microservice", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", os.getenv("BACKEND_URL", "")],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    resume_key: Optional[str] = None
    resume_url: Optional[str] = None
    resume_text: Optional[str] = None  # Direct text input fallback
    job_title: str
    job_description: str
    job_requirements: list[str] = []
    job_skills: list[str] = []


class AnalyzeResponse(BaseModel):
    success: bool
    result: Optional[dict] = None
    error: Optional[str] = None


@app.get("/health")
async def health():
    return {"status": "ok", "service": "AI ATS Microservice", "version": "1.0.0"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    try:
        # Step 1: Extract resume text
        resume_text = request.resume_text or ""

        if not resume_text and request.resume_url:
            resume_text = await fetch_and_extract(request.resume_url, request.resume_key)

        if not resume_text:
            raise HTTPException(status_code=400, detail="No resume content provided. Supply resume_url or resume_text.")

        # Step 2: AI analysis
        result = await analyze_resume(
            resume_text=resume_text,
            job_title=request.job_title,
            job_description=request.job_description,
            job_requirements=request.job_requirements,
            job_skills=request.job_skills,
        )

        return AnalyzeResponse(success=True, result=result)

    except HTTPException:
        raise
    except Exception as e:
        return AnalyzeResponse(success=False, error=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
