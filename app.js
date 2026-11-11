// ==============================================================================
// WeCare — Digital Care Space for Community Health Facilitators (ASHA Workers)
// Complete Application Logic & View Controller
// Reproducing exact Figma visual layout, workflows, colors and calm healthcare UX
// ==============================================================================

const AppState = {
  language: 'en', // 'en' | 'hi' | 'kn'
  activeTab: 'dashboard', // 'guidance' | 'dashboard' | 'children' | 'assessments' | 'community' | 'settings'
  
  // Registration & Assessment Multi-step workflow state
  workflowStep: 1, // 1: Child details, 2: Primary assessment, 3: Guided activity, 4: Session summary
  assessmentSection: 4, // 1 to 7 (1: Height, 2: Weight, 3: Appetite, 4: Everyday nutrition, 5: Behaviour, 6: Activity, 7: Skills)
  
  // Self-care timer
  timerSeconds: 1440, // 24:00 minutes
  timerRunning: false,
  timerInterval: null,
  quietMode: false,
  
  // Guided Activity Game State
  activityPromptIndex: 0,
  activitySelectedShape: null,
  activityOutcome: 'With encouragement',
  activityNotes: 'Joined after caregiver reassurance. Followed a simple instruction.',

  // Active Child in Session
  currentChild: {
    name: 'Aarav Meena',
    age: '6 years',
    school: 'Govt. Primary School, Shastri Nagar',
    grade: 'Grade 1 A',
    guardian: 'Pooja Meena',
    guardianRelation: 'Mother',
    phone: '+91 98765 43210',
    preferredLanguage: 'Hindi',
    consentObtained: true,
    height: '112 cm',
    weight: '18 kg',
    appetite: 'Varies day to day',
    mealsCount: '3 or more',
    foods: ['Grains & cereals', 'Dal, beans or eggs'],
    nutritionNotes: 'Caregiver reports breakfast is sometimes skipped before school. School lunch is usually eaten.'
  },

  // Authentication State
  auth: {
    isAuthenticated: true, // Default active session for immediate usability
    mode: 'signup', // 'signup' | 'login'
    pendingApproval: false,
    currentUser: {
      id: 'worker-101',
      name: 'Sunita Sharma',
      role: 'ASHA worker',
      location: 'Jaipur',
      facility: 'Govt. Primary School, Shastri Nagar'
    },
    formData: {
      fullName: '',
      contactNumber: '',
      zone: '',
      qualification: '',
      experience: '',
      workerId: '',
      governmentId: '',
      password: '',
      termsAccepted: false
    }
  },

  // Dynamic Data loaded from Supabase
  caseload: [],
  followups: [],
  observations: [],
  supabaseConnected: false,
  searchQuery: '',
  filterStatus: 'all' // 'all' | 'followups' | 'drafts'
};

// Check for persistent session in localStorage
try {
  const savedSession = localStorage.getItem('wecare_auth_session');
  if (savedSession) {
    const user = JSON.parse(savedSession);
    if (user && user.name) {
      AppState.auth.isAuthenticated = true;
      AppState.auth.currentUser = user;
    }
  }
} catch (e) {}

// Language translations
const i18n = {
  en: {
    appName: "wecare",
    tagline: "CARE, ONE CHILD AT A TIME",
    nav: {
      overview: "Overview",
      children: "Children",
      assessments: "Assessments",
      community: "Community",
      help: "Help & guidance",
      settings: "Settings"
    }
  },
  hi: {
    appName: "wecare",
    tagline: "हर बच्चे की देखभाल, एक समय में एक कदम",
    nav: {
      overview: "अवलोकन (डैशबोर्ड)",
      children: "बच्चे",
      assessments: "आकलन",
      community: "समुदाय",
      help: "मार्गदर्शन व सहायता",
      settings: "सेटिंग्स"
    }
  },
  kn: {
    appName: "wecare",
    tagline: "ಪ್ರತಿ ಮಗುವಿನ ಕಾಳಜಿ, ಒಂದೊಂದು ಹೆಜ್ಜೆ",
    nav: {
      overview: "ಅವಲೋಕನ",
      children: "ಮಕ್ಕಳು",
      assessments: "ಮೌಲ್ಯಮಾಪನ",
      community: "ಸಮುದಾಯ",
      help: "ಮಾರ್ಗದರ್ಶನ",
      settings: "ಸೆಟ್ಟಿಂಗ್ಸ್"
    }
  }
};

function txt(key) {
  const lang = AppState.language || 'en';
  const parts = key.split('.');
  let curr = i18n[lang] || i18n['en'];
  for (const p of parts) {
    if (!curr || !curr[p]) return key;
    curr = curr[p];
  }
  return curr;
}

// -------------------------------------------------------------
// TIMER FUNCTIONS
// -------------------------------------------------------------
function toggleTimer() {
  if (AppState.timerRunning) {
    clearInterval(AppState.timerInterval);
    AppState.timerRunning = false;
  } else {
    AppState.timerRunning = true;
    AppState.timerInterval = setInterval(() => {
      if (AppState.timerSeconds > 0) {
        AppState.timerSeconds--;
        updateTimerDisplay();
      } else {
        clearInterval(AppState.timerInterval);
        AppState.timerRunning = false;
        alert("Time for your gentle 5-minute pause. Take a moment to rest your eyes.");
        renderApp();
      }
    }, 1000);
  }
  renderApp();
}

function updateTimerDisplay() {
  const el = document.getElementById('timer-digits-display');
  if (el) {
    const mins = Math.floor(AppState.timerSeconds / 60);
    const secs = AppState.timerSeconds % 60;
    el.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

function toggleQuietMode() {
  AppState.quietMode = !AppState.quietMode;
  renderApp();
}

// -------------------------------------------------------------
// NAVIGATION HANDLERS
// -------------------------------------------------------------
function navigateTo(tab) {
  AppState.activeTab = tab;
  window.scrollTo(0, 0);
  renderApp();
}

function setLanguage(lang) {
  AppState.language = lang;
  renderApp();
}

function startChildRegistration() {
  AppState.activeTab = 'assessments';
  AppState.workflowStep = 1;
  window.scrollTo(0, 0);
  renderApp();
}

function proceedToAssessment() {
  AppState.workflowStep = 2;
  AppState.assessmentSection = 4; // default nutrition section as in Figma
  window.scrollTo(0, 0);
  renderApp();
}

function proceedToGuidedActivity() {
  AppState.workflowStep = 3;
  window.scrollTo(0, 0);
  renderApp();
}

function proceedToSessionSummary() {
  // Save observation to Supabase if connected
  if (window.SupabaseService && window.SupabaseService.isConfigured()) {
    try {
      window.SupabaseService.insertObservation({
        child_id: AppState.currentChild.name.toLowerCase().replace(/\s+/g, '-'),
        author: AppState.auth.currentUser ? AppState.auth.currentUser.name : 'ASHA Worker',
        height_cm: 112,
        weight_kg: 18,
        meals_note: AppState.currentChild.nutritionNotes,
        text: `Shape matching activity: ${AppState.activityOutcome}. ${AppState.activityNotes}`
      });
    } catch (e) {
      console.warn("Could not push observation to cloud:", e);
    }
  }

  AppState.workflowStep = 4;
  window.scrollTo(0, 0);
  renderApp();
}

function selectPlayShape(shape) {
  AppState.activitySelectedShape = shape;
  renderApp();
}

// -------------------------------------------------------------
// SUPABASE SYNC
// -------------------------------------------------------------
async function initDataSync() {
  if (window.SupabaseService) {
    window.SupabaseService.init();
    if (window.SupabaseService.isConfigured()) {
      AppState.supabaseConnected = true;
      try {
        const records = await window.SupabaseService.fetchCaseload();
        if (records && records.length > 0) {
          AppState.caseload = records;
        }
      } catch (err) {
        console.warn("Could not load caseload from cloud:", err);
      }
    }
  }
}

// -------------------------------------------------------------
// RENDER VIEWS
// -------------------------------------------------------------

// FRAME 1: AUTH SCREEN (Split Layout)
function renderAuthScreen() {
  const isSignup = AppState.auth.mode === 'signup';
  
  return `
    <div class="auth-split-layout">
      <!-- Left Dark Slate Panel -->
      <div class="auth-left-panel">
        <div>
          <div class="auth-brand-logo">wecare</div>
        </div>

        <div class="auth-left-content">
          <div class="auth-kicker">BUILT AROUND YOUR CARE</div>
          <h1 class="auth-main-headline">
            Every child seen.<br>
            Every step supported.
          </h1>
          <p class="auth-intro-p">
            A quieter way to collect information, notice what matters, and stay connected to the children in your care.
          </p>

          <div class="auth-value-props">
            <div class="value-prop-item">
              <div class="value-badge">01</div>
              <div>
                <div class="value-prop-title">Less paperwork, more care</div>
                <div class="value-prop-desc">Keep each child's information in one place.</div>
              </div>
            </div>

            <div class="value-prop-item">
              <div class="value-badge">02</div>
              <div>
                <div class="value-prop-title">Progress at your pace</div>
                <div class="value-prop-desc">Save a draft and return whenever you're ready.</div>
              </div>
            </div>

            <div class="value-prop-item">
              <div class="value-badge">03</div>
              <div>
                <div class="value-prop-title">Space to pause</div>
                <div class="value-prop-desc">Gentle reminders to care for yourself, too.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="auth-left-footer">
          <div class="auth-quote-title">"Small steps. Meaningful care."</div>
          <div class="auth-quote-sub">For ASHA workers. With care, always.</div>
        </div>
      </div>

      <!-- Right Warm Alabaster Panel -->
      <div class="auth-right-panel">
        <div class="auth-top-nav">
          <div style="display: flex; align-items: center; gap: 8px;">
            <select class="form-select" style="width: auto; padding: 6px 12px; background: transparent; border: 1px solid #D1D5DB; font-size: 13px;" onchange="setLanguage(this.value)">
              <option value="en" ${AppState.language === 'en' ? 'selected' : ''}>English v</option>
              <option value="hi" ${AppState.language === 'hi' ? 'selected' : ''}>हिंदी (Hindi)</option>
              <option value="kn" ${AppState.language === 'kn' ? 'selected' : ''}>ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>
          <div>
            ${isSignup ? `
              <a class="auth-switch-link" onclick="toggleAuthMode('login')">Already registered? Sign in &rarr;</a>
            ` : `
              <a class="auth-switch-link" onclick="toggleAuthMode('signup')">New here? Create account &rarr;</a>
            `}
          </div>
        </div>

        <div class="auth-form-card">
          <h2 class="auth-form-title">${isSignup ? 'Welcome to WeCare' : 'Welcome back to WeCare'}</h2>
          <div class="auth-form-subtitle">
            ${isSignup ? 'Create your ASHA worker account to get started.' : 'Sign in to access your field care register.'}
          </div>

          <div class="auth-info-banner">
            Your information helps connect you to the right school and care team.
          </div>

          ${AppState.auth.pendingApproval ? `
            <div style="background: var(--soft-peach-badge); border-radius: 12px; padding: 18px; margin-bottom: 24px;">
              <h4 style="margin-bottom: 4px; font-weight: 700;">Account Pending Approval</h4>
              <p style="font-size: 13px; color: #4B5563;">Your registration has been submitted. A district coordinator will approve your badge credentials shortly.</p>
            </div>
          ` : ''}

          ${isSignup ? `
            <form onsubmit="handleSignup(event)">
              <div class="auth-form-grid">
                <div class="form-field">
                  <label class="form-label">Full name *</label>
                  <input type="text" class="form-input" id="reg-name" placeholder="Enter your full name" required value="${AppState.auth.formData.fullName || ''}" />
                </div>

                <div class="form-field">
                  <label class="form-label">Contact number *</label>
                  <input type="tel" class="form-input" id="reg-phone" placeholder="+91 Enter mobile number" required value="${AppState.auth.formData.contactNumber || ''}" />
                </div>

                <div class="form-field">
                  <label class="form-label">Zone *</label>
                  <select class="form-select" id="reg-zone" required>
                    <option value="">Select your zone &or;</option>
                    <option value="North Zone" selected>North Zone - Shastri Nagar</option>
                    <option value="South Zone">South Zone</option>
                    <option value="East Zone">East Zone</option>
                    <option value="West Zone">West Zone</option>
                  </select>
                </div>

                <div class="form-field">
                  <label class="form-label">Qualification *</label>
                  <select class="form-select" id="reg-qual" required>
                    <option value="">Select qualification &or;</option>
                    <option value="Secondary (10th)">Secondary (10th)</option>
                    <option value="Higher Secondary (12th)" selected>Higher Secondary (12th)</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>

                <div class="form-field">
                  <label class="form-label">Experience *</label>
                  <select class="form-select" id="reg-exp" required>
                    <option value="">Select years of experience &or;</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years" selected>3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>

                <div class="form-field">
                  <label class="form-label">ASHA worker ID *</label>
                  <input type="text" class="form-input" id="reg-badge" placeholder="Enter your worker ID" required value="ASHA-JP-409" />
                </div>

                <div class="form-field">
                  <label class="form-label">Government ID *</label>
                  <input type="text" class="form-input" id="reg-govid" placeholder="Select ID type & enter number" required value="Aadhaar / Voter ID" />
                </div>

                <div class="form-field">
                  <label class="form-label">Create password *</label>
                  <input type="password" class="form-input" id="reg-pass" placeholder="At least 12 characters" required />
                </div>
              </div>

              <div class="terms-checkbox-wrap">
                <input type="checkbox" id="reg-terms" required checked />
                <label for="reg-terms">I agree to the Terms of use and Privacy notice.</label>
              </div>

              <button type="submit" class="btn-primary-action">
                Create account &rarr;
              </button>

              <div class="auth-meta-note">
                Your government ID is private and used only for account verification.
              </div>

              <div class="auth-help-contact">
                Need help getting started? <a onclick="alert('Please contact your district primary health care coordinator.')">Contact your coordinator</a>
              </div>
            </form>
          ` : `
            <form onsubmit="handleLogin(event)">
              <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px;">
                <div class="form-field">
                  <label class="form-label">Contact number or Email *</label>
                  <input type="text" class="form-input" id="login-ident" placeholder="Enter your mobile or email" required value="+91 98765 43210" />
                </div>

                <div class="form-field">
                  <label class="form-label">Password *</label>
                  <input type="password" class="form-input" id="login-pass" placeholder="Enter your password" required value="password12345" />
                </div>
              </div>

              <button type="submit" class="btn-primary-action">
                Sign in &rarr;
              </button>

              <div class="auth-help-contact">
                Forgot your credentials? <a onclick="alert('Please contact your PHC coordinator to reset your credentials.')">Contact your coordinator</a>
              </div>
            </form>
          `}
        </div>
      </div>
    </div>
  `;
}

function toggleAuthMode(mode) {
  AppState.auth.mode = mode;
  renderApp();
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value || 'ASHA Worker';
  const phone = document.getElementById('reg-phone').value || '+91 98765 43210';
  const badgeId = document.getElementById('reg-badge').value || 'ASHA-001';

  const newUser = {
    id: 'worker-' + Date.now(),
    name: name,
    phone: phone,
    badgeId: badgeId,
    role: 'ASHA worker',
    location: 'Jaipur',
    facility: 'Govt. Primary School, Shastri Nagar'
  };

  AppState.auth.currentUser = newUser;
  AppState.auth.isAuthenticated = true;
  AppState.activeTab = 'guidance'; // Navigate to Frame 2: Guidance
  localStorage.setItem('wecare_auth_session', JSON.stringify(newUser));
  renderApp();
}

function handleLogin(e) {
  e.preventDefault();
  AppState.auth.isAuthenticated = true;
  AppState.activeTab = 'dashboard';
  renderApp();
}

function handleLogout() {
  AppState.auth.isAuthenticated = false;
  AppState.auth.mode = 'login';
  localStorage.removeItem('wecare_auth_session');
  renderApp();
}

// FRAME 2: ONBOARDING / A LITTLE GUIDANCE
function renderGuidanceScreen() {
  return `
    <div class="guidance-screen">
      <div>
        <div class="guidance-top-nav">
          <div style="font-size: 24px; font-weight: 700; color: #1E2124;">wecare</div>
          <div style="display: flex; align-items: center; gap: 20px;">
            <span style="font-size: 13px; font-weight: 500;">English &or;</span>
            <a style="font-size: 13px; font-weight: 600; color: #1E2124; text-decoration: none; cursor: pointer;" onclick="navigateTo('dashboard')">
              Skip for now &rarr;
            </a>
          </div>
        </div>

        <div class="guidance-header">
          <div class="guidance-kicker">A GENTLE START</div>
          <h1 class="guidance-title">A little guidance. Then you're ready.</h1>
          <div class="guidance-subtitle">Eight simple steps to support your work. You can revisit this guide at any time.</div>
        </div>

        <div class="guidance-cards-grid">
          <!-- Card 01 -->
          <div class="guidance-card">
            <div class="guidance-card-badge" style="background: var(--pale-sky-mist);">01</div>
            <div class="guidance-card-title">Your care dashboard</div>
            <div class="guidance-card-desc">See recent work, upcoming check-ins and your daily rhythm.</div>
          </div>

          <!-- Card 02 -->
          <div class="guidance-card">
            <div class="guidance-card-badge" style="background: var(--muted-sage); color: white;">02</div>
            <div class="guidance-card-title">Register a child</div>
            <div class="guidance-card-desc">Create a profile with a caregiver's consent and basic details.</div>
          </div>

          <!-- Card 03 -->
          <div class="guidance-card">
            <div class="guidance-card-badge" style="background: var(--muted-sage); color: white;">03</div>
            <div class="guidance-card-title">Start an assessment</div>
            <div class="guidance-card-desc">Record growth, nutrition, mood, activity and skills.</div>
          </div>

          <!-- Card 04 -->
          <div class="guidance-card">
            <div class="guidance-card-badge" style="background: var(--soft-peach-badge);">04</div>
            <div class="guidance-card-title">Note any concerns</div>
            <div class="guidance-card-desc">Add observations without assigning a diagnosis.</div>
          </div>

          <!-- Card 05 -->
          <div class="guidance-card">
            <div class="guidance-card-badge" style="background: var(--muted-lavender);">05</div>
            <div class="guidance-card-title">Try a guided activity</div>
            <div class="guidance-card-desc">Use a simple, age-appropriate game to observe and connect.</div>
          </div>

          <!-- Card 06 -->
          <div class="guidance-card">
            <div class="guidance-card-badge" style="background: var(--pale-sky-mist);">06</div>
            <div class="guidance-card-title">Review the session</div>
            <div class="guidance-card-desc">Check your notes and choose a clear next step.</div>
          </div>

          <!-- Card 07 -->
          <div class="guidance-card">
            <div class="guidance-card-badge" style="background: var(--warm-sand);">07</div>
            <div class="guidance-card-title">Plan a follow-up</div>
            <div class="guidance-card-desc">Keep caregivers involved with small, practical care habits.</div>
          </div>

          <!-- Card 08 -->
          <div class="guidance-card">
            <div class="guidance-card-badge" style="background: var(--soft-eucalyptus);">08</div>
            <div class="guidance-card-title">Take care of yourself</div>
            <div class="guidance-card-desc">Pause, rest your eyes and come back when you're ready.</div>
          </div>
        </div>

        <div class="guidance-bottom-banner">
          <div>
            <div class="guidance-banner-title">You don't need to do it all at once.</div>
            <div class="guidance-banner-desc">Start with one child. Save your progress. Every small step counts.</div>
          </div>
          <button class="guidance-banner-btn" onclick="navigateTo('dashboard')">
            Go to my dashboard &rarr;
          </button>
        </div>
      </div>

      <div class="guidance-footer-note">
        Designed for a calm start &middot; No sounds or animations by default &middot; Help is always nearby
      </div>
    </div>
  `;
}

// FRAME 3: MAIN DASHBOARD VIEW
function renderDashboardView() {
  const workerName = AppState.auth.currentUser ? AppState.auth.currentUser.name : 'Sunita Sharma';
  const workerLoc = AppState.auth.currentUser ? AppState.auth.currentUser.location : 'Jaipur';
  const childCount = AppState.caseload.length > 0 ? AppState.caseload.length : 128;

  return `
    <div class="dashboard-content-area">
      <!-- Header Row -->
      <div class="dashboard-header-row">
        <div>
          <div class="dashboard-daily-kicker">YOUR DAILY CARE SPACE</div>
          <h1 class="dashboard-greeting">Good morning, ${workerName.split(' ')[0]}</h1>
          <div class="dashboard-motto">A little progress today. A lasting difference tomorrow.</div>
        </div>
        <div>
          <button class="btn-register-child-top" onclick="startChildRegistration()">
            + Register a child
          </button>
        </div>
      </div>

      <!-- Pick Up Where You Left Off Banner -->
      <div class="pick-up-banner">
        <div>
          <div class="pick-up-kicker">PICK UP WHERE YOU LEFT OFF</div>
          <h2 class="pick-up-title">${AppState.currentChild.name.split(' ')[0]}'s next small step</h2>
          <div class="pick-up-sub">Primary assessment &middot; Nutrition & daily habits</div>
          <div class="pick-up-tags">
            <span class="pill-white">Saved just now</span>
            <span style="font-size: 12px; color: #4B5563;">3 of 7 sections complete</span>
          </div>
        </div>
        <div class="pick-up-right">
          <button class="btn-continue-assessment" onclick="proceedToAssessment()">
            Continue assessment &rarr;
          </button>
          <div class="pick-up-note">Your notes are safe. Go at your own pace.</div>
        </div>
      </div>

      <!-- 4 Stats Cards -->
      <div class="dashboard-stats-grid">
        <div class="stat-metric-card">
          <div class="stat-number-row">
            <span class="stat-number">${childCount}</span>
            <span class="stat-label">Children registered</span>
          </div>
          <div class="stat-caption">Across 3 grades</div>
        </div>

        <div class="stat-metric-card">
          <div class="stat-number-row">
            <span class="stat-number">18</span>
            <span class="stat-label">Sessions this week</span>
          </div>
          <div class="stat-caption">Every conversation counts</div>
        </div>

        <div class="stat-metric-card">
          <div class="stat-number-row">
            <span class="stat-number">06</span>
            <span class="stat-label">Follow-ups to plan</span>
          </div>
          <div class="stat-caption">A gentle next step</div>
        </div>

        <div class="stat-metric-card tinted">
          <div class="stat-number-row">
            <span class="stat-number">12</span>
            <span class="stat-label">Care plans shared</span>
          </div>
          <div class="stat-caption">Supporting families</div>
        </div>
      </div>

      <!-- Two-column Area: Children table and Self-care widget -->
      <div class="dashboard-two-col">
        <!-- Left: Children Table -->
        <div class="children-table-card">
          <div class="table-card-header">
            <h3 class="table-card-title">Children to check in with</h3>
            <a class="table-view-all-link" onclick="navigateTo('children')">View all children &rarr;</a>
          </div>

          <div class="filter-pills-row">
            <button class="filter-pill ${AppState.filterStatus === 'all' ? 'active' : ''}" onclick="setFilter('all')">All children</button>
            <button class="filter-pill ${AppState.filterStatus === 'followups' ? 'active' : ''}" onclick="setFilter('followups')">Follow-ups</button>
            <button class="filter-pill ${AppState.filterStatus === 'drafts' ? 'active' : ''}" onclick="setFilter('drafts')">Drafts</button>
          </div>

          <table class="care-table">
            <thead>
              <tr>
                <th style="width: 45%;">CHILD</th>
                <th style="width: 25%;">LAST SESSION</th>
                <th style="width: 30%;">NEXT STEP</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div class="child-cell-name">Aarav Meena</div>
                  <div class="child-cell-sub">6 years &middot; Grade 1 A</div>
                </td>
                <td style="color: var(--text-muted);">Today, 9:30 am</td>
                <td>
                  <button class="table-action-pill sky" onclick="proceedToAssessment()">
                    Continue assessment &rarr;
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="child-cell-name">Meera Kumari</div>
                  <div class="child-cell-sub">7 years &middot; Grade 2 B</div>
                </td>
                <td style="color: var(--text-muted);">10 Nov 2026</td>
                <td>
                  <button class="table-action-pill peach" onclick="proceedToAssessment()">
                    Caregiver check-in &rarr;
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="child-cell-name">Kabir Khan</div>
                  <div class="child-cell-sub">6 years &middot; Grade 1 B</div>
                </td>
                <td style="color: var(--text-muted);">09 Nov 2026</td>
                <td>
                  <button class="table-action-pill sage" onclick="proceedToAssessment()">
                    Review nutrition &rarr;
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Right: Make room for you, too -->
        <div class="self-care-card">
          <h3 class="self-care-title">Make room for you, too</h3>
          <div class="self-care-sub">A calm rhythm for a busy day.</div>

          <div class="circular-timer-wrap">
            <svg class="timer-circle-svg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" stroke-width="6" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#7A91A8" stroke-width="6" stroke-dasharray="264" stroke-dashoffset="${264 - (AppState.timerSeconds / 1440) * 264}" stroke-linecap="round" />
            </svg>
            <div class="timer-digits" id="timer-digits-display">
              ${Math.floor(AppState.timerSeconds / 60).toString().padStart(2, '0')}:${(AppState.timerSeconds % 60).toString().padStart(2, '0')}
            </div>
            <div class="timer-sub-text">until your 5-minute break</div>
          </div>

          <div class="timer-actions-row">
            <button class="btn-timer-secondary" onclick="toggleTimer()">
              ${AppState.timerRunning ? 'Pause timer' : 'Start timer'}
            </button>
            <button class="btn-timer-secondary ${AppState.quietMode ? 'quiet' : ''}" onclick="toggleQuietMode()">
              ${AppState.quietMode ? 'Quiet mode on' : 'Quiet mode off'}
            </button>
          </div>

          <div class="small-win-box">
            <div class="small-win-kicker">One small win</div>
            <div class="small-win-text">You've checked in with 4 children today. That matters.</div>
          </div>
        </div>
      </div>

      <!-- Bottom Community Ticker -->
      <div class="community-ticker-bar">
        <div class="community-pill-badge">COMMUNITY</div>
        <div class="community-ticker-text">
          A shared moment: "A caregiver kept their first follow-up visit this week."
        </div>
        <a class="community-visit-link" onclick="navigateTo('community')">Visit community &rarr;</a>
      </div>
    </div>
  `;
}

function setFilter(filter) {
  AppState.filterStatus = filter;
  renderApp();
}

// FRAME 4: STEP 1: CHILD DETAILS
function renderStep1ChildDetails() {
  return `
    <div class="dashboard-content-area">
      <div class="workflow-breadcrumbs">Children / New child</div>
      <h1 class="workflow-page-title">Let's get to know a child</h1>
      <div class="workflow-page-sub">Start with the basics. You can add more details later.</div>

      <!-- Stepper Header -->
      <div class="workflow-stepper-bar">
        <div class="step-item active">
          <div class="step-circle">1</div>
          <span>Child details</span>
        </div>
        <div class="step-item">
          <div class="step-circle">2</div>
          <span>Primary assessment</span>
        </div>
        <div class="step-item">
          <div class="step-circle">3</div>
          <span>Guided activity</span>
        </div>
        <div class="step-item">
          <div class="step-circle">4</div>
          <span>Session summary</span>
        </div>
      </div>

      <div class="registration-workflow-grid">
        <!-- Left: Form -->
        <div class="white-panel-card">
          <form onsubmit="handleChildDetailsSubmit(event)">
            <div class="section-legend-title">Child's details</div>
            <div class="auth-form-grid">
              <div class="form-field">
                <label class="form-label">Full name *</label>
                <input type="text" class="form-input" id="child-name" value="${AppState.currentChild.name}" required />
              </div>

              <div class="form-field">
                <label class="form-label">Age *</label>
                <input type="text" class="form-input" id="child-age" value="${AppState.currentChild.age}" required />
              </div>

              <div class="form-field">
                <label class="form-label">School *</label>
                <input type="text" class="form-input" id="child-school" value="${AppState.currentChild.school}" required />
              </div>

              <div class="form-field">
                <label class="form-label">Grade & section *</label>
                <select class="form-select" id="child-grade" required>
                  <option value="Grade 1 A" selected>Grade 1 A &or;</option>
                  <option value="Grade 1 B">Grade 1 B</option>
                  <option value="Grade 2 A">Grade 2 A</option>
                  <option value="Grade 2 B">Grade 2 B</option>
                </select>
              </div>
            </div>

            <div class="section-legend-title" style="margin-top: 28px;">Caregiver's details</div>
            <div class="auth-form-grid">
              <div class="form-field">
                <label class="form-label">Caregiver name *</label>
                <input type="text" class="form-input" id="caregiver-name" value="${AppState.currentChild.guardian}" required />
              </div>

              <div class="form-field">
                <label class="form-label">Relationship to child *</label>
                <select class="form-select" id="caregiver-rel" required>
                  <option value="Mother" selected>Mother &or;</option>
                  <option value="Father">Father</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Other Guardian">Other Guardian</option>
                </select>
              </div>

              <div class="form-field">
                <label class="form-label">Contact number *</label>
                <input type="tel" class="form-input" id="caregiver-phone" value="${AppState.currentChild.phone}" required />
              </div>

              <div class="form-field">
                <label class="form-label">Preferred language</label>
                <select class="form-select" id="caregiver-lang">
                  <option value="Hindi" selected>Hindi &or;</option>
                  <option value="English">English</option>
                  <option value="Kannada">Kannada</option>
                </select>
              </div>
            </div>

            <div class="consent-highlight-box">
              <input type="checkbox" id="consent-check" required checked />
              <div>
                <div class="consent-title">Caregiver consent has been obtained.</div>
                <div class="consent-desc">I have explained how the child's information will be used for care and follow-up.</div>
              </div>
            </div>

            <!-- Bottom Action Bar -->
            <div class="workflow-bottom-bar" style="margin-top: 32px;">
              <div class="draft-saved-indicator">&check; Draft saved &middot; Just now</div>
              <div class="workflow-actions-right">
                <button type="button" class="btn-workflow-outline" onclick="navigateTo('dashboard')">Save & exit</button>
                <button type="submit" class="btn-workflow-primary">Start assessment &rarr;</button>
              </div>
            </div>
          </form>
        </div>

        <!-- Right Side Guidance Cards -->
        <div>
          <div class="guidance-side-card sky">
            <h3 class="guidance-side-title">A comfortable beginning</h3>
            <div class="guidance-side-sub">A few things to keep in mind</div>
            <div class="guidance-side-list">
              <div class="side-list-item">
                <span class="side-list-num">01</span>
                <span>Introduce yourself and explain the purpose of the session.</span>
              </div>
              <div class="side-list-item">
                <span class="side-list-num">02</span>
                <span>Let the caregiver know they can ask questions or pause.</span>
              </div>
              <div class="side-list-item">
                <span class="side-list-num">03</span>
                <span>Only collect information needed to support the child.</span>
              </div>
            </div>
          </div>

          <div class="guidance-side-card peach">
            <h3 class="guidance-side-title">Their story stays private.</h3>
            <p style="font-size: 13px; color: var(--text-main); line-height: 1.5;">
              Keep records within the authorised care team. Never share a child's information in community posts.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function handleChildDetailsSubmit(e) {
  e.preventDefault();
  AppState.currentChild.name = document.getElementById('child-name').value;
  AppState.currentChild.age = document.getElementById('child-age').value;
  AppState.currentChild.school = document.getElementById('child-school').value;
  AppState.currentChild.guardian = document.getElementById('caregiver-name').value;
  AppState.currentChild.phone = document.getElementById('caregiver-phone').value;

  // Save to Supabase if connected
  if (window.SupabaseService && window.SupabaseService.isConfigured()) {
    try {
      window.SupabaseService.insertChild({
        id: AppState.currentChild.name.toLowerCase().replace(/\s+/g, '-'),
        name: AppState.currentChild.name,
        age: AppState.currentChild.age,
        address: AppState.currentChild.school,
        guardian_name: AppState.currentChild.guardian,
        guardian_phone: AppState.currentChild.phone,
        asha_worker: AppState.auth.currentUser ? AppState.auth.currentUser.name : 'ASHA Worker'
      });
    } catch (err) {
      console.warn("Could not save to Supabase:", err);
    }
  }

  proceedToAssessment();
}

// FRAME 5: STEP 2: PRIMARY ASSESSMENT
function renderStep2Assessment() {
  return `
    <div class="dashboard-content-area">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <div class="workflow-breadcrumbs">Children / ${AppState.currentChild.name} / Primary assessment</div>
        <div style="background: var(--light-sage); padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #1E2124;">
          Focus mode on &middot; 24:00 <span style="font-size: 11px; color: #6B7280; font-weight: 400;">Quiet notifications &middot; Pause timer</span>
        </div>
      </div>

      <h1 class="workflow-page-title">One small step at a time</h1>
      <div class="workflow-page-sub">Record what you observe. It's okay not to know yet.</div>

      <!-- Stepper Header -->
      <div class="workflow-stepper-bar">
        <div class="step-item completed">
          <div class="step-circle">&check;</div>
          <span>Child details</span>
        </div>
        <div class="step-item active">
          <div class="step-circle">2</div>
          <span>Primary assessment</span>
        </div>
        <div class="step-item">
          <div class="step-circle">3</div>
          <span>Guided activity</span>
        </div>
        <div class="step-item">
          <div class="step-circle">4</div>
          <span>Session summary</span>
        </div>
      </div>

      <div class="assessment-layout-grid">
        <!-- Left: Assessment Sections Sub-nav -->
        <div class="assessment-subnav-panel">
          <div class="subnav-kicker">ASSESSMENT SECTIONS</div>
          <div class="subnav-progress-num">3 of 7 complete</div>
          <div class="progress-bar-line">
            <div class="progress-bar-fill"></div>
          </div>

          <div class="subnav-sections-list">
            <button class="subnav-item done">&check; Height</button>
            <button class="subnav-item done">&check; Weight</button>
            <button class="subnav-item done">&check; Appetite</button>
            <button class="subnav-item active">4 Everyday nutrition</button>
            <button class="subnav-item">5 Behaviour / mood</button>
            <button class="subnav-item">6 Activity</button>
            <button class="subnav-item">7 Skills</button>
          </div>

          <div style="font-size: 11px; color: var(--text-muted); margin-top: 24px; line-height: 1.4;">
            You can return to any section before finishing.
          </div>
        </div>

        <!-- Center: Form Section -->
        <div class="white-panel-card">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">
            SECTION 4 OF 7
          </div>
          <h2 style="font-size: 22px; font-weight: 700; color: var(--text-heading); margin-bottom: 4px;">
            Everyday nutrition
          </h2>
          <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 24px;">
            Ask the caregiver about a usual day, not a perfect one.
          </div>

          <div style="margin-bottom: 24px;">
            <label class="form-label" style="font-size: 14px; font-weight: 600;">How many meals does ${AppState.currentChild.name.split(' ')[0]} usually have?</label>
            <div class="radio-pill-options">
              <button type="button" class="radio-pill-btn" onclick="selectMeals('1-2 meals')">1-2 meals</button>
              <button type="button" class="radio-pill-btn active" onclick="selectMeals('3 or more')">&bull; 3 or more</button>
              <button type="button" class="radio-pill-btn" onclick="selectMeals('Not sure yet')">&cir; Not sure yet</button>
            </div>
            <div style="font-size: 11px; color: var(--text-muted);">Include school meals when counting.</div>
          </div>

          <div style="margin-bottom: 24px;">
            <label class="form-label" style="font-size: 14px; font-weight: 600;">Which foods were eaten yesterday?</label>
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">Select all that apply. Ask without judgment.</div>
            <div class="checkbox-options-grid">
              <label class="custom-check-item">
                <input type="checkbox" checked /> Grains & cereals
              </label>
              <label class="custom-check-item">
                <input type="checkbox" checked /> Dal, beans or eggs
              </label>
              <label class="custom-check-item">
                <input type="checkbox" /> Vegetables & fruit
              </label>
              <label class="custom-check-item">
                <input type="checkbox" /> Milk or curd
              </label>
            </div>
          </div>

          <div style="margin-bottom: 28px;">
            <label class="form-label" style="font-size: 14px; font-weight: 600;">Anything you'd like to note? (optional)</label>
            <textarea class="form-textarea" rows="3">${AppState.currentChild.nutritionNotes}</textarea>
          </div>

          <!-- Bottom Bar -->
          <div class="workflow-bottom-bar">
            <div class="draft-saved-indicator">&check; Draft saved &middot; Just now</div>
            <div class="workflow-actions-right">
              <button type="button" class="btn-workflow-outline" onclick="navigateTo('dashboard')">Save & exit</button>
              <button type="button" class="btn-workflow-outline" onclick="AppState.workflowStep = 1; renderApp();">&larr; Back</button>
              <button type="button" class="btn-workflow-primary" onclick="proceedToGuidedActivity()">Next: guided activity &rarr;</button>
            </div>
          </div>
        </div>

        <!-- Right Side Stats Column -->
        <div>
          <div class="child-avatar-card sky">
            <div class="avatar-card-name">${AppState.currentChild.name}</div>
            <div class="avatar-card-meta">${AppState.currentChild.age} &middot; ${AppState.currentChild.grade}</div>
            <div class="avatar-card-meta">Caregiver: ${AppState.currentChild.guardian}</div>
          </div>

          <div class="recorded-metrics-card">
            <div style="font-size: 13px; font-weight: 700; color: var(--text-heading); margin-bottom: 12px;">Recorded so far</div>
            <div class="recorded-metric-row">
              <span style="color: var(--text-muted);">Height</span>
              <span style="font-weight: 600;">112 cm</span>
            </div>
            <div class="recorded-metric-row">
              <span style="color: var(--text-muted);">Weight</span>
              <span style="font-weight: 600;">18 kg</span>
            </div>
            <div class="recorded-metric-row">
              <span style="color: var(--text-muted);">Appetite</span>
              <span style="font-weight: 600;">Varies day to day</span>
            </div>
          </div>

          <div class="guidance-side-card peach">
            <div style="font-size: 14px; font-weight: 700; color: var(--text-heading); margin-bottom: 6px;">Something on your mind?</div>
            <p style="font-size: 12px; color: var(--text-muted); line-height: 1.4; margin-bottom: 14px;">
              Add a concern for a qualified care professional to review. You don't need to label it.
            </p>
            <button class="btn-workflow-outline" style="width: 100%; padding: 8px; font-size: 13px;" onclick="alert('Observation note flagged for medical review.')">
              + Add a concern
            </button>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 10px; text-align: center;">
              This is a record of observations, not a diagnosis.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function selectMeals(val) {
  AppState.currentChild.mealsCount = val;
  renderApp();
}

// FRAME 6: STEP 3: GUIDED ACTIVITY
function renderStep3GuidedActivity() {
  return `
    <div class="dashboard-content-area">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <div class="workflow-breadcrumbs">Children / ${AppState.currentChild.name} / Guided activity</div>
        <button class="btn-timer-secondary quiet" style="padding: 6px 14px; font-size: 12px;">
          Quiet mode on
        </button>
      </div>

      <h1 class="workflow-page-title">Make room for a little play</h1>
      <div class="workflow-page-sub">A moment to connect, not a test to pass.</div>

      <!-- Stepper Header -->
      <div class="workflow-stepper-bar">
        <div class="step-item completed">
          <div class="step-circle">&check;</div>
          <span>Child details</span>
        </div>
        <div class="step-item completed">
          <div class="step-circle">&check;</div>
          <span>Primary assessment</span>
        </div>
        <div class="step-item active">
          <div class="step-circle">3</div>
          <span>Guided activity</span>
        </div>
        <div class="step-item">
          <div class="step-circle">4</div>
          <span>Session summary</span>
        </div>
      </div>

      <div class="registration-workflow-grid">
        <!-- Left: Interactive Play Area -->
        <div class="white-panel-card">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px;">
            <h2 style="font-size: 20px; font-weight: 700; color: var(--text-heading);">Match the shapes</h2>
            <span style="font-size: 12px; color: var(--text-muted);">3-5 minutes</span>
          </div>

          <div class="activity-banner-prompt">
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); display: block; margin-bottom: 2px;">SAY TOGETHER</span>
            "Can you find the circle? You can point or tell me."
          </div>

          <div class="shapes-play-arena">
            <div class="play-arena-title">Find the circle</div>
            <div class="play-arena-sub">Take your time. There's no hurry.</div>

            <div class="shapes-card-row">
              <div class="shape-interactive-card" onclick="selectPlayShape('circle')" style="${AppState.activitySelectedShape === 'circle' ? 'border-color: var(--primary-blue); background: var(--pale-sky-mist);' : ''}">
                <div class="shape-visual-circle"></div>
                <div class="shape-card-label">Circle</div>
              </div>

              <div class="shape-interactive-card" onclick="selectPlayShape('square')" style="${AppState.activitySelectedShape === 'square' ? 'border-color: var(--muted-sage); background: var(--light-sage);' : ''}">
                <div class="shape-visual-square"></div>
                <div class="shape-card-label">Square</div>
              </div>

              <div class="shape-interactive-card" onclick="selectPlayShape('triangle')" style="${AppState.activitySelectedShape === 'triangle' ? 'border-color: var(--muted-lavender);' : ''}">
                <div class="shape-visual-triangle"></div>
                <div class="shape-card-label">Triangle</div>
              </div>
            </div>

            ${AppState.activitySelectedShape ? `
              <div style="margin-top: 24px; font-size: 14px; font-weight: 600; color: #1E2124;">
                &check; Shape selected: ${AppState.activitySelectedShape.toUpperCase()}. Wonderful observation!
              </div>
            ` : ''}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div style="display: flex; gap: 10px;">
              <button type="button" class="btn-timer-secondary" onclick="alert('Activity paused. Resume whenever ready.')">Pause activity</button>
              <button type="button" class="btn-timer-secondary" onclick="alert('Loaded alternative: Animal sound imitation.')">Try another activity</button>
            </div>
            <div style="font-size: 12px; color: var(--text-muted);">1 of 3 prompts</div>
          </div>

          <!-- Bottom Action Bar -->
          <div class="workflow-bottom-bar">
            <div class="draft-saved-indicator">&check; Observations saved</div>
            <div class="workflow-actions-right">
              <button type="button" class="btn-workflow-outline" onclick="proceedToSessionSummary()">Skip activity</button>
              <button type="button" class="btn-workflow-primary" onclick="proceedToSessionSummary()">Finish & review &rarr;</button>
            </div>
          </div>
        </div>

        <!-- Right Side Observational Checklist -->
        <div>
          <div class="child-avatar-card lavender">
            <div class="avatar-card-name">${AppState.currentChild.name}</div>
            <div class="avatar-card-meta">${AppState.currentChild.age} &middot; ${AppState.currentChild.grade} &middot; Caregiver present</div>
          </div>

          <div class="white-panel-card" style="margin-bottom: 20px; padding: 22px;">
            <div style="font-size: 15px; font-weight: 700; color: var(--text-heading); margin-bottom: 4px;">Notice, don't score</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">How did the child join in?</div>

            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
              <label class="custom-check-item">
                <input type="radio" name="child-join" ${AppState.activityOutcome === 'Independently' ? 'checked' : ''} onchange="AppState.activityOutcome='Independently'" /> Independently
              </label>
              <label class="custom-check-item">
                <input type="radio" name="child-join" ${AppState.activityOutcome === 'With encouragement' ? 'checked' : ''} onchange="AppState.activityOutcome='With encouragement'" /> With encouragement
              </label>
              <label class="custom-check-item">
                <input type="radio" name="child-join" ${AppState.activityOutcome === 'Not ready today' ? 'checked' : ''} onchange="AppState.activityOutcome='Not ready today'" /> Not ready today
              </label>
            </div>

            <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px;">A gentle note</div>
            <textarea class="form-textarea" rows="3" onchange="AppState.activityNotes=this.value">${AppState.activityNotes}</textarea>
          </div>

          <div class="guidance-side-card peach">
            <div style="font-size: 14px; font-weight: 700; color: var(--text-heading); margin-bottom: 4px;">It's okay to pause or skip.</div>
            <p style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">
              Let the child lead. Stop if they seem tired or uncomfortable.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// FRAME 7: STEP 4: SESSION SUMMARY
function renderStep4SessionSummary() {
  return `
    <div class="dashboard-content-area">
      <div class="workflow-breadcrumbs">Children / ${AppState.currentChild.name} / Session summary</div>
      <h1 class="workflow-page-title">A small step. Meaningful care.</h1>
      <div class="workflow-page-sub">Your session is saved. Here's what you've recorded and what comes next.</div>

      <!-- Green Complete Banner -->
      <div class="session-summary-banner">
        <div class="summary-banner-left">
          <div class="summary-check-icon">&check;</div>
          <div>
            <div class="summary-banner-title">${AppState.currentChild.name.split(' ')[0]}'s session is complete</div>
            <div class="summary-banner-sub">11 Nov 2026 &middot; 7 sections recorded &middot; Guided activity included</div>
          </div>
        </div>
        <div>
          <button class="btn-workflow-outline" onclick="navigateTo('children')">
            View child profile &rarr;
          </button>
        </div>
      </div>

      <div class="registration-workflow-grid">
        <!-- Left: Summary Details Card -->
        <div class="white-panel-card">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
            <h2 style="font-size: 20px; font-weight: 700; color: var(--text-heading);">Session at a glance</h2>
            <a style="font-size: 12px; font-weight: 600; color: var(--text-main); text-decoration: underline; cursor: pointer;" onclick="proceedToAssessment()">Edit notes</a>
          </div>
          <div style="font-size: 13px; color: var(--text-muted);">
            ${AppState.currentChild.name} &middot; ${AppState.currentChild.age} &middot; ${AppState.currentChild.grade} &middot; Caregiver: ${AppState.currentChild.guardian}
          </div>

          <div class="summary-glance-metrics">
            <div class="glance-metric-tile sky">
              <div class="glance-metric-kicker">HEIGHT</div>
              <div class="glance-metric-val">112 cm</div>
            </div>
            <div class="glance-metric-tile sky">
              <div class="glance-metric-kicker">WEIGHT</div>
              <div class="glance-metric-val">18 kg</div>
            </div>
            <div class="glance-metric-tile sand">
              <div class="glance-metric-kicker">APPETITE</div>
              <div class="glance-metric-val" style="font-size: 16px; margin-top: 6px;">Varies day to day</div>
            </div>
          </div>

          <div class="summary-notes-group">
            <div class="summary-notes-label">Everyday nutrition</div>
            <div class="summary-notes-body">
              3 or more meals most days. Breakfast is sometimes skipped. Grains and dal reported yesterday.
            </div>
          </div>

          <div class="summary-notes-group">
            <div class="summary-notes-label">Behaviour & activity</div>
            <div class="summary-notes-body">
              Settles with caregiver reassurance. Joins activities with encouragement.
            </div>
          </div>

          <div class="summary-notes-group">
            <div class="summary-notes-label">Skills & guided play</div>
            <div class="summary-notes-body">
              Followed a simple instruction during the shape-matching activity.
            </div>
          </div>

          <div class="summary-next-box">
            <div class="summary-next-title">For the next conversation</div>
            <div class="summary-next-text">
              Ask about barriers to breakfast. No diagnosis or referral has been recorded in this session.
            </div>
          </div>
        </div>

        <!-- Right Side Care Continuity Cards -->
        <div>
          <div class="guidance-side-card sky">
            <h3 class="guidance-side-title">Keep the care going</h3>
            <div class="guidance-side-sub">A simple next step with the caregiver.</div>

            <div style="background: #FFFFFF; border-radius: 8px; padding: 12px; margin-bottom: 14px;">
              <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">FOLLOW-UP DATE</div>
              <div style="font-size: 14px; font-weight: 700; color: var(--text-heading); margin-top: 2px;">
                18 Nov 2026 &middot; <span style="font-size: 12px; color: var(--primary-blue); cursor: pointer;">Change</span>
              </div>
            </div>

            <p style="font-size: 13px; color: var(--text-main); line-height: 1.4; margin-bottom: 16px;">
              Discuss the morning meal routine and any practical barriers with ${AppState.currentChild.guardian.split(' ')[0]}.
            </p>

            <button class="btn-workflow-outline" style="width: 100%;" onclick="alert('Care plan summary prepared for caregiver.')">
              Review caregiver care plan &rarr;
            </button>
            <div style="font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 8px;">
              Review with the caregiver before sharing.
            </div>
          </div>

          <div class="guidance-side-card peach">
            <h3 class="guidance-side-title">You showed up. Thank you.</h3>
            <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-bottom: 16px;">
              Rest your eyes, have some water, or take a quiet five minutes.
            </p>
            <button class="btn-workflow-outline" style="width: 100%;" onclick="toggleTimer()">
              Take a 5-minute break
            </button>
          </div>
        </div>
      </div>

      <div class="clinical-disclaimer-note">
        A record of observations, not a diagnosis. Consult a qualified care professional for clinical assessment or ongoing concerns.
      </div>

      <!-- Bottom Bar -->
      <div class="workflow-bottom-bar">
        <div class="draft-saved-indicator">&check; All changes saved</div>
        <div class="workflow-actions-right">
          <button type="button" class="btn-workflow-outline" onclick="navigateTo('dashboard')">Back to dashboard</button>
          <button type="button" class="btn-workflow-primary" onclick="startChildRegistration()">Register another child &rarr;</button>
        </div>
      </div>
    </div>
  `;
}

// TAB: CHILDREN CASELOAD DIRECTORY
function renderChildrenView() {
  return `
    <div class="dashboard-content-area">
      <div class="dashboard-header-row">
        <div>
          <div class="dashboard-daily-kicker">CASELOAD DIRECTORY</div>
          <h1 class="dashboard-greeting">Assigned Children</h1>
          <div class="dashboard-motto">Active developmental records in your assigned catchment.</div>
        </div>
        <button class="btn-register-child-top" onclick="startChildRegistration()">
          + Register a child
        </button>
      </div>

      <div class="children-table-card" style="margin-top: 20px;">
        <div style="display: flex; gap: 12px; margin-bottom: 20px;">
          <input type="text" class="form-input" style="max-width: 380px;" placeholder="Search child by name, ID or guardian..." oninput="AppState.searchQuery=this.value; renderApp();" value="${AppState.searchQuery}" />
        </div>

        <table class="care-table">
          <thead>
            <tr>
              <th>CHILD</th>
              <th>CAREGIVER</th>
              <th>FACILITY</th>
              <th>CARE STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="child-cell-name">Aarav Meena</div>
                <div class="child-cell-sub">6 years &middot; Grade 1 A</div>
              </td>
              <td>Pooja Meena (+91 98765 43210)</td>
              <td>Govt. Primary School, Shastri Nagar</td>
              <td><span class="pill-white" style="background: var(--light-sage);">Active Care</span></td>
              <td>
                <button class="table-action-pill sky" onclick="proceedToAssessment()">View / Assess &rarr;</button>
              </td>
            </tr>
            <tr>
              <td>
                <div class="child-cell-name">Meera Kumari</div>
                <div class="child-cell-sub">7 years &middot; Grade 2 B</div>
              </td>
              <td>Radha Kumari</td>
              <td>Govt. Primary School, Shastri Nagar</td>
              <td><span class="pill-white" style="background: var(--pale-sky-mist);">Follow-up Due</span></td>
              <td>
                <button class="table-action-pill peach" onclick="proceedToAssessment()">Check-in &rarr;</button>
              </td>
            </tr>
            <tr>
              <td>
                <div class="child-cell-name">Kabir Khan</div>
                <div class="child-cell-sub">6 years &middot; Grade 1 B</div>
              </td>
              <td>Fatima Khan</td>
              <td>Govt. Primary School, Shastri Nagar</td>
              <td><span class="pill-white" style="background: var(--soft-warm-peach);">Nutrition Review</span></td>
              <td>
                <button class="table-action-pill sage" onclick="proceedToAssessment()">Review &rarr;</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// TAB: COMMUNITY VIEW
function renderCommunityView() {
  return `
    <div class="dashboard-content-area">
      <div class="dashboard-header-row">
        <div>
          <div class="dashboard-daily-kicker">COMMUNITY CARE HUB</div>
          <h1 class="dashboard-greeting">Shared Moments & Peer Support</h1>
          <div class="dashboard-motto">Gentle encouragement and practical field tips from fellow ASHA workers.</div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 24px;">
        <div class="white-panel-card">
          <div class="community-pill-badge" style="display: inline-block; margin-bottom: 10px;">COMMUNITY MOMENT</div>
          <p style="font-size: 15px; font-weight: 600; color: var(--text-heading); margin-bottom: 6px;">
            "A caregiver kept their first follow-up visit this week."
          </p>
          <div style="font-size: 12px; color: var(--text-muted);">Shared by ASHA Facilitator &middot; Jaipur North Sector</div>
        </div>

        <div class="white-panel-card">
          <div class="community-pill-badge" style="display: inline-block; margin-bottom: 10px; background: var(--muted-sage); color: white;">FIELD TIP</div>
          <p style="font-size: 15px; font-weight: 600; color: var(--text-heading); margin-bottom: 6px;">
            "Using simple shapes during play helped an anxious 5-year-old open up before we recorded measurements."
          </p>
          <div style="font-size: 12px; color: var(--text-muted);">Shared by Sunita Sharma &middot; 2 days ago</div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// MAIN CONTROLLER: renderApp()
// -------------------------------------------------------------
function renderApp() {
  const root = document.getElementById('app-root');
  if (!root) return;

  // Unauthenticated -> Render Auth Split View
  if (!AppState.auth.isAuthenticated) {
    root.innerHTML = renderAuthScreen();
    return;
  }

  // Guidance Screen -> Render Frame 2
  if (AppState.activeTab === 'guidance') {
    root.innerHTML = renderGuidanceScreen();
    return;
  }

  // Workflows (Child registration, assessment, play, summary)
  let mainContentHtml = '';
  if (AppState.activeTab === 'assessments') {
    switch (AppState.workflowStep) {
      case 1: mainContentHtml = renderStep1ChildDetails(); break;
      case 2: mainContentHtml = renderStep2Assessment(); break;
      case 3: mainContentHtml = renderStep3GuidedActivity(); break;
      case 4: mainContentHtml = renderStep4SessionSummary(); break;
      default: mainContentHtml = renderStep1ChildDetails();
    }
  } else if (AppState.activeTab === 'children') {
    mainContentHtml = renderChildrenView();
  } else if (AppState.activeTab === 'community') {
    mainContentHtml = renderCommunityView();
  } else {
    mainContentHtml = renderDashboardView();
  }

  const workerName = AppState.auth.currentUser ? AppState.auth.currentUser.name : 'Sunita Sharma';
  const workerLoc = AppState.auth.currentUser ? AppState.auth.currentUser.location : 'Jaipur';
  const facility = AppState.auth.currentUser ? AppState.auth.currentUser.facility : 'GOVT. PRIMARY SCHOOL, SHASTRI NAGAR';

  root.innerHTML = `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="app-sidebar">
        <div class="sidebar-top">
          <div class="sidebar-brand-group">
            <div class="sidebar-brand">
              <span class="sidebar-brand-heart">&#9825;</span>
              <span>wecare</span>
            </div>
            <div class="sidebar-tagline">CARE, ONE CHILD AT A TIME</div>
          </div>

          <nav class="sidebar-nav">
            <button class="sidebar-nav-item ${AppState.activeTab === 'dashboard' ? 'active' : ''}" onclick="navigateTo('dashboard')">
              <span style="font-size: 16px;">&#8862;</span>
              <span>Overview</span>
            </button>

            <button class="sidebar-nav-item ${AppState.activeTab === 'children' ? 'active' : ''}" onclick="navigateTo('children')">
              <span style="font-size: 16px;">&#128101;</span>
              <span>Children</span>
            </button>

            <button class="sidebar-nav-item ${AppState.activeTab === 'assessments' ? 'active' : ''}" onclick="navigateTo('assessments')">
              <span style="font-size: 16px;">&#128221;</span>
              <span>Assessments</span>
            </button>

            <button class="sidebar-nav-item ${AppState.activeTab === 'community' ? 'active' : ''}" onclick="navigateTo('community')">
              <span style="font-size: 16px;">&#9825;</span>
              <span>Community</span>
            </button>
          </nav>

          <div class="sidebar-reminder-box">
            <div class="sidebar-reminder-title">A little care, every day.</div>
            <div class="sidebar-reminder-desc">Small steps make a meaningful difference.</div>
          </div>
        </div>

        <div class="sidebar-bottom">
          <button class="sidebar-secondary-btn" onclick="navigateTo('guidance')">
            <span>&#9432;</span>
            <span>Help & guidance</span>
          </button>

          <button class="sidebar-secondary-btn" onclick="alert('Supabase Live Cloud is active. Data persists safely.')">
            <span>&#9788;</span>
            <span>Settings</span>
          </button>

          <div class="sidebar-user-block">
            <div>
              <div class="sidebar-user-name">${workerName}</div>
              <div class="sidebar-user-role">ASHA worker &middot; ${workerLoc}</div>
            </div>
            <button class="sidebar-logout-icon" onclick="handleLogout()" title="Log out">
              &#10140;
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Stage -->
      <main class="dashboard-main">
        <!-- Top Location & Utility Bar -->
        <header class="dashboard-top-bar">
          <div class="dashboard-school-tag">${facility}</div>
          <div class="dashboard-top-right">
            <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500;">
              <span>&#127760;</span>
              <select class="form-select" style="width: auto; padding: 4px 10px; background: transparent; border: none; font-size: 13px; cursor: pointer;" onchange="setLanguage(this.value)">
                <option value="en" ${AppState.language === 'en' ? 'selected' : ''}>English v</option>
                <option value="hi" ${AppState.language === 'hi' ? 'selected' : ''}>हिंदी</option>
                <option value="kn" ${AppState.language === 'kn' ? 'selected' : ''}>ಕನ್ನಡ</option>
              </select>
            </div>
            <button class="icon-bell-btn" title="Notifications">&#128276;</button>
          </div>
        </header>

        <!-- Dynamic Content Body -->
        ${mainContentHtml}
      </main>
    </div>
  `;
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initDataSync();
  renderApp();
});
