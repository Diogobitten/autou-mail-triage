from typing import List, Optional, Literal
from pydantic import BaseModel, Field

Category = Literal["Produtivo", "Improdutivo"]

class ClassifyRequest(BaseModel):
    subject: Optional[str] = None
    body: str
    sender: Optional[str] = None
    recipients: Optional[List[str]] = None
    language: Optional[str] = Field(default="auto")  # auto | pt | en

class ClassifyResponse(BaseModel):
    category: Category
    confidence: float = Field(ge=0.0, le=1.0)
    suggested_reply: str
    language: str
    tokens: Optional[List[str]] = None
    meta: Optional[dict] = None
