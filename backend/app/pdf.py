# app/pdf.py
import io
import pdfplumber
from typing import Tuple
from .config import PDF_MAX_PAGES, TEXT_MAX_CHARS

def _decode_txt(blob: bytes) -> str:
    # tenta utf-8, cai para latin-1 se necessário
    try:
        return blob.decode("utf-8")
    except UnicodeDecodeError:
        return blob.decode("latin-1", errors="ignore")

def extract_text_from_blob(blob: bytes, filename: str) -> Tuple[str, dict]:
    """
    Lê .txt ou extrai texto de .pdf.
    Retorna (text, meta) onde meta inclui número de páginas e tamanho.
    """
    name = (filename or "").lower()

    if name.endswith(".txt"):
        text = _decode_txt(blob)

        # trim de segurança
        if len(text) > TEXT_MAX_CHARS:
            text = text[:TEXT_MAX_CHARS] + "\n[...]"

        return text.strip(), {"type": "txt", "pages": 1, "size_bytes": len(blob)}

    if not name.endswith(".pdf"):
        raise ValueError("Apenas arquivos .pdf ou .txt são suportados")

    pages_text = []
    pages_count = 0

    with pdfplumber.open(io.BytesIO(blob)) as pdf:
        pages_count = len(pdf.pages)
        limit = min(pages_count, PDF_MAX_PAGES)
        for i in range(limit):
            t = pdf.pages[i].extract_text() or ""
            pages_text.append(t)

    text = "\n\n".join(pages_text).strip()

    # trim de segurança para não explodir o prompt
    if len(text) > TEXT_MAX_CHARS:
        text = text[:TEXT_MAX_CHARS] + "\n[...]"

    return text, {
        "type": "pdf",
        "pages": pages_count,
        "pages_processed": min(pages_count, PDF_MAX_PAGES),
        "size_bytes": len(blob),
    }
