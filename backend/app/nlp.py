import re
import unicodedata
from typing import List

STOP_PT = {"a","ao","aos","com","como","da","de","do","dos","e","ela","ele","em","isso","já","mas","me","no","nos","não","o","os","ou","para","por","que","se","sem","sua","são","também","um","uma","você"}
STOP_EN = {"a","an","the","and","or","but","if","then","else","for","to","of","in","on","at","by","is","are","was","were","be","been","being","it","as","with","that","this","these","those","from","i","you","he","she","we","they"}

PUNCT_RE = re.compile(r"[^\w\s]", re.UNICODE)
MULTISPACE_RE = re.compile(r"\s+")

def strip_accents(text: str) -> str:
    return ''.join(ch for ch in unicodedata.normalize('NFD', text) if unicodedata.category(ch) != 'Mn')

def preprocess(text: str, lang: str = "pt-BR") -> List[str]:
    if not text:
        return []
    text = strip_accents(text.lower())
    text = PUNCT_RE.sub(" ", text)
    text = re.sub(r"\d+", " ", text)
    text = MULTISPACE_RE.sub(" ", text).strip()
    tokens = text.split(" ")
    stop = STOP_PT | STOP_EN
    return [t for t in tokens if t and t not in stop and len(t) > 2]
