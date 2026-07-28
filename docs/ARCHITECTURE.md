# TalentAI ATS - Enterprise System Architecture

## Overview
TalentAI ATS is designed following Clean Architecture and SOLID principles. It comprises a decoupled microservices architecture designed to scale seamlessly to millions of candidates and recruiters.

```
                              +---------------------------------------+
                              |            React 19 Frontend          |
                              | (Vite + MUI + Recharts + Framer Motion) |
                              +-------------------+-------------------+
                                                  |
                                       REST API / WebSockets
                                                  |
                                                  v
                              +-------------------+-------------------+
                              |         Express Node.js Backend       |
                              |   (JWT Auth, RBAC, Audit Logging)     |
                              +---------+-------------------+---------+
                                        |                   |
                 MongoDB Atlas / Mongoose                   | HTTP POST / Fast AI Requests
                                        v                   v
                              +---------+-------+   +-------+---------+
                              |  MongoDB Database|   | Python FastAPI   |
                              |  (Users, Jobs,  |   | AI Microservice |
                              |   Applications) |   | (SpaCy, Sentence|
                              +-----------------+   |  Transformers)  |
                                                    +-----------------+
```

## Microservices Breakdown

### 1. Frontend Web Client (`frontend/`)
- Built with React 19, Vite, Material-UI (MUI), Framer Motion, and Recharts.
- Implements responsive, accessible dark/light mode UI with glassmorphic aesthetics.
- Role-based routing for Super Admin, Company Admin, Recruiter, Interviewer, and Candidate.

### 2. Core REST API Gateway (`backend/`)
- Express.js with Node.js and TypeScript standards.
- Secures system using JWT Authentication, Refresh Token Rotation, Helmet, CSRF protection, and Rate Limiting.
- Integrates MongoDB Mongoose ORM for data persistence and audit activity logging.

### 3. Python AI Microservice (`ai-service/`)
- FastAPI framework serving AI endpoints.
- Processes PDF/DOCX resumes using `pdfplumber` and `PyMuPDF`.
- Implements candidate ranking formula:
  - Skill Match: 30%
  - Experience Match: 20%
  - Education Match: 10%
  - Project Alignment: 10%
  - Semantic Cosine Similarity: 20%
  - ATS Compatibility Score: 10%
- Detects resume quality, skill gaps, strengths, weaknesses, and fake resume flags.

---

## Security Infrastructure
- **Role-Based Access Control (RBAC)**: Strict permission boundaries for 5 distinct roles.
- **Two-Factor Authentication (2FA)**: Time-based One-Time Password (TOTP) via `speakeasy` and QR codes.
- **Audit Logging**: Every system modification (job creation, stage change, suspension) is saved to the `ActivityLog` collection.
