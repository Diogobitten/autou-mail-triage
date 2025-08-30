# 📧 AutoU Mail Triage  

Um sistema de **classificação automática de e-mails** que separa mensagens **Produtivas** e **Improdutivas**, além de sugerir **respostas automáticas** usando IA.  
Construído com **React + Vite + Tailwind** no front e **Python + OpenAI API** no back.

---
📸 Preview

![mailtriage](https://github.com/user-attachments/assets/7575bdc0-81ae-4061-864f-10527117fff3)

---

## ✨ Funcionalidades
- 🔍 Classificação automática de e-mails (**Produtivo / Improdutivo**)  
- 🤖 Sugestão de respostas curtas e objetivas  
- 📊 Dashboard com estatísticas e gráficos de histórico  
- ☁️ Integração com API OpenAI  
- 🎨 Interface responsiva em **React + Tailwind**  

---

## 🛠️ Tecnologias

### Frontend
- ⚛️ React + Vite  
- 🎨 Tailwind CSS  
- 📦 Axios para comunicação com backend  

### Backend
- 🐍 Python 3.11+  
- ⚡ FastAPI (ou Flask, ajuste conforme usado)  
- 🔑 OpenAI API  
- 📦 Requirements em `backend/requirements.txt`

---

## 📂 Estrutura do Projeto

autou-mail-triage/
```bash
├── autou-mail-triage-ui/ # Frontend React
│ ├── src/components # Componentes reutilizáveis
│ ├── public/ # Assets
│ └── ...
└── backend/ # Backend em Python
├── app/ # Código principal (config, models, nlp, etc.)
├── handler.py
├── requirements.txt
└── .env.example # Variáveis de ambiente (sem segredos!)
```

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
source .venv/bin/activate   # (Linux/Mac)
.venv\Scripts\activate      # (Windows)

pip install -r requirements.txt
cp .env.example .env
# Edite o .env e coloque sua OPENAI_API_KEY
python app/main.py
```
### 3️⃣ Frontend
```bash
cd autou-mail-triage-ui
npm install
npm run dev
```
O frontend roda em http://localhost:5173

---

🚀 Roadmap

 - Melhorar UI da triagem

 - Exportar resultados em CSV

 - Deploy em cloud (Heroku/AWS/Render)

 ---

 🤝 Contribuição

Contribuições são super bem-vindas!
Faça um fork, crie sua branch (git checkout -b feature/nova-feature) e abra um PR 🚀

---
📜 Licença

Distribuído sob a licença MIT. Veja LICENSE para mais detalhes.

---
```bash
👉 Dica: dá pra deixar ainda mais maneiro adicionando **badges** (status do GitHub Actions, versão Node/Python, etc.) e um **banner** no topo.  

Quer que eu já monte um banner em imagem (tipo logo + título estilizado pro seu projeto) pra você colocar no começo do README?

 ```


