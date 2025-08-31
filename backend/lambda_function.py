import json
import base64
from urllib.parse import parse_qs

ALLOWED_ORIGIN = "*"  

def _json_response(status_code: int, data: dict):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
        "body": json.dumps(data, ensure_ascii=False),
    }

def _parse_body(event):
    if not event.get("body"):
        return {}
    body_bytes = event["body"]
    if event.get("isBase64Encoded"):
        body_bytes = base64.b64decode(body_bytes)
    else:
        body_bytes = body_bytes.encode("utf-8")

    
    try:
        return json.loads(body_bytes.decode("utf-8"))
    except Exception:
        pass
    
    try:
        form = parse_qs(body_bytes.decode("utf-8"))
        return {k: (v[0] if isinstance(v, list) and v else "") for k, v in form.items()}
    except Exception:
        return {}

def _body_size(event):
    if event.get("isBase64Encoded"):
        return len(base64.b64decode(event.get("body") or b""))
    return len((event.get("body") or "").encode("utf-8"))

def _header(event, name, default=None):
    hdrs = { (k or "").lower(): v for k, v in (event.get("headers") or {}).items() }
    return hdrs.get(name.lower(), default)

def handler(event, context):
    method = (event.get("requestContext", {}).get("http", {}).get("method") or "GET").upper()
    path = event.get("rawPath", "/") or "/"

    # aceitar prefixo /api
    if path == "/api":
        path = "/"
    elif path.startswith("/api/"):
        path = path[4:]

    # Pré-flight CORS
    if method == "OPTIONS":
        return _json_response(200, {"ok": True})

    if path == "/health" and method == "GET":
        return _json_response(200, {"ok": True})

    # classificar texto
    if path in ("/classify", "/classify-email", "/analyze") and method == "POST":
        data = _parse_body(event)
        chosen_lang = (data.get("language") or _header(event, "x-user-lang") or "auto")
        return _json_response(200, {
            "category": "Produtivo",
            "confidence": 0.91,
            "language": chosen_lang,
            "suggested_reply": "Olá! Obrigado pelo retorno. Podemos avançar ainda esta semana. Abraços.",
        })

    # NOVO: classificar arquivo (FormData)
    if path in ("/classify-file", "/classify_file", "/analyze-upload") and method == "POST":
        size = _body_size(event)  # não extraímos o conteúdo; só simulamos a classificação
        chosen_lang = _header(event, "x-user-lang") or "auto"
        return _json_response(200, {
            "category": "Produtivo",
            "confidence": 0.90,
            "language": chosen_lang,
            "suggested_reply": "Olá! Obrigado pelo retorno. Podemos avançar ainda esta semana. Abraços.",
            "meta": {"received_bytes": size}
        })

    # upload simples (eco)
    if path in ("/upload", "/file") and method == "POST":
        size = _body_size(event)
        return _json_response(200, {"received_bytes": size})

    return _json_response(404, {"error": "Not found"})
