import os
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ElevenLabs
client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

# Gemini Setup
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("models/gemini-2.5-pro")

class SpeakRequest(BaseModel):
    keywords: str
    persona: str

@app.post("/generate-audio")
async def generate_audio_stream(data: SpeakRequest):
    
    # STEP 1 — Convert keywords to full sentence with Gemini
    prompt = f"""
    Convert these keywords into a natural {data.persona.lower()} sentence:

    Keywords: {data.keywords}

    Output only the final sentence. No explanation.
    """

    gemini_response = model.generate_content(prompt)
    full_sentence = gemini_response.text.strip()

    print("Generated Sentence:", full_sentence)

    # STEP 2 — Stream ElevenLabs Audio
    def audio_stream_generator():
        audio_stream = client.text_to_speech.convert(
            text=full_sentence,
            voice_id="6MoEUz34rbRrmmyxgRm4",
            model_id="eleven_flash_v2_5",
            output_format="mp3_44100_128",
        )
        for chunk in audio_stream:
            if chunk:
                yield chunk

    return StreamingResponse(audio_stream_generator(), media_type="audio/mpeg")
