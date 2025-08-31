# app/pdf.py
import io
from typing import Tuple
from pypdf import PdfReader
from .config import PDF_MAX_PAGES, TEXT_MAX_CHARS

def _decode_txt(blob: bytes) -> str:
    try:
        return blob.decode("utf-8")
    except UnicodeDecodeError:
        return blob.decode("latin-1", errors="ignore")

def extract_text_from_blob(blob: bytes, filename: str) -> Tuple[str, dict]:
    name = (filename or "").lower()

    if name.endswith(".txt"):
        text = _decode_txt(blob)
        if len(text) > TEXT_MAX_CHARS:
            text = text[:TEXT_MAX_CHARS] + "\n[...]"
        return text.strip(), {"type": "txt", "pages": 1, "size_bytes": len(blob)}

    if not name.endswith(".pdf"):
        raise ValueError("Apenas arquivos .pdf ou .txt são suportados")

    reader = PdfReader(io.BytesIO(blob))
    pages_count = len(reader.pages)
    limit = min(pages_count, PDF_MAX_PAGES)

    parts = []
    for i in range(limit):
        txt = reader.pages[i].extract_text() or ""
        parts.append(txt)

    text = ("\n\n".join(parts)).strip()
    if len(text) > TEXT_MAX_CHARS:
        text = text[:TEXT_MAX_CHARS] + "\n[...]"

    return text, {
        "type": "pdf",
        "pages": pages_count,
        "pages_processed": limit,
        "size_bytes": len(blob),
    }
