# NAATI CCL Malayalam Coach

A private, unofficial preparation tool for candidates taking the NAATI CCL (Credentialled Community Language) test in Malayalam.

> **Disclaimer:** This app is not affiliated with, endorsed by, or a replacement for official NAATI assessment. All scores displayed are AI-estimated practice scores only. Only NAATI examiners can issue official scores. See [NAATI's official site](https://www.naati.com.au/migration-assessments/ccl/).

---

## What's Included

- **6 full mock tests** — 2 dialogues each, 8–12 segments per dialogue (≤35 words/segment), alternating English/Malayalam speakers
- **Topics covered:** Health/hospital, Housing/tenancy, Employment/workplace rights, Legal/police, Immigration/settlement, Education & Social Services
- **Full exam simulator** — plays segment audio, chime, 5-second countdown, candidate recording
- **Practice mode** — segment-by-segment practice with feedback and model answers
- **4 drills** — Numbers & Names, 5-Second Start, Memory Without Notes, Shadowing
- **68+ vocabulary terms** — with Malayalam script, romanisation, examples, and common mistakes
- **7-day study plan** targeting 85/90
- **Comprehensive study material** — format guide, score strategy, note-taking symbols, templates
- **AI-estimated scoring** — NAATI-style deduction rubric (accuracy, completeness, language quality, register, delivery, repeat policy)
- **Manual transcript fallback** — if no transcription API is configured, type what you said for demo scoring
- **Dashboard** — tracks scores, progress, recording count, and study streak
- **Microphone test** — live volume meter and recording/playback test

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="file:./dev.db"
APP_ACCESS_PASSWORD=""             # leave blank locally (no login page)
TRANSCRIPTION_PROVIDER=""          # "assemblyai" or "openai" (optional)
TRANSCRIPTION_API_KEY=""           # API key for transcription provider
SCORING_PROVIDER=""
SCORING_API_KEY=""
TTS_PROVIDER=""
TTS_API_KEY=""
UPLOAD_DIR="./uploads"
NEXT_PUBLIC_APP_NAME="NAATI CCL Malayalam Coach"
```

### 3. Set up database

```bash
npx prisma db push
npm run seed
```

This creates the SQLite database and seeds it with 6 mock tests, 68+ vocabulary terms, and the default user profile.

### 4. Generate chime sound

```bash
npm run generate-audio
```

This creates `public/sounds/chime.mp3` (a generated WAV chime).

### 5. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## GitHub Codespaces Setup

> **Why not GitHub Pages?**
> This app cannot be hosted on GitHub Pages. GitHub Pages only serves static files. This app requires a Node.js server for API routes, a SQLite database, server-side audio upload and storage, and AI scoring APIs. You must run it as a Node.js server — GitHub Codespaces is the easiest way to do that from a browser.

### Step 1 — Push to a private GitHub repository

```bash
cd /path/to/your/NAATI
git init
git add .
git commit -m "Initial commit"
gh repo create naati-ccl-coach --private --source=. --push
```

Or create the repo on GitHub.com and push manually.

### Step 2 — Open in GitHub Codespaces

1. Go to your repository on GitHub.
2. Click the **Code** button → **Codespaces** tab → **Create codespace on main**.
3. Wait for the Codespace to start. The `.devcontainer` configuration automatically runs `npm install`, `npx prisma db push`, and `npm run seed`.

### Step 3 — Create your `.env`

In the Codespaces terminal:

```bash
cp .env.example .env
```

Edit `.env` in the file explorer and set:

```env
DATABASE_URL="file:./dev.db"
APP_ACCESS_PASSWORD="choose-a-strong-password"
UPLOAD_DIR="./uploads"
```

> **Set `APP_ACCESS_PASSWORD`** whenever the app is running in Codespaces. Even with port visibility set to Private, a password ensures your recordings and scores stay protected.

### Step 4 — Generate chime audio

```bash
npm run generate-audio
```

### Step 5 — Start the app

```bash
npm run dev
```

### Step 6 — Open the forwarded port

1. In VS Code / Codespaces, open the **Ports** panel (bottom bar or View → Ports).
2. Find port **3000** and click **Open in Browser**.

### Step 7 — Set port visibility to Private

In the **Ports** panel, right-click port 3000 → **Port Visibility** → **Private**.

This ensures only people signed into your GitHub account can reach the forwarded URL.

### Step 8 — Microphone access (HTTPS)

Codespaces forwards ports over HTTPS. The browser will prompt for microphone permission — click **Allow**. Microphone access works correctly because the connection is secure. If you use the plain `http://` URL instead of the Codespaces `https://` forwarded URL, the browser will block microphone access.

### Backing up before destroying a Codespace

Codespaces storage is **not permanent**. Before stopping or deleting a Codespace, export your data:

1. Open `https://<your-codespace-url>/api/export` — downloads a JSON file with all attempts, scores, and transcripts.
2. Download the audio recordings folder:
   - In the Codespaces file explorer, right-click the `uploads/` folder → **Download**.
   - Or use `gh cs cp` to copy files locally.
3. Export the database: `cp dev.db ~/dev-backup.db` then download it via the file explorer.

---

## Password Protection

Set `APP_ACCESS_PASSWORD` in `.env` to enable a login page. Leave it blank to disable (suitable for local use on your own machine).

- All routes except `/api/health`, `/login`, and `/api/auth/*` are protected.
- The session lasts 30 days (cookie-based, stored only in the browser).
- Visit `/api/auth/logout` or clear cookies to sign out.

---

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server (binds to 0.0.0.0 for Codespaces) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run test` | Run unit tests (21 tests) |
| `npm run seed` | Seed database with mock tests and vocabulary |
| `npm run db:seed` | Alias for seed |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run generate-audio` | Generate chime sound file |

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check — returns `{ status: "ok", db: "ok" }` |
| `/api/export` | GET | Download full backup JSON (attempts, scores, transcripts, vocab) |
| `/api/auth/login` | POST | Log in with `APP_ACCESS_PASSWORD` |
| `/api/auth/logout` | POST | Clear session cookie |
| `/api/attempts` | GET, POST | List or create test attempts |
| `/api/recordings` | POST | Upload a recording |
| `/api/recordings/[id]/transcript` | POST | Submit transcript (manual or auto) |
| `/api/recordings/[id]/score` | POST | Score a transcript |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite path. Switch to `postgresql://...` for PostgreSQL |
| `APP_ACCESS_PASSWORD` | No | Set to enable password protection (recommended in Codespaces) |
| `TRANSCRIPTION_PROVIDER` | No | `assemblyai` or `openai` — enables auto audio transcription |
| `TRANSCRIPTION_API_KEY` | No | API key for chosen transcription provider |
| `TTS_PROVIDER` | No | Reserved for TTS audio generation |
| `TTS_API_KEY` | No | Reserved |
| `UPLOAD_DIR` | No | Directory for saving recordings (default: `./uploads`) |
| `NEXT_PUBLIC_APP_NAME` | No | App display name |

---

## What Is Fully Working

- ✅ `npm install` — all dependencies install cleanly
- ✅ `npm run dev` — development server starts (binds to 0.0.0.0 for Codespaces)
- ✅ Database seed — 6 mock tests, 68+ vocab terms, study progress
- ✅ All 6 mock tests visible with 2 dialogues and 8–12 segments each
- ✅ Exam simulator — segment audio (TTS fallback), chime, 5-second countdown, recording, upload
- ✅ Recording via `MediaRecorder` — MIME type selection (webm;codecs=opus → webm → mp4 → ogg), `ondataavailable` with 250ms interval, `onstop` flush
- ✅ Recording playback before submission
- ✅ Upload progress and retry on failure
- ✅ Manual transcript fallback (when no API configured)
- ✅ AI-estimated scoring using deduction rubric
- ✅ Score report — segment breakdown, dialogue scores, pass/fail, top actions
- ✅ Practice mode — any segment, immediate feedback
- ✅ 4 drills (Numbers, 5-Second Start, Memory, Shadowing)
- ✅ 7-day study plan with day completion tracking
- ✅ 68+ vocabulary terms (Malayalam script) — searchable and filterable
- ✅ Dashboard — scores, progress, recording count, study streak
- ✅ Microphone test — permission check, live volume meter, record/playback
- ✅ Settings — API status, privacy info
- ✅ Official NAATI resource links
- ✅ Password protection via `APP_ACCESS_PASSWORD`
- ✅ `/api/health` endpoint
- ✅ `/api/export` — full JSON data backup
- ✅ GitHub Codespaces — `.devcontainer` with auto-setup
- ✅ 21 unit tests — all passing
- ✅ TypeScript — zero errors

---

## What Requires an External API Key

### Automatic audio transcription

Without a transcription provider configured, the app **does not** silently fake scoring. Instead:
- After recording, a text box appears asking the candidate to type what they said
- Scoring runs on the manually entered text
- A clear notice is shown: "Audio transcription provider not configured. Enter transcript manually for demo scoring."

To enable automatic transcription:
- **AssemblyAI** (recommended): Set `TRANSCRIPTION_PROVIDER=assemblyai` and `TRANSCRIPTION_API_KEY=your_key`
- **OpenAI Whisper**: Set `TRANSCRIPTION_PROVIDER=openai` and `TRANSCRIPTION_API_KEY=your_key`

### Realistic mock audio (TTS)

The app uses browser `SpeechSynthesis` as a fallback for segment audio. For Malayalam segments, if no Malayalam voice is installed on the device, the segment text is shown to read aloud manually.

For real audio: generate audio files using a TTS provider and place them in `public/audio/mock-tests/`. The `audioFilePath` field on each segment in the database points to the file.

---

## Known Limitations

1. **Malayalam TTS voice** — browser SpeechSynthesis rarely has a Malayalam voice. Users see the segment text to read aloud and must trigger the recording manually.
2. **AI scoring accuracy** — the rubric is a simplified approximation of NAATI's deduction method. It detects length ratio anomalies, missing numbers, missing names, hesitation markers, and delivery timing — but cannot evaluate semantic meaning, language quality, or fluency as accurately as a human examiner.
3. **Transcription of Malayalam** — most transcription APIs (AssemblyAI, Whisper) have limited Malayalam accuracy. English interpretations will transcribe better. This is a known limitation of current speech-to-text technology.
4. **Single user** — MVP is designed for one local user (`default-user`). Multi-user support requires adding authentication (e.g., NextAuth) and updating all `userId` references.
5. **No proctoring** — this is a practice tool, not an exam proctoring system.
6. **Scores are estimates** — this is stated clearly throughout the UI. Do not use app scores to assess exam readiness definitively.
7. **Codespaces storage is ephemeral** — export your data before destroying a Codespace. See the backup instructions above.

---

## Switching to PostgreSQL

1. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://user:pass@localhost:5432/naati_coach"
   ```
2. Update `prisma/schema.prisma` datasource provider to `postgresql`.
3. Run `npx prisma migrate dev`.

---

## Architecture

```
src/
  app/                    # Next.js App Router pages and API routes
    api/
      health/             # GET /api/health
      export/             # GET /api/export — data backup
      auth/login/         # POST /api/auth/login
      auth/logout/        # POST /api/auth/logout
      attempts/           # test attempt management
      recordings/         # audio upload, transcript, scoring
      mock-tests/         # mock test queries
      vocabulary/         # vocab queries
      user/               # user profile and study progress
    mock-tests/           # Mock test list, detail, exam simulator
    attempts/             # Score reports
    login/                # Password login page
    practice/             # Practice mode and drills
    study-plan/           # 7-day plan
    study-material/       # Study guides
    vocabulary/           # Vocabulary bank
    recording-test/       # Microphone test
    settings/             # Configuration status
    official-resources/   # NAATI links
  middleware.ts           # Password protection (APP_ACCESS_PASSWORD)
  components/
    exam/                 # AudioPlayer, RecordingPanel
    layout/               # Navbar
    ui/                   # Badge, Button, Card, Progress, Timer
  lib/
    prisma.ts             # Prisma client singleton
    cn.ts                 # className utility
    providers/            # TranscriptionProvider interface + implementations
    scoring/              # NAATI-style deduction rubric
  types/                  # TypeScript type definitions
.devcontainer/
  devcontainer.json       # GitHub Codespaces configuration
prisma/
  schema.prisma           # Database schema
  seed.ts                 # Database seeder
  seedData/               # Mock test and vocabulary data
scripts/
  generate-chime.ts       # WAV chime generator
public/
  sounds/chime.mp3        # Chime sound
  audio/mock-tests/       # (empty) for future TTS audio files
uploads/                  # Candidate recordings (local / Codespaces)
```

---

## Official NAATI Resources

- [CCL Overview](https://www.naati.com.au/migration-assessments/ccl/)
- [Candidate Instructions](https://www.naati.com.au/resources/candidate-instructions-ccl/)
- [Practice Materials by Language](https://www.naati.com.au/migration-assessments/ccl/downloadable-ccl-practice-materials-by-language/)
- [Online Practice Test](https://www.naati.com.au/ccl-practice-test/)

---

*This app is a private preparation tool built for study purposes. It is not affiliated with, endorsed by, or sponsored by NAATI.*
