from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from supabase import Client
from arq import create_pool
from fastapi.middleware.cors import CORSMiddleware
# Import from our core modules
from core.config import settings
from core.database import get_db
from core.redis_config import redis_settings
from dotenv import load_dotenv
app = FastAPI(title=settings.PROJECT_NAME)
security = HTTPBearer()
load_dotenv()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Allows your Next.js frontend
    allow_credentials=True,
    allow_methods=["*"], # Allows POST, GET, OPTIONS, etc.
    allow_headers=["*"], # Allows the Authorization header
)

security = HTTPBearer()
#ic Models ---
class QuestionTypeRow(BaseModel):
    id: str
    type: str
    count: int
    marks: int

class GenerationRequest(BaseModel):
    due_date: str
    question_types: List[QuestionTypeRow]
    total_questions: int
    total_marks: int
    additional_info: Optional[str] = ""

# --- Dependency: Verify Supabase JWT ---
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db)
):
    token = credentials.credentials
    user_resp = db.auth.get_user(token)
    
    if not user_resp or not user_resp.user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        )
    return user_resp.user

# --- Core Endpoint ---
@app.post("/api/assignments/generate")
async def trigger_generation(
    req: GenerationRequest, 
    user = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    try:
        # 1. Database Insert
        db_response = db.table("assignments").insert({
            "teacher_id": user.id,
            "status": "pending",
            "due_date": req.due_date,
            "total_questions": req.total_questions,
            "total_marks": req.total_marks,
            "additional_info": req.additional_info
        }).execute()
        
        assignment_id = db_response.data[0]["id"]

        # 2. Redis Queue (Arq)
        redis_pool = await create_pool(redis_settings)
        await redis_pool.enqueue_job(
            'generate_assessment_task', 
            assignment_id=assignment_id,
            payload=req.model_dump()
        )

        return {"status": "accepted", "assignment_id": assignment_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))