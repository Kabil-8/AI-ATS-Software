# TalentAI ATS - REST API Documentation

Base URL: `http://localhost:5000/api`

## Authentication Endpoints (`/auth`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login user & return JWT + Refresh Token | Public |
| POST | `/auth/refresh-token` | Exchange refresh token for new access token | Public |
| POST | `/auth/forgot-password` | Generate password reset OTP | Public |
| POST | `/auth/reset-password` | Reset password using OTP | Public |
| GET | `/auth/me` | Fetch authenticated user profile | Authenticated |
| PUT | `/auth/profile` | Update user details & candidate profile | Authenticated |
| POST | `/auth/2fa/setup` | Generate 2FA secret and QR code | Authenticated |
| POST | `/auth/2fa/verify` | Verify 2FA code and enable 2FA | Authenticated |

---

## Job Management Endpoints (`/jobs`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/jobs` | Search & filter jobs (location, experience, salary) | Public |
| GET | `/jobs/:id` | Get single job details | Public |
| POST | `/jobs` | Create new job posting | Recruiter / Admin |
| PUT | `/jobs/:id` | Update job posting | Recruiter / Admin |
| POST | `/jobs/:id/duplicate` | Duplicate job as draft | Recruiter / Admin |
| DELETE | `/jobs/:id` | Archive job posting | Recruiter / Admin |
| POST | `/jobs/:id/bookmark` | Bookmark job for candidate | Candidate |

---

## Application & Pipeline Endpoints (`/applications`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/applications` | Submit application with resume & trigger AI analysis | Candidate |
| GET | `/applications/my-applications` | List candidate applied jobs | Candidate |
| GET | `/applications/job/:jobId` | Fetch job applications for recruiter pipeline | Recruiter / Admin |
| GET | `/applications/:id` | Get application details & AI score breakdown | Recruiter / Candidate |
| PUT | `/applications/:id/stage` | Update Kanban hiring stage (9 stages) | Recruiter / Admin |
| POST | `/applications/:id/notes` | Add recruiter evaluation notes | Recruiter / Interviewer |

---

## Interview Endpoints (`/interviews`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/interviews` | Schedule interview & generate video meet link | Recruiter / Admin |
| GET | `/interviews` | List scheduled interviews for candidate or interviewer | Authenticated |
| POST | `/interviews/:id/feedback` | Submit interview rating & feedback | Recruiter / Interviewer |

---

## AI Microservice Endpoints (`/ai`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/ai/parse-resume` | Parse raw resume file/URL into structured JSON | Authenticated |
| GET | `/ai/rank-candidates/:jobId` | Compute weighted candidate ranking for job | Recruiter / Admin |
| POST | `/ai/resume-feedback` | Get ATS compatibility suggestions & strength analysis | Authenticated |

---

## Executive Analytics Endpoints (`/analytics`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/analytics/dashboard` | Fetch KPIs, hiring funnel, & skill distribution | Recruiter / Admin |

---

## Audit Logs & System Admin (`/admin`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/admin/audit-logs` | Retrieve system activity audit logs | Super Admin / Company Admin |
