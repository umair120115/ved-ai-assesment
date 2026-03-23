# backend/list_models.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load your .env file
load_dotenv()

# Configure the SDK with your key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("Fetching available models...\n")

# Loop through and print only the models that can generate text
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f"Model Name: {m.name}")
        print(f"Description: {m.description}\n")