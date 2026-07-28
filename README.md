# TalentAI ATS - Enterprise AI-Powered Applicant Tracking System

**Tagline**: *AI-Powered Recruitment Intelligence Platform*

TalentAI ATS is an enterprise-ready, scalable, and modular Applicant Tracking System (ATS) engineered to automate recruitment workflows, rank candidates objectively, and reduce recruiter workload by over 80%.

---

## 🚀 How to Run the Project

### Option 1: Run with Docker Compose (Recommended)

Run the entire stack (MongoDB, Node.js Backend, Python AI Microservice, and React Frontend) with a single command:

```bash
docker-compose up --build
```

Access Points:
- 🌐 **Frontend App**: [http://localhost:5173](http://localhost:5173)
- ⚙️ **Backend REST API**: [http://localhost:5000](http://localhost:5000)
- 🤖 **Python AI Microservice**: [http://localhost:8000](http://localhost:8000)

---

### Option 2: Run Services Locally

#### 1. Setup & Start Backend (Node.js & Express)
```bash
cd backend
npm install
npm run dev
```
- Backend runs on `http://localhost:5000`

#### 2. Setup & Start AI Microservice (Python FastAPI)
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```
- AI service runs on `http://localhost:8000`

#### 3. Setup & Start Frontend (React 19 & Vite)
```bash
cd frontend
npm install
npm run dev
```
- Frontend runs on `http://localhost:5173`

---

## 🧪 Running Automated Test Suites

### Backend Unit & Integration Tests (Jest)
```bash
cd backend
npm test
```

### Python AI Microservice Tests (Pytest)
```bash
cd ai-service
pytest
```

### Build Production Assets
```bash
cd frontend
npm run build
```

---

## 🌟 Architecture & Features

### 1. Security & Access Control
- **5 User Roles**: `Super Admin`, `Company Admin`, `Recruiter`, `Interviewer`, `Candidate`.
- **2FA & Audit Trail**: TOTP QR code setup, refresh token rotation, rate limiting, Helmet, and activity logs.

### 2. Candidate Ranking & AI Pipeline
- **Multi-Factor Candidate Ranking Formula**:
  $$\text{Score} = 0.30 \times \text{SkillMatch} + 0.20 \times \text{Experience} + 0.10 \times \text{Education} + 0.10 \times \text{Projects} + 0.20 \times \text{SemanticSimilarity} + 0.10 \times \text{ATSScore}$$
- Structured resume parsing (PDF, DOCX), skill extraction, strength/weakness analysis, ATS feedback, and fake/duplicate resume detection heuristics.

### 3. Hiring Pipeline & Scheduling
- **9-Stage Kanban Drag-and-Drop Board**: Applied -> Screening -> Assessment -> Interview -> Technical Round -> HR Round -> Offered -> Accepted -> Rejected.
- **Interview Scheduling**: Meeting link generation (Google Meet, Zoom, Teams) and interviewer evaluation feedback.
