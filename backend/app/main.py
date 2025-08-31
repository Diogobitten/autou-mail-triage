# app/main.py
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from .models import ClassifyRequest, ClassifyResponse
from .nlp import preprocess
from .config import ALLOWED_ORIGINS, ALLOW_DEBUG
from .pdf import extract_text_from_blob
from .openai_client import classify_only, generate_reply

app = FastAPI(title="Email Classifier API", version="1.3.0")

def _normalize_origins(value) -> list[str]:

    if isinstance(value, str):
        items = [o.strip().rstrip("/") for o in value.split(",") if o.strip()]
    elif isinstance(value, (list, tuple, set)):
        items = [str(o).strip().rstrip("/") for o in value if str(o).strip()]
    else:
        items = []
    return items or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_normalize_origins(ALLOWED_ORIGINS),
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False, 
)


def _sanitize_lang(code: Optional[str]) -> str:

    if not code:
        return "auto"
    c = code.strip().lower()
    if c in ("pt", "pt-br", "pt_br"):
        return "pt"
    if c.startswith("en"):
        return "en"
    if c == "auto":
        return "auto"
    return "pt"

def _decide_language(requested: str, text_blob: str,
                     accept_language: Optional[str], x_user_lang: Optional[str]) -> str:
    """
    Retorna 'pt' ou 'en'.
    Prioridade: X-User-Lang > Accept-Language > heurística de vocabulário > default pt.
    """
    req = _sanitize_lang(requested)
    if req in ("pt", "en"):
        return req

    # Headers
    for h in (x_user_lang, accept_language):
        if not h:
            continue
        h = h.lower()
        if "pt" in h:
            return "pt"
        if "en" in h:
            return "en"

    # Heurística simples
    t = (text_blob or "").lower()
    pt_hits = any(w in t for w in ["obrigado", "por favor", "fatura", "reunião", "prazo", "anexo", "protocolo"])
    en_hits = any(w in t for w in ["thanks", "please", "invoice", "meeting", "deadline", "attached", "ticket"])
    if pt_hits and not en_hits:
        return "pt"
    if en_hits and not pt_hits:
        return "en"

    # Default
    return "pt"

# ===== template padrão para improdutivo =====
def canned_improdutivo(lang_code: str) -> str:
    code = _sanitize_lang(lang_code)
    if code == "en":
        return "Thanks for reaching out! We've recorded your message."
    return "Obrigado pela mensagem! Registramos seu contato."

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/classify", response_model=ClassifyResponse)
async def classify(
    req: ClassifyRequest,
    accept_language: Optional[str] = Header(None, convert_underscores=False),
    x_user_lang: Optional[str] = Header(None),
):
    if not req.body or not req.body.strip():
        raise HTTPException(status_code=400, detail="body é obrigatório")

    # Detecta/normaliza idioma final (pt|en)
    lang = _decide_language(req.language or "auto", f"{req.subject}\n{req.body}", accept_language, x_user_lang)

    tokens = preprocess(req.body, lang if lang == "pt" else "en")
    category, confidence = classify_only(
        body_text=req.body, subject=req.subject, language=lang
    )

    if category == "Improdutivo":
        suggested = canned_improdutivo(lang)
    else:
        suggested = generate_reply(req.body, req.subject, lang)

    return ClassifyResponse(
        category=category if category in ("Produtivo", "Improdutivo") else "Produtivo",
        confidence=max(0.0, min(1.0, confidence)),
        suggested_reply=suggested,
        language=lang,
        tokens=tokens if ALLOW_DEBUG else None,
        meta={"token_count": len(tokens), "language": lang} if ALLOW_DEBUG else None,
    )

# ---- upload de arquivo (.pdf/.txt) ----
@app.post("/classify-file")
async def classify_file(
    file: UploadFile = File(...),
    language: str = Form("auto"),
    accept_language: Optional[str] = Header(None, convert_underscores=False),
    x_user_lang: Optional[str] = Header(None),
):
    blob = await file.read()
    if not blob:
        raise HTTPException(status_code=400, detail="Arquivo vazio")

    try:
        text, meta = extract_text_from_blob(blob, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not text or len(text.strip()) < 5:
        raise HTTPException(status_code=422, detail="Não foi possível extrair texto do arquivo")

    # Decide idioma final (pt|en) com base no conteúdo e headers
    lang = _decide_language(language or "auto", text, accept_language, x_user_lang)

    category, confidence = classify_only(text, file.filename, lang)
    if category == "Improdutivo":
        suggested = canned_improdutivo(lang)
    else:
        suggested = generate_reply(text, file.filename, lang)

    return {
        "category": category if category in ("Produtivo", "Improdutivo") else "Produtivo",
        "confidence": max(0.0, min(1.0, confidence)),
        "suggested_reply": suggested,
        "language": lang,
        "meta": {"file": file.filename, **meta},
    }
