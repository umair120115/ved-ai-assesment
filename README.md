# VedaAI Assessment Generator 🚀

An enterprise-grade, event-driven platform designed to help educators instantly generate structured, print-ready A4 exam papers and answer keys. VedaAI is optimized for precise curriculum standards (such as CBSE/NCERT) and utilizes a decoupled background queue to handle heavy LLM generation tasks securely and reliably.

---

## 🏗️ Architecture & Tech Stack

VedaAI is built as a monorepo utilizing a decoupled, asynchronous architecture.

### **Frontend (Client & UI)**

* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS (Optimized for pixel-perfect A4 print layouts)
* **State Management:** Zustand (Handling dynamic form calculations)
* **Authentication:** Supabase Auth (Google OAuth & Email/Password)

### **Backend (API & Worker)**

* **API Gateway:** FastAPI (High-performance, non-blocking routing)
* **Task Queue:** Arq + Upstash Redis (Serverless background jobs)
* **AI Engine:** Google Gemini 1.5 Pro (via `google-generativeai`)
* **Data Validation:** Pydantic (Strict schema enforcement)
* **Database & Realtime:** Supabase PostgreSQL (with WebSockets)
* **Infrastructure:** Docker & Docker Compose

---

## 📂 Monorepo Structure

```text
veda-ai-assessment/
├── frontend/             # Next.js web application
│   ├── app/              # App Router, Pages, and Layouts
│   ├── components/       # Reusable UI (Dashboard, Create Form, Paper Output)
│   ├── store/            # Zustand global state stores
│   └── lib/              # Supabase client configuration
├── backend/              # Python API & Background Worker
│   ├── main.py           # FastAPI entry point & CORS config
│   ├── worker.py         # Arq worker for LLM processing
│   ├── Dockerfile        # Container configuration
│   └── docker-compose.yml# Local orchestration network
├── .gitignore            # Root git ignore rules
└── README.md             # Project documentation
```

---

## ⚙️ Generation Lifecycle

1. **Authentication**
   User logs in via Supabase Auth on the Next.js client.

2. **Job Submission**
   The frontend sends a structured JSON payload (question types, counts, syllabus context) to the FastAPI gateway with a secure JWT.

3. **Queueing**
   FastAPI verifies the token, enqueues a job ID in Upstash Redis, and instantly responds with `200 OK`.

4. **AI Processing**
   The Arq worker picks up the job, queries Gemini 1.5 Pro using strict instructions, and formats the output into a standardized JSON structure.

5. **Real-time Delivery**
   The worker saves the final JSON to PostgreSQL. Supabase Realtime immediately broadcasts this update via WebSockets to Next.js, instantly transitioning the UI to the rendered exam paper.

---

## 🚀 Local Development Setup

### 1. Prerequisites

* Node.js (v18+)
* Python (3.10+)
* Docker Desktop
* External Accounts:

  * Supabase
  * Upstash (Serverless Redis)
  * Google AI Studio

---

### 2. Environment Variables

Create the following `.env` files in their respective directories.

#### `frontend/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### `backend/.env`

```env
ENVIRONMENT=development
PROJECT_NAME="VedaAI Assessment API"
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
REDIS_URL=rediss://default:your-password@your-endpoint.upstash.io:6379
GEMINI_API_KEY=your-google-gemini-key
```

---

### 3. Database Initialization (Supabase)

Execute the following SQL in your Supabase SQL Editor:

```sql
CREATE TABLE assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    due_date DATE,
    total_questions INTEGER,
    total_marks INTEGER,
    additional_info TEXT,
    status TEXT DEFAULT 'processing',
    generated_paper JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for frontend listeners
ALTER PUBLICATION supabase_realtime ADD TABLE assignments;
```

---

### 4. Running the Application

#### Step A: Boot the Backend (Docker)

```bash
cd backend
docker-compose up --build
```

* FastAPI runs at: http://localhost:8000

#### Step B: Boot the Frontend

```bash
cd frontend
npm install
npm run dev
```

* Frontend runs at: http://localhost:3000

---

## 🚢 Deployment Configuration

### Frontend

* Deploy easily on **Vercel**
* Add environment variables in Vercel dashboard

### Backend

* Dockerized (API + Worker bundled)
* Deploy to:

  * Render
  * Koyeb
  * AWS ECS

### Latency Optimization

For best performance, deploy backend close to users:

* Recommended: **Asia-South1 (Mumbai)**

---

## 📌 Notes

* Fully asynchronous architecture ensures scalability
* Real-time updates eliminate polling
* Strict schema validation prevents malformed AI output
* Optimized for education workflows and exam generation

---

## 📄 License

Add your license here (MIT, Apache 2.0, etc.)

---
