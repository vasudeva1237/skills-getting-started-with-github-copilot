# Guidance for AI coding agents — skills-getting-started-with-github-copilot

Summary
- Small single-repo FastAPI + static frontend example used for exercises.
- Backend: `src/app.py` (FastAPI app, in-memory data store).
- Frontend: static files under `src/static/` (`index.html`, `app.js`, `styles.css`).

What you need to know (big picture)
- The app is a minimal FastAPI server that mounts static assets and exposes two main API surfaces:
  - `GET /activities` — returns the in-memory `activities` dict in `src/app.py`.
  - `POST /activities/{activity_name}/signup?email=...` — appends an email to the activity's `participants`.
- The root `/` redirects to `/static/index.html`. The static client calls the above endpoints with relative URLs.
- There is no persistent database: `activities` is an in-memory Python dict. State is lost when the process restarts.

How to run (developer workflow)
1. Create a virtualenv and install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Run the dev server (module path is `src.app:app`):

```bash
python -m uvicorn src.app:app --reload --host 127.0.0.1 --port 8000
```

3. Open the UI at `http://127.0.0.1:8000/static/index.html` or call API endpoints directly.

Quick API example (curl)

```bash
curl http://127.0.0.1:8000/activities
curl -X POST "http://127.0.0.1:8000/activities/Chess%20Club/signup?email=alice@mergington.edu"
```

Project-specific conventions & patterns
- Single-file FastAPI app: most logic lives in `src/app.py`. When changing behavior, update `activities` and corresponding JS in `src/static/app.js` together.
- Static assets are served from `src/static` via `app.mount(...)` in `src/app.py`. Frontend expects relative paths and uses `fetch('/activities')` and `fetch('/activities/{name}/signup?...')`.
- Minimal dependency set: `requirements.txt` only lists `fastapi` and `uvicorn`.
- Tests: `pytest.ini` is present but there are no tests in the repo; if you add tests, keep them under `tests/` and run with `pytest`.

Areas to watch / common pitfalls
- Concurrency & persistence: in-memory `activities` is not safe or persistent across multiple workers/processes; avoid assuming state is shared.
- Input validation: signup simply appends the `email` string. Consider deduplication and validation if adding features.
- URL encoding: activity names with spaces are used in routes (see `Chess Club`); callers must URL-encode path segments (frontend uses `encodeURIComponent`).

Files to inspect for edits or context
- `src/app.py` — primary API and static mounting.
- `src/static/app.js` — frontend interaction with API; mirrors backend shape.
- `src/static/index.html` — simple UI and form that demonstrates expected API behavior.
- `requirements.txt` — minimal runtime deps.

If you edit behavior
- When adding or modifying endpoints, update `src/static/app.js` if the frontend depends on changed JSON shapes or routes.
- When adding dependencies, update `requirements.txt` and include installation instructions in `README.md`.

What I (the agent) will ask you next
- Do you want stricter input validation, a persistent datastore, or automated tests added as next steps?

If anything here is incomplete or you want a different focus, tell me which area to expand (tests, persistence, input validation, CI).
