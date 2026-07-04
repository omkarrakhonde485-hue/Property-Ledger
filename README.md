# 🏠 Property Ledger

> **A modern, mobile-first property management system for PG owners, hostel operators, landlords, and rental property managers.**

Property Ledger replaces traditional notebooks, spreadsheets, and manual registers with a powerful digital dashboard to manage **properties, tenants, rent, deposits, expenses, and occupancy**—all in one place.

> ⚠️ **Note:** This is an **owner-only management application**. It is **not** a property marketplace or a tenant-facing platform.

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
* Document management
* Notice period tracking
* Vacating management
* Personal notes and activity timeline

### 💰 Rent & Payment Management

* Manual rent payment recording
* Partial payment support
* Advance payment support
* Outstanding rent tracking
* Multiple payment methods:

  * 💵 Cash
  * 📱 UPI
  * 🏦 Bank Transfer
  * 📝 Cheque

### 🔐 Security Deposits

* Deposit collection tracking
* Refund management
* Complete deposit history

### 📂 Document Storage

* Aadhaar
* PAN
* Rental Agreement
* Police Verification
* Custom documents
* Expiry reminders

### 💸 Expense Tracking

* Electricity
* Water
* Internet
* Maintenance
* Repairs
* Cleaning
* Security
* Custom expense categories

### 📊 Reports & Analytics

* Occupancy Report
* Revenue vs Expenses
* Outstanding Rent
* Monthly Collection Summary
* Export-ready reports

### 🌐 Multilingual Support

* 🇬🇧 English
* 🇮🇳 Marathi

### 📱 Mobile-First Experience

* Bottom tab navigation
* Pull-to-refresh
* Safe-area support
* Responsive layouts
* System dark mode

---

## 🚀 Tech Stack

| Technology                  | Purpose                                 |
| --------------------------- | --------------------------------------- |
| ⚛️ React + Vite             | Frontend                                |
| 🎨 Tailwind CSS + shadcn/ui | Modern UI Components                    |
| 🧭 React Router             | Routing                                 |
| 🔄 TanStack React Query     | Data Fetching & Caching                 |
| 🎬 Framer Motion            | Animations & Page Transitions           |
| 📈 Recharts                 | Reports & Analytics                     |
| ☁️ Base44                   | Authentication, Database & File Storage |

---

## 🏗️ Project Structure

```text
src/
├── pages/               # Route-level pages
├── components/          # Feature-specific reusable components
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
├── lib/                 # Auth, i18n, query client & utilities
└── assets/              # Images, icons & static resources

base44/
└── entities/            # Base44 entity definitions & schemas
```

---

## 🗂️ Core Data Model

The application is built around the following entities:

* 🏢 Property
* 🏬 Floor
* 🚪 Room
* 🛏️ Bed
* 👤 Tenant
* 💳 Payment
* 🔐 Deposit
* 📅 Rent Due
* 💸 Expense
* 📂 Tenant Document
* 📝 Note

### Property Hierarchy

```text
Property
└── Floor
    └── Room
        └── Bed
            └── Tenant
```

---

## 🔐 Authentication

Property Ledger supports secure authentication through:

* ✉️ Email & Password
* 🔢 OTP Verification
* 🔐 Google Sign-In

All application routes are protected, and every user's data is securely isolated to their own account.

---

## 📱 Designed for Daily Operations

Property Ledger is built to simplify everyday property management tasks such as:

* ✔️ Managing tenants
* ✔️ Recording rent payments
* ✔️ Tracking deposits
* ✔️ Monitoring occupancy
* ✔️ Logging expenses
* ✔️ Managing documents
* ✔️ Generating reports
* ✔️ Sending payment reminders

---

## 🎯 Target Users

* 🏠 PG Owners
* 🛏️ Hostel Owners
* 🏢 Rental Property Owners
* 🏘️ Small Landlords
* 🎓 Student Accommodation Operators

---

## ❌ Out of Scope

To keep the application focused and efficient, the following are intentionally **not included**:

* Property Marketplace
* Tenant Mobile App
* Tenant Login
* Property Discovery
* Online Booking
* Ratings & Reviews
* Broker Management
* Payment Gateway Integration

---

## ⭐ Project Vision

**Property Ledger** is designed to be the **complete digital operating system for property owners**, replacing traditional registers and spreadsheets with a fast, organized, and mobile-friendly management experience.
