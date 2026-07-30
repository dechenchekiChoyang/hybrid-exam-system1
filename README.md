# Hybrid Exam System — Backend

Express + MongoDB API implementing role-based auth, exams with objective + subjective
questions, server-side auto-grading, manual grading, and the publish gate that hides
scores from students until an instructor releases them.

## 1. Prerequisites

- Node.js 18 or newer
- A MongoDB database — either:
  - **Local**: install MongoDB Community Server and run it (`mongod`), or
  - **Atlas** (easiest, free tier): create a cluster at https://www.mongodb.com/cloud/atlas and copy its connection string

## 2. Setup

```bash
cd exam-backend
npm install
cp .env.example .env
```

Open `.env` and fill in:
- `MONGO_URI` — your local or Atlas connection string
- `JWT_SECRET` — any long random string (generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)

## 3. Run it

```bash
npm run dev     # auto-restarts on file changes (nodemon)
# or
npm start
```

You should see:
```
MongoDB connected: ...
Server listening on http://localhost:5000
```

Check it's alive: `curl http://localhost:5000/api/health` → `{"status":"ok"}`

## 4. Try the API end-to-end

**Register an instructor and a student:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr. Karma","email":"karma@faculty.edu","password":"password123","role":"instructor"}'

curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Choyang","email":"choyang@student.edu","password":"password123","role":"student"}'
```
Save the `token` from each response.

**Instructor creates an exam:**
```bash
curl -X POST http://localhost:5000/api/exams \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Networks Mid","durationMinutes":15,"passingMarks":30,"countToServe":4}'
```
Save the returned `_id` as `EXAM_ID`.

**Instructor adds questions:**
```bash
curl -X POST http://localhost:5000/api/exams/EXAM_ID/questions \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"mcq","text":"Which layer routes packets?","options":["Data Link","Network","Transport","Session"],"correctOptionIndex":1,"marks":5}'

curl -X POST http://localhost:5000/api/exams/EXAM_ID/questions \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"short_answer","text":"Explain the TCP three-way handshake.","maxMarks":10}'
```

**Instructor publishes the exam so students can see it:**
```bash
curl -X PATCH http://localhost:5000/api/exams/EXAM_ID/publish \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN"
```

**Student fetches the exam (correct answers stripped):**
```bash
curl http://localhost:5000/api/exams/EXAM_ID/attempt \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

**Student submits answers:**
```bash
curl -X POST http://localhost:5000/api/submissions/EXAM_ID \
  -H "Authorization: Bearer STUDENT_TOKEN" -H "Content-Type: application/json" \
  -d '{"answers":[{"question":"QUESTION_ID_1","selectedOptionIndex":1},{"question":"QUESTION_ID_2","textAnswer":"It synchronizes sequence numbers..."}]}'
```
Response contains no score — just a confirmation message, matching the no-disclosure rule.

**Instructor opens the grading queue:**
```bash
curl http://localhost:5000/api/submissions/exam/EXAM_ID \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN"
```

**Instructor grades the short-answer question:**
```bash
curl -X PATCH http://localhost:5000/api/submissions/SUBMISSION_ID/grade \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" -H "Content-Type: application/json" \
  -d '{"questionId":"QUESTION_ID_2","marks":8,"feedback":"Good, but missed the SYN-ACK step."}'
```

**Instructor publishes the result:**
```bash
curl -X POST http://localhost:5000/api/submissions/SUBMISSION_ID/publish \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN"
```

**Student can now view the result:**
```bash
curl http://localhost:5000/api/submissions/SUBMISSION_ID/result \
  -H "Authorization: Bearer STUDENT_TOKEN"
```
Before publishing, this same call returns `403 Results have not been published yet.`

## What's implemented vs. what's a stub

**Implemented:** JWT auth + RBAC, exam/question CRUD basics, server-side auto-grading
(mcq/true_false/fill_blank), manual grading with marks + feedback, the publish gate,
and the exact no-answer-disclosure behavior the frontend demo expects.

**Not implemented (out of scope for this pass):** admin user management (bulk import,
password reset), department/course/enrollment models, reports/PDF/Excel export,
notifications, audit logs, refresh tokens, email verification, and file/image/math
attachments on questions. The `models/` and `routes/` structure is set up so each of
these can be added as its own file without touching existing code.

## Wiring up the frontend demo

In the React artifact, replace the mock functions (`autoGrade`, the in-memory
`submission` state, etc.) with real calls to these endpoints via `fetch`, storing
the JWT from login in React state (not localStorage — see the artifact's storage
notes) and sending it as `Authorization: Bearer <token>` on every request.
