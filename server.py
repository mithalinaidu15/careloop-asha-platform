import http.server
import socketserver
import os
import json
import sqlite3
import datetime
import urllib.parse

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DIRECTORY, "careloop.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Children table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS children (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age TEXT NOT NULL,
        dob TEXT,
        gender TEXT NOT NULL,
        address TEXT NOT NULL,
        guardian_name TEXT NOT NULL,
        guardian_relation TEXT NOT NULL,
        guardian_phone TEXT NOT NULL,
        asha_worker TEXT NOT NULL,
        assigned_facility TEXT,
        current_stage INTEGER NOT NULL DEFAULT 1,
        status_text TEXT NOT NULL DEFAULT 'Registered',
        created_at TEXT NOT NULL
    )
    ''')

    # 2. Caregiver Consent table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS caregiver_consent (
        id TEXT PRIMARY KEY,
        child_id TEXT NOT NULL,
        guardian_name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        consent_screening INTEGER NOT NULL DEFAULT 1,
        consent_data_sharing INTEGER NOT NULL DEFAULT 1,
        consent_deic_referral INTEGER NOT NULL DEFAULT 1,
        consent_followup INTEGER NOT NULL DEFAULT 1,
        signature_type TEXT NOT NULL,
        verified_mobile TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active',
        FOREIGN KEY (child_id) REFERENCES children (id)
    )
    ''')

    # 3. Dedicated DEIC Referrals table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS deic_referrals (
        id TEXT PRIMARY KEY,
        child_id TEXT NOT NULL,
        child_name TEXT NOT NULL,
        referred_by TEXT NOT NULL,
        referred_by_role TEXT NOT NULL,
        deic_center TEXT NOT NULL,
        target_specialties TEXT,
        primary_concerns TEXT NOT NULL,
        detailed_referral_reason TEXT NOT NULL,
        functional_impact TEXT,
        onset_duration TEXT,
        urgency TEXT NOT NULL,
        transit_assistance_requested INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'Submitted to DEIC',
        scheduled_date TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (child_id) REFERENCES children (id)
    )
    ''')

    # 4. Observations table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS observations (
        id TEXT PRIMARY KEY,
        child_id TEXT NOT NULL,
        date TEXT NOT NULL,
        author TEXT NOT NULL,
        role TEXT NOT NULL,
        height_cm REAL,
        weight_kg REAL,
        muac_cm REAL,
        meals_note TEXT,
        speech_obs TEXT,
        sound_obs TEXT,
        text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (child_id) REFERENCES children (id)
    )
    ''')

    # 5. ASHA Caseload table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS asha_caseload (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age TEXT NOT NULL,
        village TEXT NOT NULL,
        guardian TEXT NOT NULL,
        phone TEXT NOT NULL,
        last_visit TEXT NOT NULL,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    ''')

    # 6. Follow-up visits table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS followups (
        id TEXT PRIMARY KEY,
        child_id TEXT NOT NULL,
        child_name TEXT NOT NULL,
        date TEXT NOT NULL,
        contact_status TEXT NOT NULL,
        readiness TEXT NOT NULL,
        notes TEXT,
        barrier TEXT,
        assistance_provided TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (child_id) REFERENCES children (id)
    )
    ''')

    conn.commit()
    conn.close()
    print("Database careloop.db initialised cleanly without dummy data.")

class CareLoopRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/"):
            self.handle_api_get(path, urllib.parse.parse_qs(parsed.query))
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/"):
            content_length = int(self.headers.get('Content-Length', 0))
            body_bytes = self.rfile.read(content_length)
            try:
                data = json.loads(body_bytes.decode('utf-8')) if body_bytes else {}
            except Exception:
                data = {}
            self.handle_api_post(path, data)
        else:
            self.send_error(404, "Endpoint not found")

    def handle_api_get(self, path, query_params):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        if path == "/api/caseload":
            cursor.execute("SELECT * FROM asha_caseload ORDER BY created_at DESC")
            caseload = [dict(r) for r in cursor.fetchall()]
            conn.close()
            self.send_json_response({"caseload": caseload})

        elif path == "/api/child":
            child_id = query_params.get("id", [None])[0]
            if not child_id:
                cursor.execute("SELECT * FROM children ORDER BY created_at DESC LIMIT 1")
            else:
                cursor.execute("SELECT * FROM children WHERE id = ?", (child_id,))
            child = cursor.fetchone()
            if not child:
                conn.close()
                self.send_json_response({"child": None, "consent": None, "deic_referrals": [], "observations": [], "followups": []})
                return

            c_id = child["id"]
            cursor.execute("SELECT * FROM caregiver_consent WHERE child_id = ? ORDER BY timestamp DESC LIMIT 1", (c_id,))
            consent = cursor.fetchone()

            cursor.execute("SELECT * FROM deic_referrals WHERE child_id = ? ORDER BY created_at DESC", (c_id,))
            referrals = cursor.fetchall()

            cursor.execute("SELECT * FROM observations WHERE child_id = ? ORDER BY created_at DESC", (c_id,))
            observations = cursor.fetchall()

            cursor.execute("SELECT * FROM followups WHERE child_id = ? ORDER BY created_at DESC", (c_id,))
            followups = cursor.fetchall()

            res = {
                "child": dict(child),
                "consent": dict(consent) if consent else None,
                "deic_referrals": [dict(r) for r in referrals],
                "observations": [dict(o) for o in observations],
                "followups": [dict(f) for f in followups]
            }
            conn.close()
            self.send_json_response(res)

        elif path == "/api/deic-referrals":
            cursor.execute("SELECT * FROM deic_referrals ORDER BY created_at DESC")
            referrals = [dict(r) for r in cursor.fetchall()]
            conn.close()
            self.send_json_response({"referrals": referrals})

        elif path == "/api/followups":
            cursor.execute("SELECT * FROM followups ORDER BY created_at DESC")
            followups = [dict(f) for f in cursor.fetchall()]
            conn.close()
            self.send_json_response({"followups": followups})

        elif path == "/api/stats":
            cursor.execute("SELECT COUNT(*) FROM asha_caseload")
            total_children = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM asha_caseload WHERE priority = 'High' OR status LIKE '%Due%'")
            pending_followups = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM deic_referrals")
            deic_count = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM observations")
            obs_count = cursor.fetchone()[0]

            conn.close()
            self.send_json_response({
                "total_children": total_children,
                "pending_followups": pending_followups,
                "deic_referrals": deic_count,
                "observations": obs_count
            })

        else:
            conn.close()
            self.send_error(404, "Unknown API route")

    def handle_api_post(self, path, data):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if path == "/api/register-child":
            child_id = data.get("id") or ("CHILD-" + str(int(datetime.datetime.now().timestamp()) % 100000).zfill(5))
            name = data.get("name", "").strip()
            age = data.get("age", "").strip()
            dob = data.get("dob", "")
            gender = data.get("gender", "Female")
            address = data.get("address", "").strip()
            guardian_name = data.get("guardian_name", "").strip()
            guardian_relation = data.get("guardian_relation", "Mother")
            guardian_phone = data.get("guardian_phone", "").strip()
            asha_worker = data.get("asha_worker", "ASHA Worker")
            consent_given = data.get("consent", True)

            cursor.execute('''
            INSERT INTO children (id, name, age, dob, gender, address, guardian_name, guardian_relation, guardian_phone, asha_worker, status_text, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Newly Registered', ?)
            ''', (child_id, name, age, dob, gender, address, guardian_name, guardian_relation, guardian_phone, asha_worker, now))

            cursor.execute('''
            INSERT INTO asha_caseload (id, name, age, village, guardian, phone, last_visit, status, priority, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'Today', 'Newly Registered', 'Normal', ?)
            ''', (child_id, name, age, address, guardian_name, guardian_phone, now))

            if consent_given:
                consent_id = "CONSENT-" + datetime.datetime.now().strftime("%Y%m%d%H%M%S")
                cursor.execute('''
                INSERT INTO caregiver_consent (id, child_id, guardian_name, relationship, consent_screening, consent_data_sharing, consent_deic_referral, consent_followup, signature_type, verified_mobile, timestamp, status)
                VALUES (?, ?, ?, ?, 1, 1, 1, 1, 'In-Person Guardian Verification', ?, ?, 'Active')
                ''', (consent_id, child_id, guardian_name, guardian_relation, guardian_phone, now))

            conn.commit()
            conn.close()
            self.send_json_response({"success": True, "child_id": child_id, "name": name})

        elif path == "/api/deic-referral":
            ref_id = "DEIC-REF-" + datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            child_id = data.get("child_id", "")
            child_name = data.get("child_name", "")
            referred_by = data.get("referred_by", "ASHA Worker")
            referred_by_role = data.get("referred_by_role", "ASHA Worker")
            deic_center = data.get("deic_center", "District Early Intervention Centre (DEIC)")
            target_specialties = data.get("target_specialties", "Pediatrics, Speech Therapy, Psychology")
            primary_concerns = data.get("primary_concerns", "")
            detailed_reason = data.get("detailed_referral_reason", "")
            functional_impact = data.get("functional_impact", "")
            onset_duration = data.get("onset_duration", "")
            urgency = data.get("urgency", "Priority")
            transit = 1 if data.get("transit_assistance_requested", False) else 0

            cursor.execute('''
            INSERT INTO deic_referrals (id, child_id, child_name, referred_by, referred_by_role, deic_center, target_specialties, primary_concerns, detailed_referral_reason, functional_impact, onset_duration, urgency, transit_assistance_requested, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted to DEIC', ?)
            ''', (ref_id, child_id, child_name, referred_by, referred_by_role, deic_center, target_specialties, primary_concerns, detailed_reason, functional_impact, onset_duration, urgency, transit, now))

            cursor.execute("UPDATE children SET status_text = 'DEIC Referral Forwarded' WHERE id = ?", (child_id,))
            cursor.execute("UPDATE asha_caseload SET status = 'DEIC Referral Sent', last_visit = 'Today' WHERE id = ?", (child_id,))

            conn.commit()
            conn.close()
            self.send_json_response({"success": True, "referral_id": ref_id})

        elif path == "/api/observation":
            obs_id = "OBS-" + datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            child_id = data.get("child_id", "")
            cursor.execute('''
            INSERT INTO observations (id, child_id, date, author, role, height_cm, weight_kg, muac_cm, meals_note, speech_obs, sound_obs, text, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                obs_id,
                child_id,
                datetime.datetime.now().strftime("%d %b %Y"),
                data.get("author", "ASHA Worker"),
                data.get("role", "ASHA Worker"),
                float(data.get("height_cm", 0)) if data.get("height_cm") else None,
                float(data.get("weight_kg", 0)) if data.get("weight_kg") else None,
                float(data.get("muac_cm", 0)) if data.get("muac_cm") else None,
                data.get("meals_note", ""),
                data.get("speech_obs", ""),
                data.get("sound_obs", ""),
                data.get("text", ""),
                now
            ))
            cursor.execute("UPDATE asha_caseload SET status = 'Observation Recorded', last_visit = 'Today' WHERE id = ?", (child_id,))
            conn.commit()
            conn.close()
            self.send_json_response({"success": True, "observation_id": obs_id})

        elif path == "/api/followup":
            fol_id = "FOL-" + datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            child_id = data.get("child_id", "")
            child_name = data.get("child_name", "")
            cursor.execute('''
            INSERT INTO followups (id, child_id, child_name, date, contact_status, readiness, notes, barrier, assistance_provided, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                fol_id,
                child_id,
                child_name,
                datetime.datetime.now().strftime("%d %b %Y"),
                data.get("contact_status", ""),
                data.get("readiness", ""),
                data.get("notes", ""),
                data.get("barrier", ""),
                data.get("assistance_provided", ""),
                now
            ))
            cursor.execute("UPDATE asha_caseload SET last_visit = 'Today' WHERE id = ?", (child_id,))
            conn.commit()
            conn.close()
            self.send_json_response({"success": True, "followup_id": fol_id})

        elif path == "/api/consent":
            consent_id = "CONSENT-" + datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            child_id = data.get("child_id", "")
            cursor.execute('''
            INSERT INTO caregiver_consent (id, child_id, guardian_name, relationship, consent_screening, consent_data_sharing, consent_deic_referral, consent_followup, signature_type, verified_mobile, timestamp, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
            ''', (
                consent_id,
                child_id,
                data.get("guardian_name", ""),
                data.get("relationship", "Mother"),
                1 if data.get("consent_screening", True) else 0,
                1 if data.get("consent_data_sharing", True) else 0,
                1 if data.get("consent_deic_referral", True) else 0,
                1 if data.get("consent_followup", True) else 0,
                data.get("signature_type", "In-Person Verification"),
                data.get("verified_mobile", ""),
                now
            ))
            conn.commit()
            conn.close()
            self.send_json_response({"success": True, "consent_id": consent_id})

        else:
            conn.close()
            self.send_error(404, "Endpoint not found")

    def send_json_response(self, data, status=200):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(body)

if __name__ == '__main__':
    init_db()
    print(f"CareLoop ASHA Server listening on http://localhost:{PORT}")
    with socketserver.TCPServer(("", PORT), CareLoopRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
