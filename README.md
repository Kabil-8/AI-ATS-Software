# 🤖 ATS Pro — AI-Powered Applicant Tracking System

> **Built by Zaalima Development** · Confidential

An intelligent, enterprise-grade HR platform that automates the entire recruitment lifecycle — from job posting to AI-ranked candidate shortlisting. Recruiters post jobs, candidates apply with their resumes, and Gemini AI instantly parses, scores, and ranks every applicant.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | JWT-based login/register with role-based access (Recruiter / Applicant) |
| 📋 **Job Management** | Full CRUD — post, edit, archive jobs with rich descriptions, skills & salary |
| 📄 **Resume Upload** | Drag-and-drop PDF/DOCX upload via AWS S3 (or in-memory fallback) |
| 🤖 **AI Resume Parsing** | Gemini AI extracts skills, experience and qualifications from any resume |
| 📊 **Candidate Ranking** | 0–100 semantic match score per candidate against job requirements |
| 🗂️ **Kanban Pipeline** | Drag candidates through Applied → Screening → Interview → Offered → Hired |
| 📬 **Email Notifications** | Automatic status update emails to candidates at every stage |
| 👤 **Bias-Free Design** | Initials-only display in pipeline; skills-first evaluation |

---

## 🏗️ Architecture

```
┌─────────────────────┐     /api proxy      ┌──────────────────────┐
│  Frontend            │ ──────────────────▶ │  Backend              │
│  React 18 + MUI v5   │                     │  Node.js + Express    │
│  Vite · React Query  │                     │  JWT · Multer · S3    │
│  localhost:5173      │                     │  localhost:5000        │
└─────────────────────┘                     └──────────┬───────────┘
                                                        │ HTTP
                                            ┌───────────▼───────────┐
                                            │  AI Microservice       │
                                            │  Python · FastAPI      │
                                            │  pdfplumber · docx     │
                                            │  Google Gemini API     │
                                            │  localhost:8000        │
                                            └───────────────────────┘
                                                        │
                                            ┌───────────▼───────────┐
                                            │  MongoDB               │
                                            │  localhost:27017        │
                                            │  Database: ai-ats      │
                                            └───────────────────────┘
```

---

## 🧰 Tech Stack

### Frontend
- **React 18** + **Vite 5** — fast dev server & optimised builds
- **Material UI v5** — component library with custom design system
- **React Query v5** — server state, caching & background refetching
- **React Router v6** — client-side routing with protected routes
- **@hello-pangea/dnd** — drag-and-drop Kanban board
- **react-dropzone** — resume file upload with drag-and-drop
- **dayjs** — date formatting & relative time
- **react-hot-toast** — toast notifications

### Backend
- **Node.js** + **Express.js** — REST API server
- **MongoDB** + **Mongoose** — document database & ORM
- **JWT** (jsonwebtoken) — access + refresh token auth
- **Multer** + **AWS S3** — resume file upload & storage
- **Nodemailer** — email notifications via SMTP
- **Helmet** + **express-rate-limit** — security hardening
- **express-validator** — request validation

### AI Microservice
- **Python 3.11** + **FastAPI** — async microservice
- **pdfplumber** — PDF text extraction
- **python-docx** — DOCX text extraction
- **Google Gemini API** — LLM for skills extraction & semantic scoring

---

## 📁 Project Structure

```
e:\Project A-Z\AI ATS\
│
├── 📄 .gitignore
├── 📄 docker-compose.yml        ← Run all services with Docker
├── 📄 package.json              ← Root convenience scripts
├── 📄 README.md
│
├── 📂 backend/
│   ├── 📄 .env                  ← Your config (never commit!)
│   ├── 📄 .env.example          ← Template
│   ├── 📄 server.js             ← Express app entry point
│   └── 📂 src/
│       ├── config/              db.js · s3.js
│       ├── models/              User.js · Job.js · Application.js
│       ├── middleware/          auth.js · upload.js · errorHandler.js
│       ├── controllers/         auth · job · application · ai
│       ├── services/            emailService.js · aiService.js
│       └── routes/              auth · jobs · applications · ai
│
├── 📂 ai-service/
│   ├── 📄 .env                  ← Your Gemini API key
│   ├── 📄 main.py               ← FastAPI routes
│   ├── 📄 parser.py             ← PDF/DOCX text extraction
│   ├── 📄 analyzer.py           ← Gemini prompting & scoring
│   └── 📄 requirements.txt
│
└── 📂 frontend/
    ├── 📄 vite.config.js
    └── 📂 src/
        ├── api/                 axios.js (JWT interceptor)
        ├── context/             AuthContext.jsx
        ├── theme/               theme.js (Light + Dark)
        ├── hooks/               useJobs.js · useApplications.js
        ├── components/          Navbar · JobCard · CandidateCard
        │                        KanbanBoard · AIScoreRing · StatusBadge
        │                        ResumeUploader · KPICard · ActivityFeed
        └── pages/               Landing · Login · Register · JobBoard
                                 JobDetail · RecruiterDashboard · PostJob
                                 ApplicationPipeline · CandidateRanking
                                 ApplicantDashboard · ProfilePage
```

---

## ⚙️ Environment Variables

### `backend/.env`

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/ai-ats

# JWT — change these to long random strings in production!
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AWS S3 — optional, uploads work in-memory without this
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=ai-ats-resumes

# Gemini AI (used by Python microservice)
AI_SERVICE_URL=http://localhost:8000
GEMINI_API_KEY=your_gemini_api_key_here

# Email — optional, emails are logged to console without this
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=ATS Pro <noreply@atspro.com>

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### `ai-service/.env`

```env
GEMINI_API_KEY=your_gemini_api_key_here
BACKEND_URL=http://localhost:5000
```

> 💡 **Get a Gemini API key free** at [aistudio.google.com](https://aistudio.google.com)

---

## 🚀 Run Commands (Development)

### Prerequisites
- Node.js >= 18 — [nodejs.org](https://nodejs.org)
- Python >= 3.10 — [python.org](https://python.org)
- MongoDB running locally — [mongodb.com/try/download](https://www.mongodb.com/try/download/community)
- Git

---

### Step 1 — Clone & Install

```bash
# Install backend dependencies
cd "e:\Project A-Z\AI ATS\backend"
npm install

# Install frontend dependencies
cd "e:\Project A-Z\AI ATS\frontend"
npm install

# Set up Python virtual environment
cd "e:\Project A-Z\AI ATS\ai-service"
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac / Linux
pip install -r requirements.txt
```

---

### Step 2 — Configure Environment

```bash
# Copy example env and fill in your values
cd "e:\Project A-Z\AI ATS\backend"
copy .env.example .env
```

**Minimum required values to fill in `.env`:**

| Variable | Where to get it |
|---|---|
| `MONGO_URI` | Keep as-is for local MongoDB |
| `JWT_SECRET` | Any long random string (e.g. 64 chars) |
| `JWT_REFRESH_SECRET` | Any different long random string |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API Key |

Everything else is optional for local development.

---

### Step 3 — Start Services

Open **3 separate terminals** and run one command in each:

#### Terminal 1 — Backend API
```bash
cd "e:\Project A-Z\AI ATS\backend"
npm run dev
```
✅ Expected output:
```
🚀 AI ATS Backend running on http://localhost:5000
📚 Environment: development
✅ MongoDB Connected: localhost
```

#### Terminal 2 — AI Microservice (Python)
```bash
cd "e:\Project A-Z\AI ATS\ai-service"
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```
✅ Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

#### Terminal 3 — Frontend
```bash
cd "e:\Project A-Z\AI ATS\frontend"
npm run dev
```
✅ Expected output:
```
VITE v5.4.21  ready in 471 ms
➜  Local:   http://localhost:5173/
```

---

### 🌐 Open the App

| URL | What it is |
|---|---|
| [http://localhost:5173](http://localhost:5173) | **Main App** (React frontend) |
| [http://localhost:5000/health](http://localhost:5000/health) | Backend health check |
| [http://localhost:8000/docs](http://localhost:8000/docs) | AI Service Swagger UI |

---

## 🐳 Run with Docker (All-in-one)

If you have Docker Desktop installed:

```bash
cd "e:\Project A-Z\AI ATS"

# Build and start all 4 services
docker-compose up --build

# Stop all services
docker-compose down
```

App will be available at **http://localhost** (port 80).

---

## 📖 API Reference

### Auth Endpoints
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create account (recruiter or applicant) | Public |
| POST | `/api/auth/login` | Login and get tokens | Public |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| POST | `/api/auth/logout` | Invalidate refresh token | 🔒 |
| GET | `/api/auth/me` | Get current user | 🔒 |
| PUT | `/api/auth/profile` | Update profile | 🔒 |
| PUT | `/api/auth/password` | Change password | 🔒 |

### Jobs Endpoints
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/jobs` | List all active jobs (with filters) | Public |
| GET | `/api/jobs/:id` | Get single job | Public |
| POST | `/api/jobs` | Create job | 🔒 Recruiter |
| PUT | `/api/jobs/:id` | Update job | 🔒 Recruiter |
| DELETE | `/api/jobs/:id` | Archive job | 🔒 Recruiter |
| GET | `/api/jobs/recruiter/my-jobs` | Recruiter's own jobs | 🔒 Recruiter |
| GET | `/api/jobs/recruiter/stats` | Dashboard KPIs | 🔒 Recruiter |

### Applications Endpoints
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/applications` | Submit application + resume | 🔒 Applicant |
| GET | `/api/applications/my` | My applications | 🔒 Applicant |
| GET | `/api/applications/job/:jobId` | All apps for a job | 🔒 Recruiter |
| PATCH | `/api/applications/:id/status` | Update pipeline stage | 🔒 Recruiter |
| POST | `/api/applications/:id/notes` | Add recruiter note | 🔒 Recruiter |

### AI Endpoints
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/ai/analyze/:applicationId` | Trigger AI analysis | 🔒 Recruiter |
| POST | `/api/ai/analyze-batch/:jobId` | Analyze all pending | 🔒 Recruiter |

---

## 🤖 How AI Ranking Works

```
1. Candidate submits resume (PDF/DOCX)
2. Backend stores file → triggers AI service (async)
3. Python service:
   a. Extracts raw text from PDF/DOCX
   b. Sends text + job description to Gemini AI
   c. Gemini returns:
      - matchScore (0–100)
      - skillsMatched []
      - skillsMissing []
      - summary (2-3 sentences)
      - suggestedInterviewQuestions []
4. Score saved to Application document in MongoDB
5. Recruiter sees ranked list, expandable AI insights
```

---

## 🔐 Security Notes

- JWT access tokens expire in **15 minutes** — refresh tokens in **7 days**
- Passwords hashed with **bcryptjs** (salt rounds: 12)
- Rate limiting: **200 requests / 15 min** per IP
- Resume URLs are **S3 pre-signed** (expire after 1 hour)
- Helmet sets secure HTTP headers
- CORS locked to `CLIENT_URL` only
- Never commit `.env` files — they are in `.gitignore`

---

## 🛠️ Common Issues & Fixes

| Issue | Fix |
|---|---|
| `MongooseServerSelectionError` | Make sure MongoDB is running: `mongod` |
| `Cannot find module '...'` | Run `npm install` in the `backend/` folder |
| AI analysis not triggering | Start the Python service on port 8000 |
| Resume upload fails | Check AWS credentials or remove S3 keys to use memory storage |
| CORS errors in browser | Ensure `CLIENT_URL` in `.env` matches your frontend URL |
| `ModuleNotFoundError` in Python | Run `pip install -r requirements.txt` inside the virtual env |

---

## 📜 License

**Zaalima Development — Confidential**
All rights reserved. Not for public distribution.
