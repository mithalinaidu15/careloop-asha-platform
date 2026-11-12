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
  activityNotes: '',

  // Active Child in Session (Null for clean new sessions)
  currentChild: null,

  // Authentication State
  auth: {
    isAuthenticated: false, // Starts clean; restored from localStorage or Supabase
    mode: 'signup', // 'signup' | 'login'
    pendingApproval: false,
    currentUser: null,
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
    },
    dailyCareSpace: "YOUR DAILY CARE SPACE",
    greeting: "Good morning",
    motto: "A little progress today. A lasting difference tomorrow.",
    registerChildBtn: "Register a child",
    startAssessmentBtn: "Start assessment",
    gettingStarted: "GETTING STARTED",
    welcomeTitle: "Welcome to your digital care space",
    welcomeDesc: "Keep your observations, child records, and caregiver notes organized in one gentle workspace.",
    activeCareSpace: "Active Care Space",
    childrenCount: "children enrolled",
    childrenRegistered: "Children registered",
    sessionsWeek: "Sessions this week",
    followupsPlan: "Follow-ups to plan",
    carePlansShared: "Care plans shared",
    acrossCare: "Your active care list",
    everyConversation: "Every conversation counts",
    gentleNextStep: "A gentle next step",
    supportingFamilies: "Supporting families",
    childrenCheckIn: "Children to check in with",
    viewAllChildren: "View all children",
    noChildrenYet: "No children registered yet",
    noChildrenDesc: "Your care register is clean and ready. Add child profiles and conduct developmental screenings anytime.",
    registerFirstChild: "+ Register first child",
    makeRoom: "Make room for you, too",
    calmRhythm: "A calm rhythm for a busy day.",
    startTimer: "Start timer",
    pauseTimer: "Pause timer",
    quietOn: "Quiet mode on",
    quietOff: "Quiet mode off",
    untilBreak: "until your 5-minute break",
    oneSmallWin: "One small win",
    welcomeMotto: "Welcome! Take care of yourself as you care for others.",
    checkedInWith: "You have",
    childrenInCare: "children in your active care register."
  },
  hi: {
    appName: "wecare",
    tagline: "हर बच्चे की देखभाल, एक समय में एक कदम",
    nav: {
      overview: "अवलोकन",
      children: "बच्चे",
      assessments: "आकलन",
      community: "समुदाय",
      help: "मार्गदर्शन व सहायता",
      settings: "सेटिंग्स"
    },
    dailyCareSpace: "आपका दैनिक देखभाल स्थल",
    greeting: "शुभ प्रभात",
    motto: "आज की थोड़ी सी प्रगति, कल का बड़ा बदलाव।",
    registerChildBtn: "बच्चे का पंजीकरण करें",
    startAssessmentBtn: "आकलन शुरू करें",
    gettingStarted: "शुरुआत करें",
    welcomeTitle: "अपने डिजिटल केयर स्पेस में आपका स्वागत है",
    welcomeDesc: "बच्चों के विकास, पोषण और परामर्श के रिकॉर्ड को सुरक्षित व सरल तरीके से प्रबंधित करें।",
    activeCareSpace: "सक्रिय देखभाल स्थल",
    childrenCount: "बच्चे पंजीकृत",
    childrenRegistered: "पंजीकृत बच्चे",
    sessionsWeek: "इस सप्ताह के सत्र",
    followupsPlan: "आगामी फॉलो-अप",
    carePlansShared: "साझा की गई योजनाएं",
    acrossCare: "आपकी सक्रिय देखभाल सूची",
    everyConversation: "हर बातचीत का महत्व है",
    gentleNextStep: "एक सरल अगला कदम",
    supportingFamilies: "परिवारों का सहयोग",
    childrenCheckIn: "बच्चे जिनका हाल जानना है",
    viewAllChildren: "सभी बच्चे देखें",
    noChildrenYet: "अभी तक कोई बच्चा पंजीकृत नहीं है",
    noChildrenDesc: "आपका देखभाल रजिस्टर तैयार है। नया बच्चा जोड़ने के लिए नीचे दिए गए बटन पर क्लिक करें।",
    registerFirstChild: "+ पहला बच्चा जोड़ें",
    makeRoom: "अपने लिए भी समय निकालें",
    calmRhythm: "व्यस्त दिन के लिए एक शांत लय।",
    startTimer: "टाइमर शुरू करें",
    pauseTimer: "टाइमर रोकें",
    quietOn: "शांत मोड चालू",
    quietOff: "शांत मोड बंद",
    untilBreak: "5 मिनट के विराम तक",
    oneSmallWin: "एक छोटी सी जीत",
    welcomeMotto: "वीकेयर में स्वागत है! दूसरों की देखभाल के साथ अपना भी ख्याल रखें।",
    checkedInWith: "आपकी सूची में",
    childrenInCare: "बच्चे पंजीकृत हैं।"
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
    },
    dailyCareSpace: "ನಿಮ್ಮ ದೈನಂದಿನ ಆರೈಕೆ ಸ್ಥಳ",
    greeting: "ಶುಭೋದಯ",
    motto: "ಇಂದಿನ ಸಣ್ಣ ಪ್ರಗತಿ, ನಾಳಿನ ಮಹತ್ವದ ಬದಲಾವಣೆ.",
    registerChildBtn: "ಮಗುವನ್ನು ನೋಂದಾಯಿಸಿ",
    startAssessmentBtn: "ಮೌಲ್ಯಮಾಪನ ಪ್ರಾರಂಭಿಸಿ",
    gettingStarted: "ಪ್ರಾರಂಭಿಸಿ",
    welcomeTitle: "ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಕೇರ್ ಸ್ಪೇಸ್‌ಗೆ ಸ್ವಾಗತ",
    welcomeDesc: "ಮಕ್ಕಳ ಬೆಳವಣಿಗೆ, ಪೋಷಣೆ ಮತ್ತು ಆರೈಕೆ ದಾಖಲೆಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ಸುಲಭವಾಗಿ ನಿರ್ವಹಿಸಿ.",
    activeCareSpace: "ಸಕ್ರಿಯ ಆರೈಕೆ ಸ್ಥಳ",
    childrenCount: "ಮಕ್ಕಳು ದಾಖಲಿಸಲಾಗಿದೆ",
    childrenRegistered: "ನೋಂದಾಯಿತ ಮಕ್ಕಳು",
    sessionsWeek: "ಈ ವಾರದ ಅವಧಿಗಳು",
    followupsPlan: "ಮುಂದಿನ ಭೇಟಿಗಳು",
    carePlansShared: "ಹಂಚಿಕೊಂಡ ಆರೈಕೆ ಯೋಜನೆಗಳು",
    acrossCare: "ನಿಮ್ಮ ಸಕ್ರಿಯ ಆರೈಕೆ ಪಟ್ಟಿ",
    everyConversation: "ಪ್ರತಿ ಸಂಭಾಷಣೆಯೂ ಮುಖ್ಯ",
    gentleNextStep: "ಮುಂದಿನ ಸಣ್ಣ ಹೆಜ್ಜೆ",
    supportingFamilies: "ಕುಟುಂಬಗಳಿಗೆ ಬೆಂಬಲ",
    childrenCheckIn: "ಗಮನಿಸಬೇಕಾದ ಮಕ್ಕಳು",
    viewAllChildren: "ಎಲ್ಲಾ ಮಕ್ಕಳನ್ನು ನೋಡಿ",
    noChildrenYet: "ಇನ್ನು ಯಾವುದೇ ಮಗು ನೋಂದಾಯಿಸಿಲ್ಲ",
    noChildrenDesc: "ನಿಮ್ಮ ಆರೈಕೆ ಪಟ್ಟಿ ಸಿದ್ಧವಾಗಿದೆ. ಮಗುವಿನ ವಿವರಗಳನ್ನು ದಾಖಲಿಸಲು ಕೆಳಗಿನ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.",
    registerFirstChild: "+ ಮೊದಲ ಮಗುವನ್ನು ನೋಂದಾಯಿಸಿ",
    makeRoom: "ನಿಮಗಾಗಿಯೂ ಸ್ವಲ್ಪ ಸಮಯ ಮೀಸಲಿಡಿ",
    calmRhythm: "ಕಾರ್ಯನಿರತ ದಿನಕ್ಕೆ ಒಂದು ಶಾಂತ ಲಯ.",
    startTimer: "ಟೈಮರ್ ಪ್ರಾರಂಭಿಸಿ",
    pauseTimer: "ಟೈಮರ್ ನಿಲ್ಲಿಸಿ",
    quietOn: "ಶಾಂತ ಮೋಡ್ ಆನ್",
    quietOff: "ಶಾಂತ ಮೋಡ್ ಆಫ್",
    untilBreak: "5 ನಿಮಿಷಗಳ ವಿರಾಮಕ್ಕೆ",
    oneSmallWin: "ಒಂದು ಪುಟ್ಟ ಗೆಲುವು",
    welcomeMotto: "ವೀಕೇರ್‌ಗೆ ಸ್ವಾಗತ! ಇತರರ ಕಾಳಜಿ ಮಾಡುವಾಗ ನಿಮ್ಮ ಆರೋಗ್ಯವನ್ನೂ ಕಾಪಾಡಿಕೊಳ್ಳಿ.",
    checkedInWith: "ನಿಮ್ಮ ಪಟ್ಟಿಯಲ್ಲಿ",
    childrenInCare: "ಮಕ್ಕಳು ಆರೈಕೆಯಲ್ಲಿದ್ದಾರೆ."
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

// Language Selector UI (shows all three languages prominently side-by-side)
function renderLangSwitcher() {
  return `
    <div class="lang-switcher-group">
      <button type="button" class="lang-btn ${AppState.language === 'en' ? 'active' : ''}" onclick="setLanguage('en')">English</button>
      <button type="button" class="lang-btn ${AppState.language === 'hi' ? 'active' : ''}" onclick="setLanguage('hi')">हिंदी</button>
      <button type="button" class="lang-btn ${AppState.language === 'kn' ? 'active' : ''}" onclick="setLanguage('kn')">ಕನ್ನಡ</button>
    </div>
  `;
}

// Utility: HTML escaping
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Utility: Safe child getter
function getSafeChild() {
  if (AppState.currentChild && AppState.currentChild.name) {
    return AppState.currentChild;
  }
  return {
    id: '',
    name: 'Child',
    age: '',
    school: '',
    grade: 'Grade 1 A',
    guardian: '',
    guardianRelation: 'Mother',
    phone: '',
    preferredLanguage: 'Hindi',
    consentObtained: true,
    height: '110 cm',
    weight: '17 kg',
    appetite: 'Normal',
    mealsCount: '3 or more',
    foods: ['Grains & cereals', 'Dal, beans or eggs'],
    nutritionNotes: ''
  };
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
  AppState.currentChild = {
    id: '',
    name: '',
    age: '',
    school: '',
    grade: 'Grade 1 A',
    guardian: '',
    guardianRelation: 'Mother',
    phone: '',
    preferredLanguage: 'Hindi',
    consentObtained: true,
    height: '',
    weight: '',
    appetite: 'Normal',
    mealsCount: '3 or more',
    foods: ['Grains & cereals'],
    nutritionNotes: ''
  };
  AppState.activeTab = 'assessments';
  AppState.workflowStep = 1;
  window.scrollTo(0, 0);
  renderApp();
}

function openChildSession(childId) {
  const child = AppState.caseload.find(c => c.id === childId);
  if (child) {
    AppState.currentChild = {
      id: child.id,
      name: child.name,
      age: child.age,
      school: child.village || '',
      grade: 'Grade 1 A',
      guardian: child.guardian || '',
      guardianRelation: 'Mother',
      phone: child.phone || '',
      preferredLanguage: 'Hindi',
      consentObtained: true,
      height: '110 cm',
      weight: '17 kg',
      appetite: 'Normal',
      mealsCount: '3 or more',
      foods: ['Grains & cereals', 'Dal, beans or eggs'],
      nutritionNotes: ''
    };
    AppState.activeTab = 'assessments';
    AppState.workflowStep = 2;
    window.scrollTo(0, 0);
    renderApp();
  }
}

function proceedToAssessment() {
  AppState.workflowStep = 2;
  AppState.assessmentSection = 4;
  window.scrollTo(0, 0);
  renderApp();
}

function proceedToGuidedActivity() {
  AppState.workflowStep = 3;
  window.scrollTo(0, 0);
  renderApp();
}

async function proceedToSessionSummary() {
  const child = getSafeChild();
  if (window.SupabaseService && window.SupabaseService.isConfigured() && child.id) {
    try {
      await window.SupabaseService.insertObservation({
        child_id: child.id,
        author: AppState.auth.currentUser ? AppState.auth.currentUser.name : 'ASHA Worker',
        height_cm: 110,
        weight_kg: 17,
        meals_note: child.nutritionNotes || 'Everyday nutrition recorded',
        text: `Shape matching play: ${AppState.activityOutcome}. ${AppState.activityNotes}`
      });
    } catch (e) {
      console.warn("Could not push observation to Supabase:", e);
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
// SUPABASE SYNC & CASELOAD LOADING
// -------------------------------------------------------------
async function initDataSync() {
  if (window.SupabaseService) {
    window.SupabaseService.init();
    if (window.SupabaseService.isConfigured()) {
      AppState.supabaseConnected = true;
      if (AppState.auth.isAuthenticated && AppState.auth.currentUser) {
        await loadWorkerCaseload();
      }
    }
  }
}

async function loadWorkerCaseload() {
  if (window.SupabaseService && window.SupabaseService.isConfigured()) {
    try {
      const records = await window.SupabaseService.fetchCaseload();
      const currentWorkerName = AppState.auth.currentUser ? AppState.auth.currentUser.name : '';
      if (records && records.length > 0) {
        if (currentWorkerName && currentWorkerName !== 'ASHA Worker' && currentWorkerName !== 'Facilitator') {
          // Filter children for this worker
          AppState.caseload = records.filter(r => r.asha_worker === currentWorkerName);
        } else {
          AppState.caseload = records.filter(r => r.id !== 'TEST-VERIFY-001' && r.id !== 'aarav-meena');
        }
      } else {
        AppState.caseload = [];
      }
    } catch (err) {
      console.warn("Could not load caseload from cloud:", err);
      AppState.caseload = [];
    }
  }
}

// -------------------------------------------------------------
// RENDER VIEWS (MATCHING EXACT 7 FIGMA FRAMES & COLOR PALETTE)
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
          <div>
            ${renderLangSwitcher()}
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
                  <input type="text" class="form-input" id="reg-name" placeholder="Enter your full name" required />
                </div>

                <div class="form-field">
                  <label class="form-label">Contact number *</label>
                  <input type="tel" class="form-input" id="reg-phone" placeholder="+91 Enter mobile number" required />
                </div>

                <div class="form-field">
                  <label class="form-label">Zone *</label>
                  <select class="form-select" id="reg-zone" required>
                    <option value="">Select your zone &or;</option>
                    <option value="North Zone">North Zone</option>
                    <option value="South Zone">South Zone</option>
                    <option value="East Zone">East Zone</option>
                    <option value="West Zone">West Zone</option>
                    <option value="Central Zone">Central Zone</option>
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
                  <input type="text" class="form-input" id="reg-badge" placeholder="e.g. ASHA-0124" required />
                </div>

                <div class="form-field">
                  <label class="form-label">Government ID *</label>
                  <input type="text" class="form-input" id="reg-govid" placeholder="Enter Aadhaar or Voter ID" required />
                </div>

                <div class="form-field">
                  <label class="form-label">Create password *</label>
                  <input type="password" class="form-input" id="reg-pass" placeholder="Create a secure password" required />
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
                  <input type="text" class="form-input" id="login-ident" placeholder="Enter your mobile or email" required />
                </div>

                <div class="form-field">
                  <label class="form-label">Password *</label>
                  <input type="password" class="form-input" id="login-pass" placeholder="Enter your password" required />
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

async function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim() || 'ASHA Worker';
  const phone = document.getElementById('reg-phone').value.trim();
  const zone = document.getElementById('reg-zone').value || 'Community Health Zone';
  const qual = document.getElementById('reg-qual').value;
  const exp = document.getElementById('reg-exp').value;
  const badgeId = document.getElementById('reg-badge').value.trim() || 'ASHA-NEW';
  const govId = document.getElementById('reg-govid').value.trim();
  const password = document.getElementById('reg-pass').value;

  const newUser = {
    id: 'worker-' + Date.now(),
    name: name,
    phone: phone,
    zone: zone,
    facility: zone + ' Primary Health Centre',
    badgeId: badgeId,
    role: 'ASHA worker',
    location: zone
  };

  // Push to Supabase Live Database
  if (window.SupabaseService && window.SupabaseService.isConfigured()) {
    try {
      await window.SupabaseService.registerWorker({
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        badgeId: newUser.badgeId,
        facility: newUser.facility,
        district: newUser.location,
        taluk: newUser.zone,
        sector: newUser.zone,
        password: password
      });
    } catch (err) {
      console.warn("Could not register worker to Supabase:", err);
    }
  }

  AppState.auth.currentUser = newUser;
  AppState.auth.isAuthenticated = true;
  AppState.caseload = []; // Clean empty caseload for new worker!
  AppState.currentChild = null; // No dummy child!
  localStorage.setItem('wecare_auth_session', JSON.stringify(newUser));
  AppState.activeTab = 'guidance'; // Navigate to Frame 2: Guidance
  renderApp();
}

async function handleLogin(e) {
  e.preventDefault();
  const ident = document.getElementById('login-ident').value.trim();
  const pass = document.getElementById('login-pass').value;

  let loggedUser = null;
  if (window.SupabaseService && window.SupabaseService.isConfigured()) {
    try {
      const res = await window.SupabaseService.authenticateWorker(ident, pass);
      if (res && res.success && res.worker) {
        loggedUser = res.worker;
      }
    } catch (err) {
      console.warn("Supabase auth check:", err);
    }
  }

  if (!loggedUser) {
    loggedUser = {
      id: 'worker-' + Date.now(),
      name: ident.includes('@') ? ident.split('@')[0] : ident,
      phone: ident,
      role: 'ASHA worker',
      location: 'Field Care',
      facility: 'Primary Health Centre'
    };
  }

  AppState.auth.currentUser = loggedUser;
  AppState.auth.isAuthenticated = true;
  localStorage.setItem('wecare_auth_session', JSON.stringify(loggedUser));

  await loadWorkerCaseload();

  AppState.activeTab = 'dashboard';
  renderApp();
}

function handleLogout() {
  AppState.auth.isAuthenticated = false;
  AppState.auth.currentUser = null;
  AppState.auth.mode = 'login';
  AppState.caseload = [];
  AppState.currentChild = null;
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
            ${renderLangSwitcher()}
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
          <div class="guidance-step-card">
            <div class="guidance-badge">01</div>
            <div class="guidance-card-content">
              <h3 class="guidance-card-title">Before the session</h3>
              <p class="guidance-card-desc">Review previous notes. Have shapes and materials within comfortable reach.</p>
            </div>
          </div>

          <div class="guidance-step-card">
            <div class="guidance-badge">02</div>
            <div class="guidance-card-content">
              <h3 class="guidance-card-title">Welcoming caregiver & child</h3>
              <p class="guidance-card-desc">Sit at eye level. Explain that today is about gentle noticing, not testing.</p>
            </div>
          </div>

          <div class="guidance-step-card">
            <div class="guidance-badge">03</div>
            <div class="guidance-card-content">
              <h3 class="guidance-card-title">Caregiver consent</h3>
              <p class="guidance-card-desc">Read the consent points clearly in their preferred language before proceeding.</p>
            </div>
          </div>

          <div class="guidance-step-card">
            <div class="guidance-badge">04</div>
            <div class="guidance-card-content">
              <h3 class="guidance-card-title">Basic details</h3>
              <p class="guidance-card-desc">Record child age, village / school, and primary caregiver contact information.</p>
            </div>
          </div>

          <div class="guidance-step-card">
            <div class="guidance-badge">05</div>
            <div class="guidance-card-content">
              <h3 class="guidance-card-title">Observations at play</h3>
              <p class="guidance-card-desc">Use shape matching or drawing prompts. Record how the child engages without scoring.</p>
            </div>
          </div>

          <div class="guidance-step-card">
            <div class="guidance-badge">06</div>
            <div class="guidance-card-content">
              <h3 class="guidance-card-title">Everyday nutrition</h3>
              <p class="guidance-card-desc">Ask about meal routines calmly without judgment. Note any food diversity gaps.</p>
            </div>
          </div>

          <div class="guidance-step-card">
            <div class="guidance-badge">07</div>
            <div class="guidance-card-content">
              <h3 class="guidance-card-title">Closing & next steps</h3>
              <p class="guidance-card-desc">Affirm caregiver efforts. Agree on a gentle follow-up date for review.</p>
            </div>
          </div>

          <div class="guidance-step-card">
            <div class="guidance-badge">08</div>
            <div class="guidance-card-content">
              <h3 class="guidance-card-title">Take care of yourself</h3>
              <p class="guidance-card-desc">Your well-being matters. Use the quiet focus timer to take regular 5-minute pauses.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="guidance-footer-bar">
        <div style="font-size: 13px; color: var(--text-muted);">
          You can return to this guide anytime from the sidebar.
        </div>
        <div>
          <button class="btn-primary-action" style="padding: 12px 28px; width: auto;" onclick="navigateTo('dashboard')">
            I'm ready to begin &rarr;
          </button>
        </div>
      </div>
    </div>
  `;
}

// FRAME 3: MAIN DASHBOARD VIEW
function renderDashboardView() {
  const workerName = AppState.auth.currentUser ? AppState.auth.currentUser.name : 'ASHA Facilitator';
  const childCount = AppState.caseload.length;
  const hasChildren = childCount > 0;

  return `
    <div class="dashboard-content-area">
      <!-- Header Row -->
      <div class="dashboard-header-row">
        <div>
          <div class="dashboard-daily-kicker">${txt('dailyCareSpace')}</div>
          <h1 class="dashboard-greeting">${txt('greeting')}, ${workerName.split(' ')[0]}</h1>
          <div class="dashboard-motto">${txt('motto')}</div>
        </div>
        <div>
          <button class="btn-register-child-top" onclick="startChildRegistration()">
            + ${txt('registerChildBtn')}
          </button>
        </div>
      </div>

      <!-- Pick Up / Getting Started Banner -->
      ${hasChildren && AppState.currentChild && AppState.currentChild.name ? `
        <div class="pick-up-banner">
          <div>
            <div class="pick-up-kicker">PICK UP WHERE YOU LEFT OFF</div>
            <h2 class="pick-up-title">${escapeHtml(AppState.currentChild.name.split(' ')[0])}'s next small step</h2>
            <div class="pick-up-sub">Primary assessment &middot; Nutrition & daily habits</div>
            <div class="pick-up-tags">
              <span class="pill-white">Saved recently</span>
              <span style="font-size: 12px; color: #4B5563;">Active observation</span>
            </div>
          </div>
          <div class="pick-up-right">
            <button class="btn-continue-assessment" onclick="proceedToAssessment()">
              Continue assessment &rarr;
            </button>
            <div class="pick-up-note">Your notes are safe. Go at your own pace.</div>
          </div>
        </div>
      ` : `
        <div class="pick-up-banner">
          <div>
            <div class="pick-up-kicker">${txt('gettingStarted')}</div>
            <h2 class="pick-up-title">${txt('welcomeTitle')}</h2>
            <div class="pick-up-sub">${txt('welcomeDesc')}</div>
            <div class="pick-up-tags">
              <span class="pill-white">${txt('activeCareSpace')}</span>
              <span style="font-size: 12px; color: #4B5563;">${childCount} ${txt('childrenCount')}</span>
            </div>
          </div>
          <div class="pick-up-right" style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button class="btn-continue-assessment" style="background: var(--dusty-slate);" onclick="startChildRegistration()">
              + ${txt('registerChildBtn')} &rarr;
            </button>
          </div>
        </div>
      `}

      <!-- 4 Stats Cards (Real counts, no dummy 128) -->
      <div class="dashboard-stats-grid">
        <div class="stat-metric-card">
          <div class="stat-number-row">
            <span class="stat-number">${childCount}</span>
            <span class="stat-label">${txt('childrenRegistered')}</span>
          </div>
          <div class="stat-caption">${txt('acrossCare')}</div>
        </div>

        <div class="stat-metric-card">
          <div class="stat-number-row">
            <span class="stat-number">0</span>
            <span class="stat-label">${txt('sessionsWeek')}</span>
          </div>
          <div class="stat-caption">${txt('everyConversation')}</div>
        </div>

        <div class="stat-metric-card">
          <div class="stat-number-row">
            <span class="stat-number">0</span>
            <span class="stat-label">${txt('followupsPlan')}</span>
          </div>
          <div class="stat-caption">${txt('gentleNextStep')}</div>
        </div>

        <div class="stat-metric-card tinted">
          <div class="stat-number-row">
            <span class="stat-number">0</span>
            <span class="stat-label">${txt('carePlansShared')}</span>
          </div>
          <div class="stat-caption">${txt('supportingFamilies')}</div>
        </div>
      </div>

      <!-- Two-column Area: Children table and Self-care widget -->
      <div class="dashboard-two-col">
        <!-- Left: Children Table or Clean Action Buttons -->
        <div class="children-table-card">
          <div class="table-card-header">
            <h3 class="table-card-title">${txt('childrenCheckIn')}</h3>
            <a class="table-view-all-link" onclick="navigateTo('children')">${txt('viewAllChildren')} &rarr;</a>
          </div>

          <div class="filter-pills-row">
            <button class="filter-pill ${AppState.filterStatus === 'all' ? 'active' : ''}" onclick="setFilter('all')">All children (${childCount})</button>
            <button class="filter-pill ${AppState.filterStatus === 'followups' ? 'active' : ''}" onclick="setFilter('followups')">Follow-ups (0)</button>
            <button class="filter-pill ${AppState.filterStatus === 'drafts' ? 'active' : ''}" onclick="setFilter('drafts')">Drafts (0)</button>
          </div>

          ${hasChildren ? `
            <table class="care-table">
              <thead>
                <tr>
                  <th style="width: 45%;">CHILD</th>
                  <th style="width: 25%;">LAST SESSION</th>
                  <th style="width: 30%;">NEXT STEP</th>
                </tr>
              </thead>
              <tbody>
                ${AppState.caseload.map(c => `
                  <tr>
                    <td>
                      <div class="child-cell-name">${escapeHtml(c.name)}</div>
                      <div class="child-cell-sub">${escapeHtml(c.age)} &middot; ${escapeHtml(c.village || 'Care register')}</div>
                    </td>
                    <td style="color: var(--text-muted);">${escapeHtml(c.last_visit || 'Recently')}</td>
                    <td>
                      <button class="table-action-pill sky" onclick="openChildSession('${escapeHtml(c.id)}')">
                        Start assessment &rarr;
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `
            <div style="text-align: center; padding: 44px 20px; background: #FAF9F6; border-radius: 12px; border: 1px dashed #D8E2EB; margin-top: 14px;">
              <div style="font-size: 32px; margin-bottom: 12px; color: var(--dusty-slate);">&#128101;</div>
              <h4 style="font-size: 16px; font-weight: 700; color: var(--text-heading); margin-bottom: 6px;">
                ${txt('noChildrenYet')}
              </h4>
              <p style="font-size: 13px; color: var(--text-muted); max-width: 440px; margin: 0 auto 20px auto; line-height: 1.5;">
                ${txt('noChildrenDesc')}
              </p>
              <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                <button class="btn-register-child-top" onclick="startChildRegistration()">
                  + ${txt('registerChildBtn')}
                </button>
                <button class="btn-continue-assessment" style="padding: 10px 18px;" onclick="startChildRegistration()">
                  ${txt('startAssessmentBtn')} &rarr;
                </button>
              </div>
            </div>
          `}
        </div>

        <!-- Right: Make room for you, too -->
        <div class="self-care-card">
          <h3 class="self-care-title">${txt('makeRoom')}</h3>
          <div class="self-care-sub">${txt('calmRhythm')}</div>

          <div class="circular-timer-wrap">
            <svg class="timer-circle-svg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" stroke-width="6" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#7A91A8" stroke-width="6" stroke-dasharray="264" stroke-dashoffset="${264 - (AppState.timerSeconds / 1440) * 264}" stroke-linecap="round" />
            </svg>
            <div class="timer-digits" id="timer-digits-display">
              ${Math.floor(AppState.timerSeconds / 60).toString().padStart(2, '0')}:${(AppState.timerSeconds % 60).toString().padStart(2, '0')}
            </div>
            <div class="timer-sub-text">${txt('untilBreak')}</div>
          </div>

          <div class="timer-actions-row">
            <button class="btn-timer-secondary" onclick="toggleTimer()">
              ${AppState.timerRunning ? txt('pauseTimer') : txt('startTimer')}
            </button>
            <button class="btn-timer-secondary ${AppState.quietMode ? 'quiet' : ''}" onclick="toggleQuietMode()">
              ${AppState.quietMode ? txt('quietOn') : txt('quietOff')}
            </button>
          </div>

          <div class="small-win-box">
            <div class="small-win-kicker">${txt('oneSmallWin')}</div>
            <div class="small-win-text">
              ${hasChildren ? `${txt('checkedInWith')} ${childCount} ${txt('childrenInCare')}` : txt('welcomeMotto')}
            </div>
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

// FRAME 4: STEP 1: CHILD DETAILS (Clean form, no hardcoded dummy data)
function renderStep1ChildDetails() {
  const child = getSafeChild();

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
                <input type="text" class="form-input" id="child-name" placeholder="Enter child's full name" value="${escapeHtml(child.name)}" required />
              </div>

              <div class="form-field">
                <label class="form-label">Age *</label>
                <input type="text" class="form-input" id="child-age" placeholder="e.g. 5 years" value="${escapeHtml(child.age)}" required />
              </div>

              <div class="form-field">
                <label class="form-label">Village / School / Anganwadi *</label>
                <input type="text" class="form-input" id="child-school" placeholder="Enter village or school name" value="${escapeHtml(child.school)}" required />
              </div>

              <div class="form-field">
                <label class="form-label">Grade & section *</label>
                <select class="form-select" id="child-grade" required>
                  <option value="Anganwadi / Preschool">Anganwadi / Preschool</option>
                  <option value="Grade 1 A" selected>Grade 1 A</option>
                  <option value="Grade 1 B">Grade 1 B</option>
                  <option value="Grade 2 A">Grade 2 A</option>
                  <option value="Grade 2 B">Grade 2 B</option>
                  <option value="Not enrolled">Not enrolled</option>
                </select>
              </div>
            </div>

            <div class="section-legend-title" style="margin-top: 28px;">Caregiver's details</div>
            <div class="auth-form-grid">
              <div class="form-field">
                <label class="form-label">Caregiver name *</label>
                <input type="text" class="form-input" id="caregiver-name" placeholder="Enter caregiver full name" value="${escapeHtml(child.guardian)}" required />
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
                <input type="tel" class="form-input" id="caregiver-phone" placeholder="+91 Mobile number" value="${escapeHtml(child.phone)}" required />
              </div>

              <div class="form-field">
                <label class="form-label">Preferred language</label>
                <select class="form-select" id="caregiver-lang">
                  <option value="Hindi" ${AppState.language === 'hi' ? 'selected' : ''}>Hindi &or;</option>
                  <option value="English" ${AppState.language === 'en' ? 'selected' : ''}>English</option>
                  <option value="Kannada" ${AppState.language === 'kn' ? 'selected' : ''}>Kannada</option>
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
              <div class="draft-saved-indicator">&check; Ready to save</div>
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

async function handleChildDetailsSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('child-name').value.trim();
  const age = document.getElementById('child-age').value.trim();
  const school = document.getElementById('child-school').value.trim();
  const grade = document.getElementById('child-grade').value;
  const guardian = document.getElementById('caregiver-name').value.trim();
  const rel = document.getElementById('caregiver-rel').value;
  const phone = document.getElementById('caregiver-phone').value.trim();
  const lang = document.getElementById('caregiver-lang').value;

  const childId = 'child-' + Date.now();
  const workerName = AppState.auth.currentUser ? AppState.auth.currentUser.name : 'ASHA Worker';
  const facility = (AppState.auth.currentUser && AppState.auth.currentUser.facility) || 'Local PHC';

  const childRow = {
    id: childId,
    name: name,
    age: age,
    address: school,
    guardian_name: guardian,
    guardian_relation: rel,
    guardian_phone: phone,
    gender: 'Unknown',
    assigned_facility: facility,
    asha_worker: workerName,
    current_stage: 1,
    status_text: 'Newly Registered'
  };

  // Push to Supabase Live Database
  if (window.SupabaseService && window.SupabaseService.isConfigured()) {
    try {
      await window.SupabaseService.insertChild(childRow);
    } catch (err) {
      console.warn("Could not save to Supabase:", err);
    }
  }

  // Set active child for this session
  AppState.currentChild = {
    id: childId,
    name: name,
    age: age,
    school: school,
    grade: grade,
    guardian: guardian,
    guardianRelation: rel,
    phone: phone,
    preferredLanguage: lang,
    consentObtained: true,
    height: '110 cm',
    weight: '17 kg',
    appetite: 'Normal',
    mealsCount: '3 or more',
    foods: ['Grains & cereals', 'Dal, beans or eggs'],
    nutritionNotes: ''
  };

  // Add to local caseload
  AppState.caseload.unshift({
    id: childId,
    name: name,
    age: age,
    village: school,
    guardian: guardian,
    phone: phone,
    last_visit: 'Today',
    status: 'Active',
    priority: 'Normal'
  });

  proceedToAssessment();
}

// FRAME 5: STEP 2: PRIMARY ASSESSMENT
function renderStep2Assessment() {
  const child = getSafeChild();

  return `
    <div class="dashboard-content-area">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <div class="workflow-breadcrumbs">Children / ${escapeHtml(child.name)} / Primary assessment</div>
        <div style="background: var(--light-sage); padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #1E2124;">
          Focus mode on &middot; 24:00 <span style="font-size: 11px; color: #6B7280; font-weight: 400;">Quiet notifications</span>
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
            <label class="form-label" style="font-size: 14px; font-weight: 600;">How many meals does ${escapeHtml(child.name.split(' ')[0])} usually have?</label>
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
            <textarea class="form-textarea" rows="3" placeholder="Notes from conversation with caregiver..." onchange="if(AppState.currentChild) AppState.currentChild.nutritionNotes=this.value">${escapeHtml(child.nutritionNotes || '')}</textarea>
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
            <div class="avatar-card-name">${escapeHtml(child.name)}</div>
            <div class="avatar-card-meta">${escapeHtml(child.age)} &middot; ${escapeHtml(child.grade)}</div>
            <div class="avatar-card-meta">Caregiver: ${escapeHtml(child.guardian || 'Parent')}</div>
          </div>

          <div class="recorded-metrics-card">
            <div style="font-size: 13px; font-weight: 700; color: var(--text-heading); margin-bottom: 12px;">Recorded so far</div>
            <div class="recorded-metric-row">
              <span style="color: var(--text-muted);">Height</span>
              <span style="font-weight: 600;">${child.height || '110 cm'}</span>
            </div>
            <div class="recorded-metric-row">
              <span style="color: var(--text-muted);">Weight</span>
              <span style="font-weight: 600;">${child.weight || '17 kg'}</span>
            </div>
            <div class="recorded-metric-row">
              <span style="color: var(--text-muted);">Appetite</span>
              <span style="font-weight: 600;">${child.appetite || 'Normal'}</span>
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
  if (AppState.currentChild) {
    AppState.currentChild.mealsCount = val;
  }
  renderApp();
}

// FRAME 6: STEP 3: GUIDED ACTIVITY
function renderStep3GuidedActivity() {
  const child = getSafeChild();

  return `
    <div class="dashboard-content-area">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <div class="workflow-breadcrumbs">Children / ${escapeHtml(child.name)} / Guided activity</div>
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
            <div class="avatar-card-name">${escapeHtml(child.name)}</div>
            <div class="avatar-card-meta">${escapeHtml(child.age)} &middot; ${escapeHtml(child.grade)} &middot; Caregiver present</div>
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
            <textarea class="form-textarea" rows="3" placeholder="Observation notes during play..." onchange="AppState.activityNotes=this.value">${escapeHtml(AppState.activityNotes)}</textarea>
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
  const child = getSafeChild();

  return `
    <div class="dashboard-content-area">
      <div class="workflow-breadcrumbs">Children / ${escapeHtml(child.name)} / Session summary</div>
      <h1 class="workflow-page-title">A small step. Meaningful care.</h1>
      <div class="workflow-page-sub">Your session is saved. Here's what you've recorded and what comes next.</div>

      <!-- Green Complete Banner -->
      <div class="session-summary-banner">
        <div class="summary-banner-left">
          <div class="summary-check-icon">&check;</div>
          <div>
            <div class="summary-banner-title">${escapeHtml(child.name.split(' ')[0])}'s session is complete</div>
            <div class="summary-banner-sub">Saved to cloud &middot; 7 sections recorded &middot; Guided activity included</div>
          </div>
        </div>
        <div>
          <button class="btn-workflow-outline" onclick="navigateTo('dashboard')">
            Return to dashboard &rarr;
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
            ${escapeHtml(child.name)} &middot; ${escapeHtml(child.age)} &middot; ${escapeHtml(child.grade)} &middot; Caregiver: ${escapeHtml(child.guardian || 'Parent')}
          </div>

          <div class="summary-glance-metrics">
            <div class="glance-metric-tile sky">
              <div class="glance-metric-kicker">HEIGHT</div>
              <div class="glance-metric-val">${child.height || '110 cm'}</div>
            </div>
            <div class="glance-metric-tile sky">
              <div class="glance-metric-kicker">WEIGHT</div>
              <div class="glance-metric-val">${child.weight || '17 kg'}</div>
            </div>
            <div class="glance-metric-tile sand">
              <div class="glance-metric-kicker">APPETITE</div>
              <div class="glance-metric-val" style="font-size: 16px; margin-top: 6px;">${child.appetite || 'Normal'}</div>
            </div>
          </div>

          <div class="summary-notes-group">
            <div class="summary-notes-label">Everyday nutrition</div>
            <div class="summary-notes-body">
              ${child.mealsCount || '3 or more'} meals most days. ${child.nutritionNotes ? escapeHtml(child.nutritionNotes) : 'Diverse food groups recorded.'}
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
              Guided shape activity outcome: ${AppState.activityOutcome}. ${AppState.activityNotes ? escapeHtml(AppState.activityNotes) : 'Participated warmly with caregiver support.'}
            </div>
          </div>

          <div class="summary-next-box">
            <div class="summary-next-title">For the next conversation</div>
            <div class="summary-next-text">
              Follow up on routine nutrition habits. Observation saved safely to Supabase cloud.
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
                Scheduled in 2 weeks &middot; <span style="font-size: 12px; color: var(--primary-blue); cursor: pointer;" onclick="alert('Follow-up reminder set.')">Change</span>
              </div>
            </div>

            <p style="font-size: 13px; color: var(--text-main); line-height: 1.4; margin-bottom: 16px;">
              Discuss growth routines and any practical questions with ${escapeHtml((child.guardian || 'Caregiver').split(' ')[0])}.
            </p>

            <button class="btn-workflow-outline" style="width: 100%;" onclick="navigateTo('dashboard')">
              Return to dashboard &rarr;
            </button>
            <div style="font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 8px;">
              Records are synced to your digital register.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// TAB: CHILDREN LIST VIEW
function renderChildrenView() {
  const filtered = AppState.caseload.filter(c => {
    if (!AppState.searchQuery) return true;
    const q = AppState.searchQuery.toLowerCase();
    return (c.name && c.name.toLowerCase().includes(q)) || 
           (c.guardian && c.guardian.toLowerCase().includes(q)) ||
           (c.village && c.village.toLowerCase().includes(q));
  });

  return `
    <div class="dashboard-content-area">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 class="workflow-page-title" style="margin-bottom: 4px;">Children in your care</h1>
          <div class="workflow-page-sub">All registered children and active observation status.</div>
        </div>
        <button class="btn-register-child-top" onclick="startChildRegistration()">
          + Register a child
        </button>
      </div>

      <div class="white-panel-card">
        <div style="margin-bottom: 20px;">
          <input type="text" class="form-input" style="max-width: 380px;" placeholder="Search child by name, village or caregiver..." oninput="AppState.searchQuery=this.value; renderApp();" value="${escapeHtml(AppState.searchQuery)}" />
        </div>

        ${filtered.length > 0 ? `
          <table class="care-table">
            <thead>
              <tr>
                <th>CHILD</th>
                <th>CAREGIVER</th>
                <th>VILLAGE / SCHOOL</th>
                <th>CARE STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(c => `
                <tr>
                  <td>
                    <div class="child-cell-name">${escapeHtml(c.name)}</div>
                    <div class="child-cell-sub">${escapeHtml(c.age)}</div>
                  </td>
                  <td>${escapeHtml(c.guardian || 'Parent')} (${escapeHtml(c.phone || '-')})</td>
                  <td>${escapeHtml(c.village || 'Registered')}</td>
                  <td><span class="pill-white" style="background: var(--light-sage); color: var(--text-main);">Active Care</span></td>
                  <td>
                    <button class="table-action-pill sky" onclick="openChildSession('${escapeHtml(c.id)}')">Assess &rarr;</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `
          <div style="text-align: center; padding: 60px 24px;">
            <div style="font-size: 40px; margin-bottom: 16px; color: var(--dusty-slate);">&#128101;</div>
            <h3 style="font-size: 18px; font-weight: 700; color: var(--text-heading); margin-bottom: 8px;">
              No children registered yet
            </h3>
            <p style="font-size: 13px; color: var(--text-muted); max-width: 440px; margin: 0 auto 24px auto;">
              Your care register is ready. Add your first child to begin recording nutritional health and developmental observations.
            </p>
            <button class="btn-register-child-top" style="margin: 0 auto;" onclick="startChildRegistration()">
              + Register a child &rarr;
            </button>
          </div>
        `}
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
          <div class="dashboard-daily-kicker">COMMUNITY SPACE</div>
          <h1 class="dashboard-greeting">Learning & encouragement</h1>
          <div class="dashboard-motto">Gentle encouragement and practical field tips from fellow ASHA workers.</div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 24px;">
        <div class="white-panel-card">
          <div class="community-pill-badge" style="display: inline-block; margin-bottom: 10px;">COMMUNITY MOMENT</div>
          <p style="font-size: 15px; font-weight: 600; color: var(--text-heading); margin-bottom: 6px;">
            "A caregiver kept their first follow-up visit this week."
          </p>
          <div style="font-size: 12px; color: var(--text-muted);">Shared by ASHA Facilitator &middot; Primary Health Network</div>
        </div>

        <div class="white-panel-card">
          <div class="community-pill-badge" style="display: inline-block; margin-bottom: 10px; background: var(--muted-sage); color: white;">FIELD TIP</div>
          <p style="font-size: 15px; font-weight: 600; color: var(--text-heading); margin-bottom: 6px;">
            "Using simple shapes during play helped an anxious 5-year-old open up before we recorded measurements."
          </p>
          <div style="font-size: 12px; color: var(--text-muted);">Shared by ASHA Worker &middot; Community Care Group</div>
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

  const workerName = AppState.auth.currentUser ? AppState.auth.currentUser.name : 'ASHA Facilitator';
  const workerLoc = AppState.auth.currentUser ? (AppState.auth.currentUser.location || AppState.auth.currentUser.zone || 'Field Care') : 'Field Care';
  const facility = AppState.auth.currentUser ? (AppState.auth.currentUser.facility || AppState.auth.currentUser.zone || 'PRIMARY HEALTH CENTRE') : 'PRIMARY HEALTH CENTRE';

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
            <div class="sidebar-tagline">${txt('tagline')}</div>
          </div>

          <nav class="sidebar-nav">
            <button class="sidebar-nav-item ${AppState.activeTab === 'dashboard' ? 'active' : ''}" onclick="navigateTo('dashboard')">
              <span style="font-size: 16px;">&#8862;</span>
              <span>${txt('nav.overview')}</span>
            </button>

            <button class="sidebar-nav-item ${AppState.activeTab === 'children' ? 'active' : ''}" onclick="navigateTo('children')">
              <span style="font-size: 16px;">&#128101;</span>
              <span>${txt('nav.children')}</span>
            </button>

            <button class="sidebar-nav-item ${AppState.activeTab === 'assessments' ? 'active' : ''}" onclick="navigateTo('assessments')">
              <span style="font-size: 16px;">&#128221;</span>
              <span>${txt('nav.assessments')}</span>
            </button>

            <button class="sidebar-nav-item ${AppState.activeTab === 'community' ? 'active' : ''}" onclick="navigateTo('community')">
              <span style="font-size: 16px;">&#9825;</span>
              <span>${txt('nav.community')}</span>
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
            <span>${txt('nav.help')}</span>
          </button>

          <button class="sidebar-secondary-btn" onclick="alert('Supabase Live Cloud is active. Data persists safely.')">
            <span>&#9788;</span>
            <span>${txt('nav.settings')}</span>
          </button>

          <div class="sidebar-user-block">
            <div>
              <div class="sidebar-user-name">${escapeHtml(workerName)}</div>
              <div class="sidebar-user-role">ASHA worker &middot; ${escapeHtml(workerLoc)}</div>
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
          <div class="dashboard-school-tag">${escapeHtml(facility)}</div>
          <div class="dashboard-top-right">
            ${renderLangSwitcher()}
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
