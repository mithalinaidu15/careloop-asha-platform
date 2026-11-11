# CareLoop ASHA Platform - Field Dashboard & Register

A responsive web and mobile application designed for ASHA community health workers, aligned with the Master Flow specifications (Screens A1–A8).

## Key Features

1. **Zero Dummy Data**:
   - Caseload, DEIC referrals, and observation registers start completely empty (`0` records).
   - All dummy names have been completely removed.
   - Configurable generic `"ASHA Worker"` profile editable via the **Edit Worker Profile** modal.

2. **Three Indian Languages**:
   - **English** (`en`)
   - **हिंदी** (`hi`)
   - **ಕನ್ನಡ** (`kn`)

3. **Supabase Cloud Backend Integration**:
   - Fully compatible with **Supabase PostgreSQL & Realtime**.
   - Dual-mode persistence:
     - **⚡ Supabase Cloud**: When connected, child registrations, milestone observations, DEIC referrals, followups, and caregiver consents sync directly to your Supabase tables.
     - **🗄️ SQLite Local Fallback**: When offline or before Supabase credentials are entered, the platform works locally with `careloop.db` via `server.py`.
   - **Interactive Supabase Configuration Modal**: Connect, test credentials, and disconnect directly from the UI header or hamburger menu.
   - **Pre-built Database Schema**: Ready-to-run [`supabase-schema.sql`](supabase-schema.sql) file for one-click setup in Supabase SQL Editor.

4. **Fieldwork Workflows (A1–A8)**:
   - **Dashboard (A1)**: Dynamic caseload counters and priority visits.
   - **New Child Registration (A2)**: Comprehensive registration with caregiver consent.
   - **Milestone Screening & Observations (A3–A4)**: Anthropometry and development checks.
   - **DEIC Referrals (A5)**: Direct referral workflow with detailed reasons and specialty tagging.
   - **Follow-up & Continuity (A6)**: Household tracking and barrier logging.
   - **Caregiver Consent**: Dedicated verification register and in-line validation.

---

## Connecting to Your Supabase Backend

### Step 1: Run the Database Schema in Supabase
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project and navigate to the **SQL Editor** on the left menu.
3. Open [`supabase-schema.sql`](supabase-schema.sql) from this repository, copy its contents, paste them into the SQL Editor, and click **Run**.
4. This creates the required tables (`children`, `deic_referrals`, `observations`, `followups`, `caregiver_consent`) and configures Row Level Security (RLS) policies.

### Step 2: Connect the Platform to Supabase
You can connect in either of two ways:

#### Option A: Directly from the Website UI (Recommended)
1. Start the app: `py server.py` and open `http://localhost:8080`.
2. Click the **"🗄️ SQLite (Connect Supabase ⚡)"** pill in the top header (or open the Hamburger menu ☰ → **Supabase Cloud Settings**).
3. Enter your:
   - **Project URL**: e.g., `https://xyzcompany.supabase.co` (found in *Project Settings → API*)
   - **anon / public key**: `eyJhbGci...` (found in *Project Settings → API*)
4. Click **"🔍 Test Connection"** to verify, then click **"Save & Connect"**.
5. The badge will change to **"⚡ Supabase (Live Cloud)"** and all data will immediately sync with your Supabase database!

#### Option B: In the Configuration File
Open [`supabase-config.js`](supabase-config.js) and enter your credentials:
```javascript
window.CARELOOP_SUPABASE_CONFIG = {
  url: 'https://your-project.supabase.co',
  anonKey: 'your-anon-public-key-here'
};
```

---

## How to Run

1. Open PowerShell and navigate to the directory:
   ```powershell
   cd "C:\Users\Lenovo\.gemini\antigravity\scratch\child-health-platform"
   ```

2. Start the local server:
   ```powershell
   py server.py
   ```

3. Open your browser and go to:
   ```
   http://localhost:8080
   ```
