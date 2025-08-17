# AI Meeting Notes Summarizer — Approach, Process & Tech Stack

## Goal
Upload/paste a transcript, add a custom instruction, get a structured AI summary you can edit, and send via email.

## Architecture (Minimal)
- **Frontend**: Single HTML + vanilla JS.
- **Backend**: Flask with two endpoints:
  - `POST /api/summarize` (Groq call)
  - `POST /api/send-email` (SendGrid or SMTP)
- **AI**: Groq `llama-3.1-70b-versatile` (configurable).
- **Deploy**: Render (free) via `render.yaml` + Gunicorn.

## Flow
1. Upload/paste transcript.
2. Provide custom instruction.
3. Click **Generate Summary** → backend prompts Groq with a structured schema.
4. Editable Markdown is returned.
5. Enter recipients → **Send Email**.

## Prompt
- System prompt enforces sections: Title, Exec Summary, Decisions, Action Items (owner/due), Risks, Next Steps.
- Low temperature for stable outputs; Markdown for simple editing.

## Security
- Use environment variables for secrets.
- Avoid logging transcripts in production.
- Validate email addresses; basic size limits for payloads.
- Optional: add CORS, rate limiting, and auth if public.

## Testing
- Unit test emailer with stub.
- Manual UI tests with sample transcripts and varying instructions.

## Alternatives
- FastAPI + React (overkill for this brief).
- Using Gmail API directly instead of SMTP.
- File storage + shareable links for version history (future work).
