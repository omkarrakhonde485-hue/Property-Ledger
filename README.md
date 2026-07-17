# 🏠 Property Ledger

> **A modern, mobile-first property management system for PG owners, hostel operators, landlords, and rental property managers.**

Property Ledger replaces traditional notebooks, spreadsheets, and manual registers with a powerful digital dashboard to manage **properties, tenants, rent, deposits, expenses, and occupancy**—all in one place.

This is an **owner-only management application**. It is built for simplicity, high speed, and offline-readiness.

---

## ✨ Key Features

### 🏢 Property Management
* Manage **multiple properties**
* Organize properties into **floors**, **rooms**, and **beds**
* Track occupancy in real time
* Mark rooms/beds as **Vacant**, **Reserved**, or **Occupied**

### 👥 Tenant Management
* Complete tenant profiles
* Contact & emergency information
* Document management (Aadhaar, agreements, etc.)
* Notice period tracking & vacating management

### 💰 Rent & Payment Management
* Manual rent payment recording (UPI, Cash, Bank Transfer, Cheque)
* Partial payment & outstanding rent tracking
* Rent due ledger generated dynamically per tenant per month

### 💸 Expense Tracking
* Logs utility and maintenance costs (Electricity, Water, Internet, etc.)
* Simple categories to analyze monthly outflow

### 📊 Reports & Analytics
* Occupancy reports
* Revenue vs. Expense analytics
* Outstanding rent by property
* Dynamic charts powered by Recharts

### 📋 Audit, Compliance & Tenant Portal
* **Dedicated Tenant Interface** (`/tenant-portal`): A mobile-responsive standalone tenant web application.
* **Complaints Desk**: Form for tenants to submit maintenance issues directly with status badges (**Open**, **In Progress**, **Resolved**).
* **Audit & Legal Compliance**: Track Police Verification status, KYC document proofs, and digital Lease Agreements.
* **Legal Agreement Signing**: Interactive lease agreement viewer allowing tenants to digitally sign their rent contract.
* **Tax-Compliant HRA Rent Receipts**: One-click printable rent receipt generation for tenants with automatic number-to-words currency conversion.
* **Demo Preview Selector**: Instant toggle allowing judges to test the portal from any seeded tenant's perspective.

### 🌐 Multilingual Support
* 🇬🇧 English
* 🇮🇳 Marathi

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React (v18) + Vite
- **Styling**: Tailwind CSS + Radix UI + shadcn/ui
- **State Management**: TanStack React Query (v5)
- **Animations**: Framer Motion
- **Charts**: Recharts

### Backend
- **Framework**: FastAPI (Python 3)
- **Database**: SQLite (built-in, file-backed `data.db` database)
- **CORS & Static Files**: Custom FastAPI middleware to serve tenant document uploads locally
- **AI Integration**: Google Gemini API SDK + OpenRouter REST API
- **Web Search**: Tavily Search API
- **WhatsApp Automation**: Mudslide CLI (WhatsApp Web API wrapper)

---

---

## 🏛️ Comprehensive System Architecture

Property Ledger is engineered as a decoupled full-stack application featuring a dual-portal frontend, a high-throughput FastAPI SQLite backend, an intelligent caching layer, and a multi-tiered AI and messaging pipeline.

```mermaid
graph TD
    subgraph Frontend Layer [React + Vite Client]
        LP[Landing Page / Navbar]
        LD[Landlord Dashboard - /dashboard]
        TP[Standalone Tenant Portal - /tenant-portal]
    end

    subgraph Backend Layer [FastAPI Core Engine]
        API[FastAPI REST Router - main.py]
        SQL[(SQLite Database - data.db)]
        CACHE[(market_analysis_cache Table)]
    end

    subgraph External AI & Services [AI & Automation Pipeline]
        TAV[Tavily Search API - Web Rents]
        GEM[Google Gemini 2.0 Flash]
        OR[OpenRouter API - openrouter/free]
        MUD[Mudslide CLI - WhatsApp Gateway]
    end

    %% Frontend Interactions
    LD -->|CRUD Operations| API
    TP -->|File Uploads & Tickets| API

    %% DB & Cache Flow
    API <-->|SQL Queries| SQL
    API <-->|Cached Analysis Check| CACHE

    %% AI Market Analysis Flow
    API -->|1. Geolocation Search| TAV
    TAV -->|Rent Snippets| API
    API -->|2. Primary Prompt| GEM
    GEM -->|Success: 200| CACHE
    GEM -->|429 Quota Error| OR
    OR -->|Success: 200| CACHE

    %% WhatsApp Automation Flow
    API -->|3. Personalized Draft| GEM
    API -->|4. Dispatch Message| MUD
    MUD -->|WhatsApp Web API| WhatsApp[Tenant Mobile Device]
```

---

## 🧠 Core Architecture Pipelines Explained

### 1. 🌐 Dual-Portal Frontend Architecture
* **Landlord Ledger Dashboard** (`/dashboard`, `/tenants`, `/properties`, `/reports`, `/ai-insights`): Clean, desktop-first management portal equipped with financial charts, occupancy tracking, and AI valuation cards.
* **Standalone Mobile Tenant Portal** (`/tenant-portal`): Completely isolated, mobile-optimized tenant interface allowing occupants to track dues, upload KYC documents, review/digitally sign lease deeds, download HRA tax receipts, and lodge maintenance complaints. Includes a **Demo Preview Selector** for judges to instantly switch tenant views.

### 2. ⚡ FastAPI Backend & Persistent SQLite Caching
* **Generic High-Performance REST Layer**: Generic CRUD handler in FastAPI providing RESTful routes (`/api/properties`, `/api/tenants`, `/api/complaints`, etc.) with standard sorting and query filtering.
* **Smart Analysis Caching**: Live market rent analyses are stored inside SQLite's `market_analysis_cache` table. Consecutive page visits load instantaneously from the cache, while manual refresh requests (`?refresh=true`) force a live API query to Tavily and Gemini before updating the database.

### 3. 🤖 AI Market Rent Valuation Pipeline
* **Target Geolocation Search**: Automatically extracts property address, city, and pincode to formulate search queries via the **Tavily Web Search API**, acquiring current local PG and co-living rent benchmarks.
* **LLM Valuation Engine**: Prompts **Google Gemini 2.0 Flash** with property room defaults and live web search snippets to evaluate room pricing position (*Underpriced*, *Overpriced*, *Competitive*) and provide actionable yield-boosting advice.
* **3-Tier Fault Tolerance**:
  1. **Google Gemini 2.0 Flash API** (Primary)
  2. **OpenRouter (`openrouter/free` router)** (Secondary fallback upon HTTP 429 quota limits)
  3. **Local Mock Intelligence Engine** (Context-aware Noida & Pune fallbacks ensuring zero demo downtime during network failures)

### 4. 📲 Automated WhatsApp Notification Engine
* **Contextual AI Drafting**: Gemini drafts personalized payment reminders incorporating tenant names, joining dates, due amounts, and room numbers.
* **Subprocess Dispatch**: FastAPI executes `npx mudslide` via headless subprocesses to transmit messages straight to the tenant's WhatsApp phone number.

### 5. 📋 Legal Audit & Compliance Engine
* **Digital Lease E-Signatures**: Rendered 11-month lease agreement deeds allowing tenants to review terms and affix digital signature records.
* **HRA Tax-Compliant Receipts**: One-click printable receipt generator equipped with official stamp placeholders and automated number-to-words currency formatting (*e.g., ₹12,000 ➔ Twelve Thousand Rupees Only*).
* **Police & KYC Audit Vault**: Centralized document management tracking municipal police verification status and identity proofs.

---

## 🏗️ Project Structure

```text
├── backend/
│   ├── main.py              # FastAPI app, CORS configuration, CRUD routes
│   ├── db.py                # sqlite3 helper & context manager for DB connections
│   ├── schema.sql           # Database tables structure definition
│   ├── uploads/             # Directory containing uploaded tenant documents
│   └── requirements.txt     # Python requirements (FastAPI, Uvicorn)
│
└── src/
    ├── pages/               # Route-level pages
    ├── components/          # Features & shared components
    │   └── ui/              # Radix UI primitives & tailwind components
    ├── hooks/               # Custom React hooks (e.g. pull-to-refresh)
    ├── lib/                 # Localization (i18n), query client & utilities
    └── api/
        └── client.js        # Axios-like Fetch wrapper pointing to local backend
```

---

## 🗂️ Core Data Model

The application is built around the following SQL tables:

* 🏢 `properties`
* 🏬 `floors`
* 🚪 `rooms`
* 🛏️ `beds`
* 👤 `tenants`
* 💳 `payments`
* 🔐 `deposits`
* 📅 `rent_dues`
* 💸 `expenses`
* 📂 `tenant_documents`
* 🛠️ `complaints`
* 📝 `notes`

### Property Hierarchy

```text
Property
└── Floor
    └── Room
        └── Bed
            └── Tenant
```

---

## 🚦 Quick Start & Setup

### 1. Configure local Environment Variables
Create a file named `.env` in the `backend/` directory:
```bash
touch backend/.env
```
Inside `backend/.env`, configure your API keys:
```env
GEMINI_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_search_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```
*(This file is ignored by `.gitignore` so your private API keys are never pushed to public Git repositories).*

### 2. Set Up WhatsApp Automation (Mudslide)
Property Ledger uses **Mudslide** (a lightweight terminal CLI built on the Baileys library) to link your WhatsApp account for automated messages.
1. Run the login command in your terminal:
   ```bash
   npx mudslide login
   ```
2. A QR code will display in the console. Open **WhatsApp** on your phone -> Go to **Linked Devices** -> **Link a Device** and scan the code.
3. Once linked, you can send automated messages directly from the app interface without human intervention.

### 3. Run the Backend (Python)
Ensure Python 3 is installed.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```
*The FastAPI backend will start on **`http://localhost:8000`**. You can view the interactive Swagger docs at `http://localhost:8000/docs`.*

### 4. Run the Frontend (Vite/React)
Make sure Node.js is installed.

```bash
# In the root project folder
npm install
npm run dev
```
*The React client will start on **`http://localhost:5173`**.*
