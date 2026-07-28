# TalentAI ATS - Database ER Diagram & Data Schemas

```mermaid
erDiagram
    User ||--o{ Application : applies
    User ||--o{ Job : posts
    User ||--o{ Interview : conducts
    Company ||--o{ User : employs
    Company ||--o{ Job : owns
    Job ||--o{ Application : receives
    Application ||--o{ Interview : has
    Application ||--o{ Resume : contains
    User ||--o1 CandidateProfile : maintains

    User {
        ObjectId _id
        string name
        string email
        string password
        string role
        ObjectId company
        string department
        boolean twoFactorEnabled
    }

    Company {
        ObjectId _id
        string name
        string industry
        string subscriptionPlan
        number aiCreditsUsed
    }

    Job {
        ObjectId _id
        string title
        string description
        string department
        string[] requiredSkills
        string status
        ObjectId recruiter
    }

    Application {
        ObjectId _id
        ObjectId job
        ObjectId applicant
        string status
        number aiScore
        object scoreBreakdown
        object aiAnalysis
    }

    Interview {
        ObjectId _id
        ObjectId application
        string round
        date scheduledDate
        string meetingLink
        object[] feedback
    }

    Resume {
        ObjectId _id
        ObjectId candidate
        string fileUrl
        object extractedSkills
        number atsScore
    }
```
