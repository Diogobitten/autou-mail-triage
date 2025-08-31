import json
import os
import re
from typing import Tuple, Optional, Dict
from openai import OpenAI, APIConnectionError, RateLimitError, AuthenticationError, BadRequestError
from .config import OPENAI_MODEL


def _get_client():
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        return None
    try:
        return OpenAI(api_key=api_key)
    except Exception:
        return None


LANG_MAP: Dict[str, Dict[str, str]] = {
    "pt": {
        "name": "Português do Brasil",
        "short": "pt-BR",
        "improd": "Este e-mail foi classificado como Improdutivo. Portanto, não será gerada uma resposta sugerida.",
        "team": "Equipe de Atendimento",     
    },
    "en": {
        "name": "English",
        "short": "en",
        "improd": "This email has been classified as Unproductive. Therefore, no suggested reply will be generated.",
        "team": "Support Team",              
    },
}

def sanitize_lang(lang: Optional[str]) -> str:
    if not lang:
        return "pt"
    l = lang.strip().lower()
    if l in ("pt", "pt-br", "pt_br"): return "pt"
    if l.startswith("en"): return "en"
    if l == "auto": return "pt"
    return "pt"


CLS_SYSTEM = """
(Temperatura=0.6)
Você é um classificador de e-mails para uma grande instituição do setor financeiro (banco/serviços financeiros).
Responda **somente** em JSON, exatamente neste formato:
{"category":"Produtivo|Improdutivo","confidence":0.0-1.0}

Objetivo: separar rapidamente o que requer ação operacional/atendimento (Produtivo) do que é irrelevante ou sem ação (Improdutivo).

Definições gerais:
- Produtivo: tratativas de clientes ou parceiros, currículo, solicitações com ação clara, temas de compliance/risco, prazos, reuniões, propostas/contratos, faturas/cobranças, suporte técnico, incidentes, onboarding/KYC, auditoria, reportes regulatórios (ex.: BACEN, CVM), temas de segurança (fraude, phishing, chargeback, disputa), LGPD/privacidade (acesso/retificação/exclusão de dados).
- Improdutivo: spam, correntes, promoções irrelevantes, envio massivo sem contexto, conversa social sem ação, divulgação genérica, newsletters não solicitadas, conteúdo suspeito/iscas (sem identificação, anexos estranhos, links encurtados) quando não houver pedido claro.

Sinais de PRODUTIVO: pedido/ação ou prazo claro; cita conta/contrato/transação/ticket/ID; envolve obrigação regulatória/compliance/jurídico/risco/segurança.
Sinais de IMPRODUTIVO: promoção genérica; felicitações sem relação de negócio; pedido vago; marketing puro; mensagens repetitivas sem call-to-action.

Regras:
- Não invente dados. Classifique usando apenas o conteúdo recebido.
- Se houver indício de fraude/phishing **sem** ação clara, classifique como Improdutivo (tratado fora do fluxo).
- A confiança deve refletir a clareza dos sinais (0.0 a 1.0).
- **Não** inclua nada além do JSON pedido (sem comentários/explicações).
"""

def gen_system_for(lang_code: str) -> str:
    cfg = LANG_MAP[lang_code]
    signature = ("Best regards,\n" + cfg["team"]) if lang_code == "en" else ("Atenciosamente,\n" + cfg["team"])
    example_greeting = "Hi," if lang_code == "en" else "Olá,"

    return f"""
Você redige respostas **curtas, objetivas e educadas** para e-mails classificados como Produtivo em uma grande instituição do setor financeiro.
Saída **somente** como JSON, exatamente neste formato:
{{"suggested_reply":"<corpo_do_email_em_texto_puro_sem_assunto>"}}

Regras GERAIS:
- Forneça esses dados quando for necessário ou solicitado: Site da empresa é www.financecorp.com.br (Brasil) e www.financecorp.com (internacional). Telefone para contato: +55 11 4002-8922 (Brasil) e +1 800 123 4567 (EUA).
- **Responda sempre em {cfg['name']}** (não mude o idioma).
- Tom profissional, cordial e direto; sem jargões desnecessários.
- **Não** compartilhe dados sensíveis (LGPD). Peça apenas o mínimo (ex.: ID do ticket, últimos 4 dígitos, CPF mascarado).
- **Não** prometa prazos rígidos ou garantias; use linguagem de melhor esforço.
- Se houver suspeita de fraude/riscos, indique canal seguro e evite links/senhas.

FORMATO (texto puro), **sem linha de assunto**:
1) Saudação (ex.: "{example_greeting}")
2) Corpo em 1 a 3 frases objetivas
3) Fechamento e assinatura:

{signature}
""".strip()


def classify_only(body_text: str, subject: Optional[str], language: str = "pt") -> Tuple[str, float]:
    client = _get_client()
    if client is None:
        txt = f"{subject or ''} {body_text}".lower()
        cat = "Improdutivo" if any(w in txt for w in ["feliz", "oferta", "promo", "desconto", "sorteio"]) else "Produtivo"
        return cat, 0.55

    user = (
        f"Assunto: {subject or '(sem)'}\n"
        f"Conteúdo:\n{body_text}\n\n"
        "Classifique e responda estritamente no esquema JSON indicado."
    )
    try:
        r = client.chat.completions.create(
            model=OPENAI_MODEL,
            temperature=0.0,
            messages=[
                {"role": "system", "content": CLS_SYSTEM},
                {"role": "user", "content": user},
            ],
            response_format={"type": "json_object"},
            timeout=20,
        )
        parsed = json.loads(r.choices[0].message.content)
        cat = parsed.get("category", "Produtivo")
        conf = float(parsed.get("confidence", 0.5))
        return cat, conf
    except (AuthenticationError, BadRequestError, RateLimitError, APIConnectionError):
        return "Produtivo", 0.5
    except Exception:
        return "Produtivo", 0.5


def _strip_subject_lines(text: str) -> str:
    
    if not text:
        return ""
    lines = []
    for ln in text.splitlines():
        if re.match(r"^\s*(assunto|subject)\s*:", ln, flags=re.I):
            continue
        lines.append(ln)
    return "\n".join(lines).strip()


def generate_reply(body_text: str, subject: Optional[str], language: str = "pt") -> str:

    client = _get_client()
    lang_code = sanitize_lang(language)
    cfg = LANG_MAP[lang_code]

    # Fallback simples (quando OpenAI indisponível/timeout)
    fallback_core = (
        "Hi,\n\nOur AI service is temporarily unavailable. Please try again later.\n\n"
        if lang_code == "en"
        else "Olá,\n\nNosso serviço de IA está temporariamente indisponível. Tente novamente mais tarde.\n\n"
    )
    fallback_signature = ("Best regards,\n" + cfg["team"]) if lang_code == "en" else ("Atenciosamente,\n" + cfg["team"])
    fallback_body = fallback_core + fallback_signature

    if client is None:
        return fallback_body

    system = gen_system_for(lang_code)
    user = (
        f"IDIOMA DA RESPOSTA: {cfg['name']} ({cfg['short']}). Responda somente neste idioma.\n\n"
        f"Assunto original (apenas contexto, NÃO inclua na resposta): {subject or '(sem)'}\n"
        f"Conteúdo do email recebido:\n{body_text}\n\n"
        "Gere o corpo do e-mail (saudação, 1–3 frases objetivas e assinatura), "
        "SEM linha de assunto. Retorne somente JSON no formato especificado."
    )

    try:
        r = client.chat.completions.create(
            model=OPENAI_MODEL,
            temperature=0.2,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            response_format={"type": "json_object"},
            timeout=25,
        )
        parsed = json.loads(r.choices[0].message.content)
        reply = (parsed.get("suggested_reply") or "").strip()
        reply = _strip_subject_lines(reply) 
        return reply or fallback_body
    except Exception:
        return fallback_body
