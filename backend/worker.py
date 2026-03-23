# backend/worker.py
import os
import json
import asyncio
from typing import List
from dotenv import load_dotenv
from pydantic import BaseModel, Field
import google.generativeai as genai
from supabase import create_client, Client
from arq.connections import RedisSettings
from urllib.parse import urlparse

load_dotenv()

# --- 1. Pydantic Output Schemas for Gemini ---
class Question(BaseModel):
    text: str = Field(description="The actual question text")
    difficulty: str = Field(description="Must be exactly: Easy, Moderate, or Hard")
    marks: int
    answer_key: str = Field(description="The correct answer or grading rubric for this specific question")

class Section(BaseModel):
    title: str = Field(description="e.g., Section A: Multiple Choice")
    instructions: str = Field(description="e.g., Attempt all questions in this section. Each question carries equal marks.")
    questions: List[Question]

class QuestionPaper(BaseModel):
    sections: List[Section]
    total_marks: int






# --- 2. The Background Task ---
async def generate_assessment_task(ctx, assignment_id: str, payload: dict):
    print(f"[{assignment_id}] Starting generation task...")
    
    # Initialize Clients inside the worker
    supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    
    try:
        # Update status to processing
        supabase.table("assignments").update({"status": "processing"}).eq("id", assignment_id).execute()

        # Extract payload data
        topic = payload.get("additional_info", "General Assessment")
        total_questions = payload.get("total_questions", 0)
        total_marks = payload.get("total_marks", 0)
        question_types = payload.get("question_types", [])

        # Construct the dynamic requirements list
        type_requirements = "\n".join(
            [f"- {qt['count']} questions of type '{qt['type']}' worth {qt['marks']} marks each." for qt in question_types]
        )

        # Build the System Prompt
        prompt = f"""
        You are an expert academic assessment creator for a high school / university level.
        Your task is to generate a highly structured question paper and answer key.
        
        Parameters:
        - Overall Topic/Instructions: {topic}
        - Total Questions Required: {total_questions}
        - Total Marks Required: {total_marks}
        
        Specific Breakdown:
        {type_requirements}
        
        Instructions:
        1. Group the questions logically into Sections (e.g., Section A for Multiple Choice, Section B for Short Answer).
        2. Ensure the difficulty varies across the paper (Easy, Moderate, Hard).
        3. Provide a clear, concise answer key or grading rubric for EVERY question.
        4. The sum of the marks for all generated questions MUST equal exactly {total_marks}.
        """

        print(f"[{assignment_id}] Calling Gemini API...")
        
        # We use Gemini 1.5 Flash for speed and massive context window
        # model = genai.GenerativeModel('gemini-1.5-flash')
        model = genai.GenerativeModel('gemini-3-flash-preview')
        
        # Enforce the strict JSON output
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=QuestionPaper,
                temperature=0.2, # Low temperature for highly deterministic, structured output
            ),
        )

        # Parse the guaranteed JSON string into a Python dictionary
        generated_data = json.loads(response.text)

        print(f"[{assignment_id}] Generation successful. Updating database...")

        # Save the result to PostgreSQL
        supabase.table("assignments").update({
            "status": "completed",
            "generated_paper": generated_data
        }).eq("id", assignment_id).execute()

        print(f"[{assignment_id}] Task complete!")
        return True

    except Exception as e:
        print(f"[{assignment_id}] FAILED: {str(e)}")
        # Fail gracefully and update the DB so the frontend doesn't hang forever
        supabase.table("assignments").update({
            "status": "failed",
            "additional_info": f"Error during generation: {str(e)}"
        }).eq("id", assignment_id).execute()
        return False

# --- 3. Arq Worker Configuration ---
redis_url = urlparse(os.getenv("REDIS_URL", "redis://localhost:6379"))
redis_settings = RedisSettings(
    host=redis_url.hostname,
    port=redis_url.port or 6379,
    password=redis_url.password,
    ssl=redis_url.scheme == 'rediss'
)

class WorkerSettings:
    functions = [generate_assessment_task]
    redis_settings = redis_settings