# AskLio - AI Chatbot

A modern AI chatbot application built with React, FastAPI, and SQLite.

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Edit .env with your API key
uvicorn app.main:app --reload --port 8000