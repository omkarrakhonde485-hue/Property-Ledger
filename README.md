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

## 🚦 Quick Start

### 1. Run the Backend (Python)
Ensure Python 3 is installed.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```
*The FastAPI backend will start on **`http://localhost:8000`**. You can view the interactive Swagger docs at `http://localhost:8000/docs`.*

### 2. Run the Frontend (Vite/React)
Make sure Node.js is installed.

```bash
# In the root project folder
npm install
npm run dev
```
*The React client will start on **`http://localhost:5173`**.*
