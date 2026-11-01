# PrepBrain AI
**Your Intelligence. Your Learning. Your Growth.**

Adaptive exam-prep tutor with a **persistent learner model**. Built for the Agentic AI Hackathon (Product Space x Wispr Flow).

> PrepBrain AI doesn't just teach students. It remembers how they learn, understands where they struggle and decides what they should learn next.

## What it does
- **Persistent learner model:** per-topic mastery (0-100), difficulty level, attempts, and recurring mistake patterns are stored in a database per student. Nothing is kept in localStorage; it survives logout, login and refresh.
- **Adaptive quiz engine:** difficulty is chosen from the stored model and the last 5 answers on a topic. Unseen questions are preferred over repeats.
- **Bring your own syllabus:** paste or upload a syllabus (PDF, .txt or .md; PDFs are read by Gemini); PrepBrain extracts topics and their importance, generates questions for them, and runs the same learner model on any subject.
- **AI-generated practice questions:** Gemini writes new questions aimed at the student's repeated mistakes. Each one is validated (answer must be one of the options, difficulty 1-3, safe tag) before saving, and is labelled "AI-generated" in the quiz.
- **Agentic orchestrator:** four real functions (Assessment, Learner Analysis, Study Planning, Recommendation) run in sequence after every quiz. The result screen shows a **trace of what each agent actually did**.
- **AI tutor:** 4 explanation modes, uses the student's weak topics and repeated mistakes as context, saves chat history, and falls back to an offline tutor if Gemini is unavailable.
- **Study planner**, **analytics** (insights computed only from stored data), **dashboard**, **auth** (register/login).
- **Progress report:** a printable report (Save as PDF) built from stored data.
- **Floating tutor:** a quick-help popup on every page except the tutor page and quizzes.

## Agents (rules decide, Gemini explains)
| Agent | Does | Uses |
|---|---|---|
| Assessment Agent | Grades answers, saves history | Rules |
| Learner Analysis Agent | Updates mastery, difficulty, mistake patterns | Rules |
| Study Planning Agent | Ranks topics, builds the plan | Rules |
| Recommendation Agent | Writes a personalised tip | Gemini (validated with zod), rule-based fallback |

## Transparent algorithms
**Mastery** (`src/lib/mastery.ts`): `evidence` = difficulty-weighted accuracy of the session (weights 1-3). First time: mastery = evidence. After that: `new = old*(1-a) + evidence*a`, where `a = min(0.6, 0.25 + 0.05*answers)`.

**Difficulty:** last 5 answers on the topic. 4+ correct raises difficulty (max 3). 1 or fewer correct lowers it (min 1). Otherwise unchanged. Fewer than 3 answers: unchanged. Never random.

**Planner priority:** `weakness*0.6 + min(repeated mistakes,10)*2.5 + min(days since practice,10)*1.5 + (topic importance - 1)*3`, highest first. Importance (1-5) comes from the student's syllabus. The dashboard's "next best action" uses the same formula.

## Tech stack
Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide, Prisma, SQLite (dev) / PostgreSQL (production), Google Gemini API.

## Setup (local)
```bash
npm install
cp .env.example .env        # Windows: copy .env.example .env
npx prisma db push
npm run seed                # demo student + 32 Python questions
npm run dev                 # http://localhost:3000
```
Add more questions any time without losing data: `npx tsx prisma/add-questions.ts`

**Demo account (demonstration data):** `demo@prepbrain.ai` / `demo1234`. The seeded mastery values are sample data, labelled as such in the UI.

**Gemini (optional):** put your key in `.env` as `GEMINI_API_KEY`, then restart `npm run dev`. The key is only used server-side. Without it, the tutor and recommendations use offline fallbacks and the UI says "Offline mode". Temporary Gemini errors (503/429) are retried, then a backup model (`GEMINI_FALLBACK_MODEL`) is tried.

## Suggested 3-minute demo
1. Open in Incognito: landing page. Click **Use demo account**.
2. Dashboard: Functions is weakest, with repeated mistakes. Next best action matches the planner.
3. Take an assessment (Loops). Finish, then read **How PrepBrain decided** (the agent trace) and the mastery before/after.
4. Logout, login again: the updated model is still there (database, not browser).
5. AI Tutor: ask "Explain functions". It mentions your mastery and mistakes.
6. Planner and Analytics: both rebuilt from the new data.
7. My Subjects: paste or upload a syllabus, get topics with importance and AI questions for any subject.
8. Report: print a progress report built from stored data. The floating Brain button gives quick tutor help on every page (hidden during quizzes).

## Project structure
```
prisma/            schema.prisma, seed.ts, questions.ts, add-questions.ts
src/lib/           auth, db, gemini, mastery, orchestrator, tutorFallback
src/app/           page (landing), login, register, dashboard, syllabus, quiz, tutor, analytics, planner, report
src/app/api/       auth/*, assessment/start|submit, tutor, syllabus/analyze, questions/generate, planner/generate|toggle
src/components/    AppShell, DashboardView, QuizClient, TutorClient, PlannerClient, AnalyticsCharts, ...
```

## Data model
User, Subject, Topic, Question, Assessment, StudentAnswer, LearnerProfile, TopicMastery, MistakePattern, StudyPlan, StudyTask, StudyActivity, ChatHistory. Every learner record has a `userId`, and every query is filtered by the logged-in user.

## Security
- Gemini calls are server-side only; keys live in environment variables.
- Session cookie is `httpOnly`, HMAC-signed with `AUTH_SECRET`; passwords are hashed with bcrypt.
- All API inputs are validated with zod; AI output is schema-validated before saving.
- Correct answers are never sent to the browser before a quiz is submitted; an assessment can only be submitted once.
- In production the app refuses to run without `AUTH_SECRET`.

## Deploying (Vercel + PostgreSQL)
SQLite files do not persist on serverless hosting, so production uses Postgres. The repo keeps both schemas: `prisma/schema.prisma` (SQLite, local dev) and `prisma/schema.postgres.prisma` (production). `vercel.json` makes Vercel build with the Postgres schema, so local development is not affected.
1. Push the project to GitHub. `.gitignore` excludes `.env` and `*.db`. Never commit keys.
2. Create a free Postgres database (Neon, Supabase or Vercel Postgres) and copy its connection string (it should end with `?sslmode=require`).
3. Create the tables and seed the demo data from your machine (PowerShell, dev server stopped):
```powershell
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
npx prisma@5.22.0 generate --schema prisma/schema.postgres.prisma
npx prisma@5.22.0 db push --schema prisma/schema.postgres.prisma
npm run seed
Remove-Item Env:DATABASE_URL
npx prisma@5.22.0 generate      # restores the local SQLite client
```
4. In Vercel: import the GitHub repo and set environment variables `DATABASE_URL` (the Postgres string), `AUTH_SECRET` (long random value, see `.env.example`), and optionally `GEMINI_API_KEY`.
5. Deploy, then test in an Incognito window: demo login, take a quiz, logout, login.
Routes that call Gemini set `maxDuration = 60` so they are not cut off by the default 10 second serverless limit.

## Known limitations (honest list)
- Reading a PDF syllabus needs Gemini (pasted text and .txt/.md files work with a basic offline parser). PDFs are limited to 3 MB. Importance is AI-estimated from the syllabus, not a prediction of the real exam.
- The offline tutor fallback only knows Python; other subjects need Gemini.
- Question bank is 32 Python questions (4 topics). Gemini-generated questions are schema-validated but not human-reviewed, so answer keys should be spot-checked.
- Auth is basic: no email verification or password reset, and no rate limiting.
- Dark theme only. The agent trace is shown after a quiz but not stored for later viewing.
- Not load-tested; tests were manual.
