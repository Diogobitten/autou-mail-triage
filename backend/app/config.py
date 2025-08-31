import os
from dotenv import load_dotenv

# carrega variáveis do .env automaticamente
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
ALLOW_DEBUG = os.getenv("ALLOW_DEBUG", "false").lower() == "true"
import os

ALLOWED_ORIGINS = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if o.strip()
] or ["*"]


PDF_MAX_PAGES = int(os.getenv("PDF_MAX_PAGES", "30"))
TEXT_MAX_CHARS = int(os.getenv("TEXT_MAX_CHARS", "12000"))
