import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_parse_resume():
    response = client.post("/parse-resume", json={
        "raw_text": "John Doe\nEmail: john@gmail.com\nSkills: React, Node.js, Python\nExperience: 5 years software engineer"
    })
    assert response.status_code == 200
    data = response.json()
    assert "skills" in data
    assert "React" in data["skills"]["technical"] or "react" in [s.lower() for s in data["skills"]["technical"]]

def test_match_job():
    response = client.post("/match-job", json={
        "resume_text": "Experienced React and Node.js developer with AWS and Docker skills.",
        "job_title": "Full Stack Developer",
        "job_description": "Looking for React, Node.js, AWS expert.",
        "required_skills": ["React", "Node.js", "AWS"]
    })
    assert response.status_code == 200
    data = response.json()
    assert "overallScore" in data
    assert data["overallScore"] >= 0
