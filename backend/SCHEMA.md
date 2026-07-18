# AI ATS — Database Schema Reference

## Collections Overview

| Collection | Model | Records (seeded) | Purpose |
|---|---|---|---|
| `users` | `User` | 10 | Recruiters and applicants (unified model, role-discriminated) |
| `jobs` | `Job` | 6 | Job postings created by recruiters |
| `applications` | `Application` | 20 | Applications linking applicants to jobs |

---

## Entity Relationship Diagram

```
┌────────────────────────────────────┐
│              User                  │
│  _id, name, email, role            │
│  role: "recruiter" | "applicant"   │
│                                    │
│  [Recruiter fields]                │
│    company, jobTitle, industry     │
│    companySize, companyWebsite     │
│                                    │
│  [Applicant fields]                │
│    skills[], experience[], education[] │
│    savedJobs[] → Job._id           │
│    resumeKey, resumeUrl            │
└───────────┬────────────────────────┘
            │ postedBy (1:N)
            │
┌───────────▼────────────────────────┐
│              Job                   │
│  _id, title, description           │
│  company (snapshot), industry      │
│  skills[], tags[], requirements[]  │
│  type, experienceLevel, department │
│  salary { min, max, currency }     │
│  benefits[], status, isRemote      │
│  applicationDeadline, publishedAt  │
│  applicationCount, views           │
│  isFeatured, autoScreenThreshold   │
└───────────┬────────────────────────┘
            │ job (1:N)
            │
┌───────────▼────────────────────────┐
│          Application               │
│  _id, job → Job, applicant → User  │
│  resumeKey, resumeUrl              │
│  coverLetter, linkedIn, portfolio  │
│                                    │
│  status: applied|screening|        │
│          interview|offered|        │
│          hired|rejected            │
│                                    │
│  stage:  new|reviewed|shortlisted| │
│          interview_scheduled|      │
│          offer_extended|hired|     │
│          rejected                  │
│                                    │
│  rating (1-5), kanbanOrder         │
│  interviewDate, interviewType      │
│  offerDetails { salary, equity..} │
│                                    │
│  aiAnalysis {                      │
│    matchScore, confidence          │
│    skillsMatched[], skillsMissing[]│
│    summary, strengths[], weaknesses│
│    suggestedQuestions[]            │
│    isAnalyzed, isAnalyzing         │
│  }                                 │
│                                    │
│  notes[] { content, addedBy }      │
│  statusHistory[] { from, to, ... } │
│  isWithdrawn, withdrawnAt          │
└────────────────────────────────────┘
```

---

## Collection: `users`

### Core Fields (all roles)

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `name` | String | ✓ | max 100 chars |
| `email` | String | ✓ | unique, lowercase |
| `password` | String | ✓ | bcrypt hashed, `select: false` |
| `role` | String | ✓ | `"recruiter"` \| `"applicant"` |
| `avatar` | String | — | public URL |
| `avatarKey` | String | — | S3 key for deletion |
| `bio` | String | — | max 500 chars |
| `phone` | String | — | |
| `location` | String | — | |
| `linkedIn` | String | — | |
| `portfolio` | String | — | |
| `isActive` | Boolean | — | default `true` |
| `emailVerified` | Boolean | — | default `false` |
| `lastActiveAt` | Date | — | updated on login |
| `refreshToken` | String | — | `select: false` |

### Recruiter-Only Fields

| Field | Type | Notes |
|---|---|---|
| `company` | String | **Required** for recruiters |
| `jobTitle` | String | e.g. "Head of Talent" |
| `industry` | String | e.g. "Software & Technology" |
| `companySize` | String | enum: startup / small / medium / large / enterprise |
| `companyWebsite` | String | URL |
| `companyDescription` | String | max 1000 chars |
| `companyLogo` | String | URL |

### Applicant-Only Fields

| Field | Type | Notes |
|---|---|---|
| `skills` | String[] | lowercase, used for AI matching |
| `experience` | SubDoc[] | `title, company, startDate, endDate, current, description` |
| `education` | SubDoc[] | `degree, institution, field, startYear, endYear, grade` |
| `resumeKey` | String | S3 object key (profile resume) |
| `resumeUrl` | String | URL |
| `resumeFileName` | String | |
| `savedJobs` | ObjectId[] | refs to `Job` |
| `preferredJobTypes` | String[] | enum: full-time / part-time / contract / remote / internship |
| `expectedSalary` | SubDoc | `min, max, currency` |
| `openToRelocation` | Boolean | default `false` |
| `noticePeriodDays` | Number | default `0` |

### Virtuals

| Virtual | Returns |
|---|---|
| `initials` | First 2 initials of name |
| `isRecruiter` | `true` if role = recruiter |

### Indexes

| Index | Type | Purpose |
|---|---|---|
| `email` | unique | Login lookup |
| `role` | 1 | Filter by role |
| `skills` | 1 | Candidate search by skill |
| `experience.company, skills, bio` | text | Full-text candidate search |

---

## Collection: `jobs`

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | |
| `title` | String | ✓ | max 200 chars |
| `description` | String | ✓ | min 50 chars |
| `requirements` | String[] | — | bullet list |
| `responsibilities` | String[] | — | bullet list |
| `skills` | String[] | — | lowercase, for AI matching |
| `tags` | String[] | — | freeform search labels |
| `department` | String | ✓ | |
| `location` | String | — | default "Remote" |
| `isRemote` | Boolean | — | explicit remote flag |
| `type` | String | ✓ | full-time / part-time / contract / remote / internship |
| `experienceLevel` | String | ✓ | entry / mid / senior / lead / manager |
| `salary.min` | Number | — | |
| `salary.max` | Number | — | |
| `salary.currency` | String | — | default "USD" |
| `salary.isVisible` | Boolean | — | hide salary from public |
| `salary.period` | String | — | hourly / monthly / annual |
| `benefits` | String[] | — | e.g. "Health insurance", "401(k)" |
| `company` | String | — | **Denormalized** snapshot from recruiter |
| `companyLogo` | String | — | URL |
| `industry` | String | — | |
| `status` | String | — | draft / active / archived / closed |
| `applicationDeadline` | Date | — | must be future date |
| `publishedAt` | Date | — | auto-set when status → active |
| `postedBy` | ObjectId | ✓ | ref: `User` (recruiter) |
| `applicationCount` | Number | — | denormalized counter |
| `views` | Number | — | page view counter |
| `isFeatured` | Boolean | — | boosted listing |
| `autoScreenThreshold` | Number | — | min AI score for auto-screening |

### Virtuals

| Virtual | Returns |
|---|---|
| `isExpired` | `true` if deadline < now |
| `daysRemaining` | Days until deadline |
| `salaryRange` | Formatted string e.g. "USD 130,000 – 170,000" |

### Pre-save Hooks

- Auto-sets `status: 'closed'` when `applicationDeadline` passes
- Sets `publishedAt` on first transition to `'active'`

### Indexes

| Index | Purpose |
|---|---|
| `title, description, skills, department, tags` (text) | Full-text job search |
| `{ status, createdAt }` | Public job board listing |
| `{ postedBy, status }` | Recruiter dashboard |
| `{ skills }` | AI skill matching |
| `{ applicationDeadline }` | Expired job cleanup |
| `{ isFeatured, status, createdAt }` | Featured listings |

---

## Collection: `applications`

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | |
| `job` | ObjectId | ✓ | ref: `Job` |
| `applicant` | ObjectId | ✓ | ref: `User` |
| `resumeKey` | String | — | S3 key (per-application resume) |
| `resumeUrl` | String | — | URL |
| `resumeFileName` | String | — | |
| `coverLetter` | String | — | max 3000 chars |
| `linkedIn` | String | — | |
| `portfolio` | String | — | |
| `status` | String | — | applied → screening → interview → offered → hired \| rejected |
| `stage` | String | — | new → reviewed → shortlisted → interview_scheduled → offer_extended → hired \| rejected |
| `rating` | Number | — | 1-5 stars (recruiter manual) |
| `kanbanOrder` | Number | — | sort order within Kanban column |
| `interviewDate` | Date | — | |
| `interviewType` | String | — | online / onsite / phone / technical / panel |
| `interviewLink` | String | — | video call URL |
| `interviewNotes` | String | — | max 1000 chars |
| `offerDetails.baseSalary` | Number | — | |
| `offerDetails.currency` | String | — | |
| `offerDetails.equity` | String | — | e.g. "0.5%" |
| `offerDetails.startDate` | Date | — | |
| `offerDetails.expiresAt` | Date | — | |
| `aiAnalysis.matchScore` | Number | — | 0–100 |
| `aiAnalysis.confidence` | Number | — | 0–1 model confidence |
| `aiAnalysis.skillsMatched` | String[] | — | |
| `aiAnalysis.skillsMissing` | String[] | — | |
| `aiAnalysis.summary` | String | — | |
| `aiAnalysis.strengths` | String[] | — | |
| `aiAnalysis.weaknesses` | String[] | — | |
| `aiAnalysis.suggestedQuestions` | String[] | — | interview question suggestions |
| `aiAnalysis.isAnalyzed` | Boolean | — | default `false` |
| `aiAnalysis.isAnalyzing` | Boolean | — | default `false` (lock) |
| `notes` | SubDoc[] | — | `content, addedBy, isPinned, timestamps` |
| `statusHistory` | SubDoc[] | — | `from, to, changedBy, note, timestamps` |
| `isWithdrawn` | Boolean | — | applicant self-withdrawal |
| `withdrawnAt` | Date | — | auto-set |
| `withdrawReason` | String | — | max 500 chars |

### Status vs Stage Design Decision

> **`status`** is the _business_ state — drives email notifications and billing logic.  
> **`stage`** is the _UI pipeline_ position — controls Kanban column placement.  
> A pre-save hook coarse-syncs stage when status changes, but recruiters can freely move stage without triggering emails.

### Virtuals

| Virtual | Returns |
|---|---|
| `isAnalyzed` | Shorthand for `aiAnalysis.isAnalyzed` |
| `matchScoreLabel` | Excellent / Good / Fair / Poor |
| `matchScoreColor` | success / info / warning / error (MUI color) |

### Pre-save Hooks

- Syncs `stage` from `status` when status changes
- Sets `withdrawnAt` on first `isWithdrawn = true`

### Indexes

| Index | Purpose |
|---|---|
| `{ job, applicant }` (unique) | Prevent duplicate applications |
| `{ job, stage, kanbanOrder }` | Kanban board queries |
| `{ job, status }` | Status-filtered pipeline |
| `{ applicant, createdAt }` | Applicant's own applications list |
| `{ job, aiAnalysis.matchScore }` | AI ranking queries |
| `{ job, rating }` | Manual rating filter |
| `{ isAnalyzed, isAnalyzing }` | Batch AI analysis queue |

---

## Relationships Summary

```
User (recruiter) ──[postedBy 1:N]──► Job
User (applicant) ──[applicant 1:N]──► Application
Job ──[job 1:N]──► Application
User (applicant) ──[savedJobs N:M]──► Job
Application.notes.addedBy ──► User (recruiter)
Application.statusHistory.changedBy ──► User
```

---

## Seed Credentials

All accounts use password: `Password123!`

| Role | Email | Company / Notes |
|---|---|---|
| Recruiter | `recruiter1@demo.com` | TechNova Solutions |
| Recruiter | `recruiter2@demo.com` | DataBridge Corp |
| Applicant | `alex@demo.com` | Full-stack, score 88 |
| Applicant | `priya@demo.com` | ML engineer, score 92 |
| Applicant | `marcus@demo.com` | DevOps, score 95, offered |
| Applicant | `emily@demo.com` | Frontend, score 90 |
| Applicant | `david@demo.com` | Backend |
| Applicant | `sofia@demo.com` | Data analyst |
| Applicant | `ryan@demo.com` | Security |
| Applicant | `lisa@demo.com` | Product engineer |
