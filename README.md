# Zoho Books Financial Dashboard Integration

A professional, full-stack financial dashboard designed to interface directly with the Zoho Books API. The application dynamically retrieves live accounting records to generate comparative performance matrices and itemized ledger transaction drill-downs with built-in document tracking.

---

## 📌 Core Features Delivered

### 1. Dual-Month Profit & Loss Comparison Matrix (Page 19)

- **Live Actuals Synchronization:** Queries live financial balances from Zoho Books for **April 2026** and **May 2026**.

- **Static Budget Mapping:** Implements a single source of truth configuration (`budget.json`) to store manual tracking benchmarks.

- **Automated Variance Engine:** Programmed formulas to automatically calculate dynamic variances ($C = A - B$ and $F = D - E$) across income and cost of goods sold (COGS) fields.

- **Conditional UI Indicators:** Renders semantic visual cues to make tracking variance gains or deficits instantly scannable.

### 2. Itemized Ledger Transaction Drill-Down (Page 20)

- **Interactive Summary Hooks:** Implements data hyperlinks on performance figures to initiate immediate sub-ledger queries.

- **Target Record Matching:** Accurately parses underlying transactional arrays to reconstruct historical activity logs. Isolates test entries including **TATA SONS** invoices (**INV001**, **INV002**) and vendor bills (**BILL001–BILL010**).

- **Flat-List Data Tracking:** Maps critical accounting metadata directly to UI columns: **Date**, **Account Name**, **Transaction Details (Party Name)**, **Transaction Type**, **Transaction Number**, and **Amounts**.

- **Document Attachment Handling:** Supports tracking and rendering original source PDF files uploaded during initial invoice or bill initialization.

---

## 🛠️ Architecture & Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (Strict structural typing for deep API responses)
- **Styling:** Tailwind CSS (Clean grid system and dark-themed navigation layouts)
- **Design Pattern:** Decoupled Repository-Service-Action architecture separating downstream HTTP network states from upstream UI layout components.

---

## 🔒 Security & Performance Features

- **Server-Side Security:** Executes all multi-datacenter API communication strictly within Node.js runtime boundaries. Sensitive parameters such as Client Credentials, Secret Keys, and Organization IDs run as environment variables to eliminate client-side exposure.
- **Resilient Connection Handling:** Built a generic asynchronous fetch client utilizing native `AbortController` handles to safely cancel requests during connection drops and clear ghost memory tasks.
- **Concurrent API Requests:** Uses parallel promise pooling (`Promise.all`) to execute multi-period report fetching simultaneously, cutting loading times significantly.

---

## ⚙️ Local Development Setup

### 1. Clone the Codebase

```bash
git clone https://github.com/ShraddhaUjainkar/ZOHO-Books-API-Implementation.git
cd zoho-financial-dashboard

```

### 2. Configure Environment Variables

Create a `.env.local` file in your root folder and add the credentials obtained from the Zoho Developer Console (India Portal):

```env
ZOHO_API_BASE_URL=https://www.zohoapis.in/books/v3
ZOHO_ORG_ID=XXX
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REDIRECT_URI=your_auth_callback_url

```

### 3. Run the Project

```bash
# Install dependencies
npm install

# Spin up local development server
npm run dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser to evaluate the application.
