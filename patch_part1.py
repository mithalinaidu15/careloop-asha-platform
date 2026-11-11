import re

with open('app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add auth to AppState
old_app_state_auth = "  // Database & Cloud Status\n  supabaseConnected: false,"
new_app_state_auth = """  // Authentication & Guided Worker Onboarding
  auth: {
    isAuthenticated: false,
    mode: 'login', // 'login' | 'signup'
    signupStep: 1, // 1: Identity, 2: Catchment, 3: Facilities, 4: Guidelines & Pledge
    currentUser: null,
    formData: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      badgeId: '',
      state: 'Karnataka',
      district: '',
      taluk: '',
      sector: '',
      facility: '',
      deic: '',
      catchment: '1000',
      pledgeAccepted: false
    }
  },

  // Database & Cloud Status
  supabaseConnected: false,"""

assert old_app_state_auth in code, "old_app_state_auth not found"
code = code.replace(old_app_state_auth, new_app_state_auth, 1)

# 2. Add auth initialization from localStorage
old_worker_load = """// Load saved worker profile if previously configured
try {
  const savedWorker = localStorage.getItem('asha_worker_profile');
  if (savedWorker) {
    const parsed = JSON.parse(savedWorker);
    if (parsed.name) AppState.worker.name = parsed.name;
    if (parsed.sector) AppState.worker.sector = parsed.sector;
    if (parsed.deic) AppState.worker.deic = parsed.deic;
  }
} catch (e) {}"""

new_worker_load = """// Check for authenticated ASHA worker session
try {
  const savedSession = localStorage.getItem('careloop_auth_session');
  if (savedSession) {
    const user = JSON.parse(savedSession);
    if (user && user.name) {
      AppState.auth.isAuthenticated = true;
      AppState.auth.currentUser = user;
      AppState.worker.name = user.name;
      AppState.worker.sector = user.sector || "Local Sub-Centre / Ward";
      AppState.worker.deic = user.deic || "District Early Intervention Centre (DEIC)";
    }
  }
} catch (e) {}"""

assert old_worker_load in code, "old_worker_load not found"
code = code.replace(old_worker_load, new_worker_load, 1)

# 3. Add auth translations to i18n
en_auth = """    auth: {
      login_title: "ASHA Worker Sign In",
      login_subtitle: "Access your field register & child screening records",
      signup_title: "Guided ASHA Worker Sign Up",
      signup_subtitle: "Step-by-step field catchment & healthcare linkage setup",
      identifier_label: "Mobile Number or Email",
      identifier_ph: "Enter 10-digit mobile or email",
      password_label: "Password",
      password_ph: "Enter your password",
      btn_login: "Sign In to Field Register →",
      btn_go_signup: "New ASHA Worker? Start Guided Sign Up →",
      btn_go_login: "Already have an account? Sign In →",
      tab_login: "Sign In",
      tab_signup: "Guided Sign Up",
      step1: "Worker Identity",
      step2: "Field Catchment",
      step3: "Health Linkage",
      step4: "Guidelines & Pledge",
      step1_desc: "Set up your verified community health worker credentials.",
      step2_desc: "Specify your assigned village, ward, and catchment population.",
      step3_desc: "Connect your field territory to your local PHC and District DEIC Hub.",
      step4_desc: "Review core clinical responsibilities and accept the confidentiality pledge.",
      name_label: "Full Name (ASHA Worker)",
      phone_label: "Mobile Number (10 digits)",
      email_label: "Email Address (Optional)",
      badge_label: "Govt ASHA ID / Badge Number",
      pass_label: "Create Password",
      confirm_pass_label: "Confirm Password",
      state_label: "State",
      district_label: "District",
      taluk_label: "Taluk / Block",
      sector_label: "Village / Ward / Sub-Centre Name",
      catchment_label: "Estimated Population in Catchment",
      phc_label: "Assigned Primary Health Centre (PHC)",
      deic_label: "Designated District DEIC Center",
      mentor_label: "Medical Officer / ANM In-charge",
      pledge_text: "I confirm that I am an authorized community health facilitator and I pledge to protect child patient privacy and adhere to neurodevelopmental screening guidelines.",
      btn_next: "Next Step →",
      btn_back: "← Back",
      btn_complete: "🎉 Complete Guided Sign-Up & Launch Dashboard",
      logout: "Log Out",
      switch_worker: "Switch Worker / Sign Out"
    },
    edit_profile: "Edit Worker Profile"
  },"""

old_en_end = """    edit_profile: "Edit Worker Profile"
  },"""
assert old_en_end in code, "old_en_end not found"
code = code.replace(old_en_end, en_auth, 1)

hi_auth = """    auth: {
      login_title: "आशा कार्यकर्ता लॉगिन",
      login_subtitle: "अपने फील्ड रजिस्टर और बाल स्क्रीनिंग रिकॉर्ड तक पहुंचें",
      signup_title: "निर्देशित आशा कार्यकर्ता साइन-अप",
      signup_subtitle: "चरण-दर-चरण कार्यक्षेत्र और स्वास्थ्य केंद्र लिंकेज सेटअप",
      identifier_label: "मोबाइल नंबर या ईमेल",
      identifier_ph: "10 अंकों का मोबाइल या ईमेल दर्ज करें",
      password_label: "पासवर्ड",
      password_ph: "अपना पासवर्ड दर्ज करें",
      btn_login: "फील्ड रजिस्टर में लॉगिन करें →",
      btn_go_signup: "नई आशा कार्यकर्ता? निर्देशित साइन-अप शुरू करें →",
      btn_go_login: "पहले से खाता है? यहाँ लॉगिन करें →",
      tab_login: "लॉगिन करें",
      tab_signup: "निर्देशित साइन-अप",
      step1: "कार्यकर्ता पहचान",
      step2: "कार्यक्षेत्र",
      step3: "स्वास्थ्य लिंकेज",
      step4: "दिशानिर्देश व प्रतिज्ञा",
      step1_desc: "अपना प्रमाणित सामुदायिक स्वास्थ्य कार्यकर्ता विवरण दर्ज करें।",
      step2_desc: "अपना आवंटित गांव, वार्ड और लक्षित जनसंख्या बताएं।",
      step3_desc: "अपने कार्यक्षेत्र को प्राथमिक स्वास्थ्य केंद्र और जिला डीईआईसी से जोड़ें।",
      step4_desc: "मुख्य जिम्मेदारियों की समीक्षा करें और गोपनीयता प्रतिज्ञा स्वीकार करें।",
      name_label: "पूरा नाम (आशा कार्यकर्ता)",
      phone_label: "मोबाइल नंबर (10 अंक)",
      email_label: "ईमेल पता (वैकल्पिक)",
      badge_label: "सरकारी आशा आईडी / बैज संख्या",
      pass_label: "पासवर्ड बनाएं",
      confirm_pass_label: "पासवर्ड की पुष्टि करें",
      state_label: "राज्य",
      district_label: "जिला",
      taluk_label: "तालुक / ब्लॉक",
      sector_label: "गांव / वार्ड / उप-केंद्र का नाम",
      catchment_label: "क्षेत्र की अनुमानित जनसंख्या",
      phc_label: "संलग्न प्राथमिक स्वास्थ्य केंद्र (PHC)",
      deic_label: "नामित जिला डीईआईसी केंद्र",
      mentor_label: "चिकित्सा अधिकारी / एएनएम का नाम",
      pledge_text: "मैं प्रमाणित करती हूँ कि मैं एक अधिकृत सामुदायिक स्वास्थ्य कार्यकर्ता हूँ और बाल स्वास्थ्य गोपनीयता का पालन करने की प्रतिज्ञा करती हूँ।",
      btn_next: "अगला चरण →",
      btn_back: "← पीछे",
      btn_complete: "🎉 साइन-अप पूरा करें और डैशबोर्ड खोलें",
      logout: "लॉग आउट",
      switch_worker: "कार्यकर्ता बदलें / लॉग आउट"
    },
    edit_profile: "कार्यकर्ता प्रोफ़ाइल बदलें"
  },"""

old_hi_end = """    edit_profile: "कार्यकर्ता प्रोफ़ाइल बदलें"
  },"""
assert old_hi_end in code, "old_hi_end not found"
code = code.replace(old_hi_end, hi_auth, 1)

kn_auth = """    auth: {
      login_title: "ಆಶಾ ಕಾರ್ಯಕರ್ತೆ ಲಾಗಿನ್",
      login_subtitle: "ನಿಮ್ಮ ಫೀಲ್ಡ್ ರಿಜಿಸ್ಟರ್ ಮತ್ತು ಮಕ್ಕಳ ತಪಾಸಣಾ ದಾಖಲೆಗಳನ್ನು ಪ್ರವೇಶಿಸಿ",
      signup_title: "ಮಾರ್ಗದರ್ಶಿ ಆಶಾ ಕಾರ್ಯಕರ್ತೆ ನೋಂದಣಿ",
      signup_subtitle: "ಹಂತ-ಹಂತದ ಕಾರ್ಯಕ್ಷೇತ್ರ ಮತ್ತು ಆರೋಗ್ಯ ಕೇಂದ್ರ ಜೋಡಣೆ",
      identifier_label: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಥವಾ ಇಮೇಲ್",
      identifier_ph: "10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಅಥವಾ ಇಮೇಲ್ ನಮೂದಿಸಿ",
      password_label: "ಪಾಸ್‌ವರ್ಡ್",
      password_ph: "ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",
      btn_login: "ಫೀಲ್ಡ್ ರಿಜಿಸ್ಟರ್‌ಗೆ ಲಾಗಿನ್ ಆಗಿ →",
      btn_go_signup: "ಹೊಸ ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯೇ? ಮಾರ್ಗದರ್ಶಿ ನೋಂದಣಿ ಪ್ರಾರಂಭಿಸಿ →",
      btn_go_login: "ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ? ಇಲ್ಲಿ ಲಾಗಿನ್ ಆಗಿ →",
      tab_login: "ಲಾಗಿನ್",
      tab_signup: "ಮಾರ್ಗದರ್ಶಿ ಸೈನ್-ಅಪ್",
      step1: "ಕಾರ್ಯಕರ್ತೆಯ ಗುರುತು",
      step2: "ಕಾರ್ಯಕ್ಷೇತ್ರ",
      step3: "ಆರೋಗ್ಯ ಕೇಂದ್ರ ಜೋಡಣೆ",
      step4: "ಮಾರ್ಗಸೂಚಿ ಮತ್ತು ಪ್ರತಿಜ್ಞೆ",
      step1_desc: "ನಿಮ್ಮ ದೃಢೀಕೃತ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆಯ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.",
      step2_desc: "ನಿಮ್ಮ ಗ್ರಾಮ, ವಾರ್ಡ್ ಮತ್ತು ವ್ಯಾಪ್ತಿಯ ಜನಸಂಖ್ಯೆಯನ್ನು ನಿಗದಿಪಡಿಸಿ.",
      step3_desc: "ಸ್ಥಳೀಯ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ ಮತ್ತು ಜಿಲ್ಲಾ DEIC ಹಬ್‌ಗೆ ಸಂಪರ್ಕಿಸಿ.",
      step4_desc: "ಪ್ರಮುಖ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಗೌಪ್ಯತೆಯ ಪ್ರತಿಜ್ಞೆಯನ್ನು ಸ್ವೀಕರಿಸಿ.",
      name_label: "ಪೂರ್ಣ ಹೆಸರು (ಆಶಾ ಕಾರ್ಯಕರ್ತೆ)",
      phone_label: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (10 ಅಂಕಿ)",
      email_label: "ಇಮೇಲ್ ವಿಳಾಸ (ಐಚ್ಛಿಕ)",
      badge_label: "ಸರ್ಕಾರಿ ಆಶಾ ಐಡಿ / ಬ್ಯಾಡ್ಜ್ ಸಂಖ್ಯೆ",
      pass_label: "ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ",
      confirm_pass_label: "ಪಾಸ್‌ವರ್ಡ್ ಖಚಿತಪಡಿಸಿ",
      state_label: "ರಾಜ್ಯ",
      district_label: "ಜಿಲ್ಲೆ",
      taluk_label: "ತಾಲೂಕು / ಬ್ಲಾಕ್",
      sector_label: "ಗ್ರಾಮ / ವಾರ್ಡ್ / ಉಪಕೇಂದ್ರದ ಹೆಸರು",
      catchment_label: "ವ್ಯಾಪ್ತಿಯ ಅಂದಾಜು ಜನಸಂಖ್ಯೆ",
      phc_label: "ನಿಯೋಜಿತ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ (PHC)",
      deic_label: "ನಿಯೋಜಿತ ಜಿಲ್ಲಾ DEIC ಕೇಂದ್ರ",
      mentor_label: "ವೈದ್ಯಾಧಿಕಾರಿ / ANM ಹೆಸರು",
      pledge_text: "ನಾನು ಅಧಿಕೃತ ಸಮುದಾಯ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆ ಎಂದು ದೃಢೀಕರಿಸುತ್ತೇನೆ ಮತ್ತು ಮಕ್ಕಳ ಆರೋಗ್ಯದ ಗೌಪ್ಯತೆಯನ್ನು ಕಾಪಾಡುವ ಪ್ರತಿಜ್ಞೆ ಮಾಡುತ್ತೇನೆ.",
      btn_next: "ಮುಂದಿನ ಹಂತ →",
      btn_back: "← ಹಿಂದಕ್ಕೆ",
      btn_complete: "🎉 ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ & ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ",
      logout: "ಲಾಗ್ ಔಟ್",
      switch_worker: "ಕಾರ್ಯಕರ್ತೆ ಬದಲಾಯಿಸಿ / ನಿರ್ಗಮಿಸಿ"
    },
    edit_profile: "ಪ್ರೊಫೈಲ್ ಬದಲಿಸಿ"
  }"""

old_kn_end = """    edit_profile: "ಪ್ರೊಫೈಲ್ ಬದಲಿಸಿ"
  }"""
assert old_kn_end in code, "old_kn_end not found"
code = code.replace(old_kn_end, kn_auth, 1)

# 4. Check if authenticated at beginning of renderApp
old_render_app_start = """function renderApp() {
  const container = document.getElementById('app-root');
  if (!container) return;

  const isMobile = AppState.viewMode === 'mobile';"""

new_render_app_start = """function renderApp() {
  const container = document.getElementById('app-root');
  if (!container) return;

  // If not authenticated, render Login / Guided Sign Up screen
  if (!AppState.auth.isAuthenticated) {
    container.innerHTML = renderAuthScreen();
    return;
  }

  const isMobile = AppState.viewMode === 'mobile';"""

assert old_render_app_start in code, "old_render_app_start not found"
code = code.replace(old_render_app_start, new_render_app_start, 1)

# 5. In renderApp header, add user avatar badge and logout button
old_header_controls = """        <!-- 3 Language Options Selector -->
        <select class="lang-select" onchange="setLanguage(this.value)">
          ${langOptions}
        </select>"""

new_header_controls = """        <!-- 3 Language Options Selector -->
        <select class="lang-select" onchange="setLanguage(this.value)">
          ${langOptions}
        </select>

        <!-- Logged-in Worker Profile & Logout -->
        <div class="user-profile-badge" title="Logged in as ${AppState.worker.name}">
          <span class="user-avatar-circle">${(AppState.worker.name || 'A').slice(0, 2).toUpperCase()}</span>
          <span style="font-size: 11px; font-weight: 700; color: #ffffff; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${AppState.worker.name}
          </span>
          <button class="btn btn-sm" style="background: rgba(255,255,255,0.2); color: #ffffff; padding: 2px 6px; font-size: 10px; border: none; border-radius: 4px;" onclick="handleLogout()" title="Log out">
            🚪 ${txt('auth.logout')}
          </button>
        </div>"""

assert old_header_controls in code, "old_header_controls not found"
code = code.replace(old_header_controls, new_header_controls, 1)

# 6. In desktop sidebar header, add logout button
old_sidebar_header = """          <button class="btn btn-sm btn-outline" style="margin-top: 8px; padding: 3px 8px; font-size: 11px;" onclick="openWorkerProfileModal()">
            ⚙️ ${txt('edit_profile')}
          </button>"""

new_sidebar_header = """          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <button class="btn btn-sm btn-outline" style="padding: 3px 8px; font-size: 11px;" onclick="openWorkerProfileModal()">
              ⚙️ ${txt('edit_profile')}
            </button>
            <button class="btn btn-sm btn-outline" style="padding: 3px 8px; font-size: 11px; color: #dc2626; border-color: #fca5a5;" onclick="handleLogout()">
              🚪 ${txt('auth.logout')}
            </button>
          </div>"""

assert old_sidebar_header in code, "old_sidebar_header not found"
code = code.replace(old_sidebar_header, new_sidebar_header, 1)

# 7. In Hamburger drawer, add logout button
old_drawer_profile = """          <div class="drawer-section-title">Worker Setup</div>
          <button class="drawer-item" onclick="toggleHamburger(false); openWorkerProfileModal();">
            <span>⚙️</span> <span>${txt('edit_profile')}</span>
          </button>"""

new_drawer_profile = """          <div class="drawer-section-title">Worker Setup</div>
          <button class="drawer-item" onclick="toggleHamburger(false); openWorkerProfileModal();">
            <span>⚙️</span> <span>${txt('edit_profile')}</span>
          </button>
          <button class="drawer-item" onclick="toggleHamburger(false); handleLogout();" style="color: #dc2626;">
            <span>🚪</span> <span>${txt('auth.switch_worker')}</span>
          </button>"""

assert old_drawer_profile in code, "old_drawer_profile not found"
code = code.replace(old_drawer_profile, new_drawer_profile, 1)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Part 1 of app.js patch complete!")
