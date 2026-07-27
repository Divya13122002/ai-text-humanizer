# AI Text Humanizer
 
Rewrite AI-generated text to sound human, bypass AI detectors, and preserve meaning. Built with Next.js, React, and Tailwind CSS. Uses the Groq API (free tier).
 
## Features
 
- **Humanize AI text** — Paste any AI-generated text and get a natural-sounding rewrite
- **5 tone options** — Natural, Professional, Conversational, Simple, Creative
- **Side-by-side comparison** — Toggle between original and humanized text
- **Word/character counts** — Real-time stats for both input and output
- **Dark/light mode** — Respects system preference with manual toggle
- **Copy to clipboard** — One-click copy for the humanized output
- **Free to use** — No API key required from users
 
## Getting Started
 
### 1. Clone and install
 
```bash
git clone https://github.com/your-username/ai-text-humanizer.git
cd ai-text-humanizer
npm install
```
 
### 2. Set the API key
 
Create a `.env.local` file in the project root:
 
```bash
API_KEY=your-groq-api-key
```
 
> **Get a free API key** at [console.groq.com/keys](https://console.groq.com/keys).
> Free tier works for this app.
 
### 3. Run locally
 
```bash
npm run dev
```
 
Open [http://localhost:3000](http://localhost:3000).
 
## Deploy to Vercel
 
1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. In your project dashboard, go to **Settings → Environment Variables**.
4. Add `API_KEY` with your Groq API token.
5. Deploy. No other configuration needed — `vercel.json` is included.
 
## How It Works
 
- The frontend sends text and tone selection to `/api/humanize`.
- The server-side API route reads `process.env.API_KEY` (never exposed to the client).
- The route calls the **Groq API** with Llama 3.1 8B (falls back to Gemma 2 9B on rate limits).
- The response is cleaned, post-processed, and returned to the client.
 
## Environment Variables
 
| Variable  | Required | Description                    |
| --------- | -------- | ------------------------------ |
| `API_KEY` | Yes      | Groq API token (free tier)     |
 
## Tech Stack
 
- **Frontend**: React 18, Tailwind CSS 3
- **Backend**: Next.js 14 App Router (API route)
- **AI Models**: Llama 3.1 8B Instant (primary), Gemma 2 9B (fallback)
- **Deployment**: Vercel (zero-config)