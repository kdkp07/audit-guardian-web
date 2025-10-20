# AI-Powered Financial Compliance Dashboard

## Overview

This project is a **web-based platform** for monitoring financial compliance and health of companies. It integrates **real-time AI agent logs** with a dashboard displaying compliance results, financial health metrics, and detailed findings from multiple agents:  

- **Investor Agent** – Analyzes financial indicators and highlights areas of concern.  
- **Analyst Agent** – Reviews discrepancies and errors in company financials.  
- **Auditor Agent** – Checks accounting standards compliance and citations.  

The platform supports both **WebSocket real-time log streaming** and **REST API fallback** for fetching agent results. Users can view detailed results once an analysis run is completed.

---

## Features

- Real-time logs via WebSocket connection.
- Automatic detection of completed runs (`[run_id=XYZ]`) and display of a **"Get Results"** button.
- Display of **compliance findings** and severity levels.
- Interactive **dashboard metrics** including:
  - Compliance Status
  - Total Discrepancies
  - Critical Issues
  - Financial Health
- Visual representation of **financial KPIs** (Liquidity, Profitability, Leverage, Efficiency).
- Responsive design with **cards, badges, and tables**.
- Optional fallback to **mock data** when API is unavailable.

---

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **UI Components:** Tailwind CSS, ShadCN/UI, Lucide Icons
- **Real-Time Logs:** WebSocket (`wss://`)
- **State Management:** React hooks (`useState`, `useEffect`)
- **API Services:** REST for fetching agent results
- **Environment Variables:** `.env` with `VITE_` prefix

---

## Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd <project-folder>
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

Create a .env file at the root:
```bash
VITE_API_GATEWAY_URL=https://your-api-url
VITE_WEBSOCKET_URL=wss://your-websocket-url
VITE_AGENT_URL=https://your-agent-url
```

## Note: Only variables prefixed with VITE_ are exposed to the frontend.

## Run the development server

```bash
npm run dev
```

## Open http://localhost:5173 in your browser.