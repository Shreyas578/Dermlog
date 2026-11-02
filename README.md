# Dermlog — Precision Skin-Health Diary & Dermatologist Handoff Web App

A local agentic medical workstation designed for high-performance clinical tracking, optical facial biomarker quantification, automated week-over-week inflection surveillance, and LLM-synthesized handoff reports.

Built with **Next.js (App Router, TypeScript)**, **Tailwind CSS**, **Prisma ORM (SQLite / MySQL)**, **Recharts**, **jsPDF**, **YouCam Skin AI API (Mocked with live scenario presets)**, and **Open-Source Clinical Reasoning AI API (Groq Llama 3.1 8B / OpenRouter / Local Fallback)**.

---

## 🛠️ Architecture Overview

```
[ Weekly Selfie / Simulation ] 
            │
            ▼
[ YouCam Skin AI API ] ───▶ [ 5 Telemetric Scores: Redness, Texture, Acne, Hydration, Dark Spots ]
            │
            ▼
[ Local Database (Prisma) ]
            │
            ▼
[ Inflection Surveillance Engine ] 
   - Redness increase > 10% over consecutive scans -> "redness trend"
   - Acne count increase >= 3 in single scan -> "breakout cluster"
   - Hydration decrease >= 15% -> "hydration drop"
            │
            ▼ (If any flag triggered)
[ Clinical Reasoning Engine (Open-Source Llama 3.1 8B API) ]
   - Extracts 6-scan rolling telemetry window
   - Pulls patient intervention events (e.g. "Started Tretinoin")
   - Generates 150-200 word clinical handoff note (strictly observational, non-diagnostic)
            │
            ▼
[ Interactive Longitudinal Dashboard & Clean PDF Export (jsPDF) ]
```

---

## 🚀 Quickstart Guide (Local Hackathon Setup)

### 1. Prerequisites
- **Node.js** (v18+ or v20+, tested on Node v22)
- **Git**

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Configuration

Dermlog is preconfigured with **SQLite** for instant zero-dependency local running. To inspect or reset the schema:
```bash
npx prisma db push
```

#### *(Optional) Running with Local MySQL instead of SQLite*
If you prefer running local MySQL server (e.g., MySQL 8 or XAMPP / MariaDB):
1. Create a MySQL database:
   ```sql
   CREATE DATABASE dermlog;
   ```
2. Edit `.env`:
   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/dermlog"
   ```
3. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

---

### 4. Configure Free Open-Source Reasoning AI API

In `.env`, configure any of the following open-source model providers:

#### Option A: Groq (Recommended - Free & Instant Llama 3.1 8B)
1. Get a free API key at [console.groq.com](https://console.groq.com)
2. Add to `.env`:
   ```env
   GROQ_API_KEY="gsk_your_free_key_here"
   ```

#### Option B: OpenRouter (Free Open-Source Models)
1. Get an API key at [openrouter.ai](https://openrouter.ai)
2. Add to `.env`:
   ```env
   OPENROUTER_API_KEY="sk-or-your_free_key_here"
   ```

#### Option C: Local Ollama (Offline)
1. Install Ollama from [ollama.com](https://ollama.com)
2. Pull the Llama 3.1 8b model:
   ```bash
   ollama pull llama3.1:8b
   ```
3. Start Ollama:
   ```bash
   ollama serve
   ```
   *Note: If no API key or local Ollama is active, Dermlog automatically activates an embedded deterministic clinical handoff synthesis engine so demos never fail during judging.*

---

### 5. Plug in Real YouCam Skin AI API Key

The file `src/lib/youcam.ts` contains the function `callYouCamSkinAI`:
- Currently configured with randomized plausible baselines and interactive scenario presets (`breakout_flare`, `redness_flare`, `dryness_flare`, `normal`) for deterministic pitching.
- **To plug in real YouCam API calls**, replace the mock body in `src/lib/youcam.ts`:
  ```ts
  // TODO: Replace with real YouCam API call:
  const formData = new FormData();
  formData.append('image', fs.createReadStream(imagePath));
  const response = await fetch('https://api.perfectcorp.com/skin-ai/v1/analyze', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.YOUCAM_API_KEY}` },
    body: formData
  });
  return await response.json();
  ```

---

### 6. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🖥️ Application Pages

1. **`/` — Telemetry Dashboard**:
   - Vital statistics strip displaying latest scores.
   - Longitudinal multi-parameter line chart (Recharts) with user events plotted as vertical markers.
   - List of generated clinical handoff dossiers with expandable summaries.
   - **Download PDF** button generating a clean medical handoff sheet with embedded charts and raw data tables.

2. **`/upload` — Weekly Optical Scan**:
   - File upload interface with image preview.
   - 4-scenario simulation presets (Breakout flare, Redness trend, Hydration drop, Stable).
   - Real-time inflection rule calculation and immediate link to generated handoff summary.

3. **`/events` — Regimen & Intervention Log**:
   - Form to log new topical changes, actives, or routines.
   - Chronological table of past events.
