from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

app = FastAPI()

# Enquanto testa, deixe "*". Depois troque pelo domínio do Amplify.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/classify")
async def classify(
    subject: str = Form(""),
    body: str = Form(""),
    company_profile: str = Form("grande empresa do setor financeiro")
):
    # TODO: lógica real
    return {"category": "Produtivo", "confidence": 0.91}

@app.post("/suggest-reply")
async def suggest_reply(
    subject: str = Form(""),
    body: str = Form(""),
    company_profile: str = Form("grande empresa do setor financeiro")
):
    # TODO: lógica real
    return {"suggested_reply": "Olá! Obrigado pelo retorno. Podemos avançar ainda esta semana. Abraços."}

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    content = await file.read()
    return {"filename": file.filename, "size": len(content)}

handler = Mangum(app)
