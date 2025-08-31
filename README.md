# 📧 AutoU Mail Triage  

Um sistema de classificação automática de e-mails que separa mensagens Produtivas e Improdutivas, além de sugerir respostas automáticas usando IA (OpenAI).

- App (Amplify): https://main.d3l1x3np6g7b9p.amplifyapp.com/

---
📸 Preview

![mailtriage](https://github.com/user-attachments/assets/7575bdc0-81ae-4061-864f-10527117fff3)

---

## ✨ Funcionalidades
- 🔍 Classificação automática de e-mails (**Produtivo / Improdutivo**)  
- 🤖 Sugestão de respostas curtas e objetivas  
- 📊 Gráfico/histórico no front
- ☁️ Backend serverless (AWS Lambda + API Gateway) com FastAPI + Mangum  
- 🔐 Integração com API OpenAI  
- 🎨 Interface responsiva em **React + Tailwind**  

---

## 🛠️ Tecnologias

### Frontend
- ⚛️ React + Vite  
- 🎨 Tailwind CSS  
- 📦 🔗 Fetch API para falar com o backend  

### Backend
- 🐍 Python 3.11  
- ⚡ FastAPI + Mangum (adapter para AWS Lambda)
- 🧠 OpenAI (Chat Completions)
- 📄 pypdf
- 📦 Empacotamento/Deploy com AWS SAM

---

## 📂 Estrutura do Projeto

autou-mail-triage/
```bash
autou-mail-triage/
├── autou-mail-triage-ui/         # Frontend (Vite/React)
│   ├── src/
│   │   ├── components/
│   │   ├── services/             # api.js usa VITE_API_URL
│   │   └── ...
│   ├── .env.development          # VITE_API_URL=...
│   └── ...
└── backend/                      # Backend (FastAPI + SAM)
    ├── app/
    │   ├── __init__.py
    │   ├── config.py
    │   ├── main.py               # FastAPI app + rotas
    │   ├── models.py
    │   ├── nlp.py
    │   ├── openai_client.py
    │   └── pdf.py                # extração via pypdf
    ├── handler.py                # Mangum(app) → entrypoint da Lambda
    ├── requirements.txt
    ├── template.yaml             # SAM/CloudFormation (Lambda + HTTP API)
    └── samconfig.toml            # args salvos do `sam deploy --guided` (opcional)

```

---
## 🔧 Variáveis de ambiente
### Backend (Lambda → Configuration → Environment variables)
- OPENAI_API_KEY → sua chave da OpenAI (obrigatória)
- OPENAI_MODEL → ex.: gpt-4o-mini (opcional)

### Frontend (Amplify → Environment variables)

VITE_API_URL → https://pxaxcgyhai.execute-api.us-east-1.amazonaws.com

No Vite, somente variáveis que começam com VITE_ vão para o bundle.

---

## ⚙️ Como rodar localmente

### 1️⃣ Clonar o repositório
```bash
git clone https://github.com/Diogobitten/autou-mail-triage.git
cd autou-mail-triage
````
### 2️⃣ Backend
```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
# crie .env local se quiser, ou exporte OPENAI_API_KEY no ambiente

# Se tiver uvicorn instalado:
# pip install "uvicorn[standard]"
uvicorn app.main:app --reload --port 8000
```
Endpoints locais (por padrão): http://127.0.0.1:8000/health, /classify, /classify-file.

### 3️⃣ Frontend
```bash
cd autou-mail-triage-ui
cp .env.development .env.development.local  # opcional
# edite VITE_API_URL para http://127.0.0.1:8000 se for testar local
npm install
npm run dev
```
Acesse: http://localhost:5173

---
## ☁️ Deploy (AWS Free Tier)
### Backend (SAM → Lambda + API Gateway)

Pré-requisitos: AWS CLI configurado e AWS SAM CLI instalado.
```bash
cd backend
sam build -t template.yaml
sam deploy --guided

````
Responda ao wizard (stack name, região, etc.). No fim, copie o ApiUrl (ex.: https://pxaxcgyhai.execute-api.us-east-1.amazonaws.com).

Windows: se sam não estiver no PATH, use
"C:\Program Files\Amazon\AWSSAMCLI\bin\sam.cmd" build -t template.yaml
"C:\Program Files\Amazon\AWSSAMCLI\bin\sam.cmd" deploy

Depois do deploy:

1. Na Lambda, configure OPENAI_API_KEY (e demais variáveis).

2. (Opcional) Aperte CORS no template.yaml:
```bash
CorsConfiguration:
  AllowOrigins:
    - "https://main.d3l1x3np6g7b9p.amplifyapp.com"
  AllowMethods: ["*"]
  AllowHeaders: ["*"]

```
e rode sam deploy de novo.

### Frontend (Amplify Hosting)

1. Conecte o repositório/branch.
2. Em Environment variables, defina:
 - VITE_API_URL = https://pxaxcgyhai.execute-api.us-east-1.amazonaws.com
3. Build command: npm run build
4. Output dir: dist
5. (Monorepo) App root: autou-mail-triage-ui
6. Publique.

---
 🤝 Contribuição

Contribuições são super bem-vindas!
Faça um fork, crie sua branch (git checkout -b feature/nova-feature) e abra um PR 🚀




