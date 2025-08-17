# AI Meeting Notes Summarizer (Flask + Groq)

A minimal full-stack app to upload/paste meeting transcripts, add a custom instruction, generate an AI summary, edit it, and share via email.

## Demo Flow
1. Upload `.txt` or paste transcript.
2. Enter a custom instruction (e.g., **Highlight only action items**).
3. Click **Generate Summary** → editable Markdown appears.
4. Edit if needed → enter recipients → **Send Email**.

## Tech Stack
- **Backend**: Flask (Python), Groq LLM (`llama-3.1-70b-versatile` by default)
- **Frontend**: Single HTML page + vanilla JS
- **Email**: SendGrid (recommended) or SMTP (Gmail App Password)
- **Deploy**: Render (free plan) with `render.yaml`

## Quick Start (Local)
```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # then edit with your keys
python server.py
# open http://localhost:8080
```

### Environment
Copy `.env.example` to `.env` and set:
- `GROQ_API_KEY`, optional `GROQ_MODEL`
- For email (choose one):
  - SendGrid: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` (verified)
  - SMTP: `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USE_TLS`

## API
### POST /api/summarize
**Body**:
```json
{ "transcript": "raw text", "instruction": "Summarize in bullet points for executives" }
```
**Response**:
```json
{ "summary_markdown": "..." }
```

### POST /api/send-email
**Body**:
```json
{
  "recipients": ["a@b.com","c@d.com"],
  "subject": "Meeting Summary - 2025-08-17",
  "body_markdown": "# Title\n- bullets..."
}
```
**Response**:
```json
{ "ok": true }
```

## Deploy to Render
- **Create** a new Web Service from this repo.
- **Build**: `pip install -r requirements.txt`
- **Start**: `gunicorn -w 2 -k gthread -t 120 server:app`
- **Env Vars** (at minimum): `GROQ_API_KEY` + either SendGrid or SMTP settings.
- **Open** the Render-provided URL → this is your **Deployed Link** to submit.

## Notes
- Frontend is deliberately minimal per the brief.
- Prompt enforces sections: Title, Exec Summary, Decisions, Action Items, Risks, Next Steps.
- Swap Groq for another provider by replacing the client call in `server.py`.

## Docs
See `docs/Approach.md` for approach, process, and rationale.
