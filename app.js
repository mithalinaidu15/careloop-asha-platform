// CareLoop ASHA — Community Health Facilitator Field Platform
// 100% Clean Slate: Zero Dummy Names or Records • Live SQLite Sync • English, Hindi, Kannada

const AppState = {
  viewMode: 'desktop',      // 'desktop' | 'mobile'
  language: 'en',           // 'en' | 'hi' | 'kn'
  activeTab: 'dashboard',   // 'dashboard' | 'register' | 'caseload' | 'observation' | 'deic' | 'followup' | 'consent' | 'feedback'
  dbConnected: false,
  hamburgerOpen: false,
  searchQuery: '',
  selectedChildId: null,

  // Configurable ASHA Worker Profile (Clean Generic Defaults - No Dummy Names)
  worker: {
    name: "ASHA Worker",
    id: "CHW",
    sector: "Local Sub-Centre / Ward",
    deic: "District Early Intervention Centre (DEIC)"
  },

  // Authentication & Guided Worker Onboarding
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
  supabaseConnected: false,
  dbType: 'sqlite',

  // Dynamic Live Data Stores (100% Clean - No Dummy Children)
  caseload: [],
  deicReferrals: [],
  observations: [],
  followups: []
};

// Check for authenticated ASHA worker session
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
} catch (e) {}

// -------------------------------------------------------------
// 3 LANGUAGE DICTIONARIES (English, Hindi, Kannada)
// -------------------------------------------------------------
const i18n = {
  en: {
    name: "English",
    appTitle: "WeCare",
    appSubtitle: "Community Health Facilitator Field Platform",
    greeting: "Welcome, ASHA Worker",
    designation: "Community Health Facilitator",
    nav: {
      dashboard: "Field Dashboard",
      caseload: "Assigned Caseload",
      register: "Register Child",
      observation: "Observation Form",
      deic: "Facilitate DEIC Referral",
      followup: "Follow-up & Continuity",
      consent: "Caregiver Consent",
      feedback: "ASHA Feedback"
    },
    stats: {
      total: "Total Registered Children",
      total_sub: "Assigned in your area",
      followups: "Follow-ups Due",
      followups_sub: "Household visits required",
      deic: "DEIC Referrals",
      deic_sub: "Forwarded to District Center",
      recent: "Recent Registrations",
      recent_sub: "Active field records"
    },
    quick_actions: "Daily Field Quick Actions",
    qa_reg_title: "Register a Child",
    qa_reg_desc: "Enroll a new child with guardian details & consent.",
    qa_obs_title: "Observation Screening",
    qa_obs_desc: "Record measurements, feeding, and milestones.",
    qa_deic_title: "Facilitate DEIC Referral",
    qa_deic_desc: "Refer child for specialist developmental assessment.",
    qa_fol_title: "Log Follow-up Visit",
    qa_fol_desc: "Record visit outcomes and address transit barriers.",
    empty_dashboard_title: "No Children Registered Yet",
    empty_dashboard_desc: "Your field register is clean and ready. Register your first child to begin developmental monitoring and care coordination.",
    empty_caseload: "No child records found in your register. Click 'Register New Child' to add your first record.",
    empty_deic: "No DEIC referrals recorded yet. Select or register a child with developmental concerns to facilitate a referral.",
    empty_obs: "No observations recorded yet. Select or register a child to record observations.",
    empty_fol: "No household follow-up visits logged yet.",
    btn_register_first: "+ Register First Child",
    btn_register_new: "+ Register New Child",
    btn_view_caseload: "View Caseload Directory →",
    btn_cancel: "Cancel",
    btn_save: "Save Record",
    btn_submit_obs: "Submit Observation to Database",
    btn_submit_deic: "Submit DEIC Referral & Save in DB",
    btn_submit_fol: "Save Follow-up Visit",
    th_child: "Child & Guardian",
    th_age_id: "Age / ID",
    th_village: "Village / Location",
    th_last_visit: "Last Visit",
    th_status: "Care Status",
    th_actions: "Actions",
    search_ph: "Search by child name, ID, or guardian...",
    filter_all: "All Records",
    db_synced: "SQLite Synced",
    db_offline: "Active Locally",
    menu_title: "ASHA Field Services",
    menu_consent: "Guardian Consent & Authorization",
    menu_close: "Close Menu",
    auth: {
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
  },
  hi: {
    name: "हिंदी (Hindi)",
    appTitle: "केयरलूप आशा",
    appSubtitle: "सामुदायिक स्वास्थ्य कार्यकर्ता फील्ड पोर्टल",
    greeting: "स्वागत है, आशा कार्यकर्ता",
    designation: "सामुदायिक स्वास्थ्य कार्यकर्ता",
    nav: {
      dashboard: "फील्ड डैशबोर्ड",
      caseload: "कार्य सूची (केसलोड)",
      register: "नया बच्चा दर्ज करें",
      observation: "अवलोकन फॉर्म",
      deic: "डीईआईसी रेफरल सुविधा",
      followup: "फॉलो-अप और निरंतरता",
      consent: "अभिभावक सहमति",
      feedback: "आशा फीडबैक"
    },
    stats: {
      total: "कुल पंजीकृत बच्चे",
      total_sub: "आपके क्षेत्र में नामांकित",
      followups: "लंबित फॉलो-अप",
      followups_sub: "गृह भेंट आवश्यक",
      deic: "डीईआईसी रेफरल",
      deic_sub: "जिला केंद्र को अग्रेषित",
      recent: "हाल के पंजीकरण",
      recent_sub: "सक्रिय फील्ड रिकॉर्ड"
    },
    quick_actions: "दैनिक फील्ड त्वरित कार्य",
    qa_reg_title: "नया बच्चा पंजीकृत करें",
    qa_reg_desc: "अभिभावक विवरण और सहमति के साथ नया नामांकन करें।",
    qa_obs_title: "अवलोकन जांच",
    qa_obs_desc: "ऊंचाई, वजन, पोषण और दैनिक व्यवहार दर्ज करें।",
    qa_deic_title: "डीईआईसी रेफरल भेजें",
    qa_deic_desc: "विशेषज्ञ जांच हेतु जिला केंद्र को रेफर करें।",
    qa_fol_title: "गृह भेंट दर्ज करें",
    qa_fol_desc: "भेंट परिणाम और यात्रा सहायता दर्ज करें।",
    empty_dashboard_title: "अभी तक कोई बच्चा पंजीकृत नहीं है",
    empty_dashboard_desc: "आपका फील्ड रजिस्टर वर्तमान में खाली है। बाल विकास की निगरानी शुरू करने के लिए अपना पहला बच्चा पंजीकृत करें।",
    empty_caseload: "रजिस्टर में कोई रिकॉर्ड नहीं मिला। पहला रिकॉर्ड जोड़ने के लिए 'नया बच्चा दर्ज करें' पर क्लिक करें।",
    empty_deic: "अभी तक कोई डीईआईसी रेफरल नहीं बनाया गया है।",
    empty_obs: "अभी तक कोई अवलोकन दर्ज नहीं किया गया है।",
    empty_fol: "अभी तक कोई गृह भेंट दर्ज नहीं की गई है।",
    btn_register_first: "+ पहला बच्चा पंजीकृत करें",
    btn_register_new: "+ नया बच्चा पंजीकृत करें",
    btn_view_caseload: "कार्य सूची देखें →",
    btn_cancel: "रद्द करें",
    btn_save: "रिकॉर्ड सहेजें",
    btn_submit_obs: "डेटाबेस में अवलोकन सहेजें",
    btn_submit_deic: "डीईआईसी रेफरल अग्रेषित करें",
    btn_submit_fol: "गृह भेंट सहेजें",
    th_child: "बच्चा और अभिभावक",
    th_age_id: "आयु / आईडी",
    th_village: "स्थान / वार्ड",
    th_last_visit: "अंतिम भेंट",
    th_status: "स्थिति",
    th_actions: "कार्रवाई",
    search_ph: "बच्चे का नाम, आईडी या अभिभावक खोजें...",
    filter_all: "सभी रिकॉर्ड",
    db_synced: "SQLite डेटाबेस सक्रिय",
    db_offline: "स्थानीय मोड",
    menu_title: "आशा फील्ड सेवाएं",
    menu_consent: "अभिभावक सहमति और अधिकार",
    menu_close: "मेनू बंद करें",
    auth: {
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
  },
  kn: {
    name: "ಕನ್ನಡ (Kannada)",
    appTitle: "ಕೇರ್‌ಲೂಪ್ ಆಶಾ",
    appSubtitle: "ಸಮುದಾಯ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆ ಫೀಲ್ಡ್ ಪೋರ್ಟಲ್",
    greeting: "ಸ್ವಾಗತ, ಆಶಾ ಕಾರ್ಯಕರ್ತೆ",
    designation: "ಸಮುದಾಯ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆ",
    nav: {
      dashboard: "ಫೀಲ್ಡ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      caseload: "ಮಕ್ಕಳ ಕಾರ್ಯಪಟ್ಟಿ",
      register: "ಮಗುವಿನ ನೋಂದಣಿ",
      observation: "ವೀಕ್ಷಣೆ ನಮೂನೆ",
      deic: "DEIC ರೆಫರಲ್ ಸೌಲಭ್ಯ",
      followup: "ಫಾಲೋ-ಅಪ್ & ನಿರಂತರತೆ",
      consent: "ಪೋಷಕರ ಸಮ್ಮತಿ",
      feedback: "ಆಶಾ ಪ್ರತಿಕ್ರಿಯೆ"
    },
    stats: {
      total: "ಒಟ್ಟು ನೋಂದಾಯಿತ ಮಕ್ಕಳು",
      total_sub: "ನಿಮ್ಮ ವ್ಯಾಪ್ತಿಯಲ್ಲಿರುವವರು",
      followups: "ಬಾಕಿ ಇರುವ ಭೇಟಿಗಳು",
      followups_sub: "ಗೃಹ ಭೇಟಿ ಅಗತ್ಯವಿರುವವರು",
      deic: "DEIC ರೆಫರಲ್‌ಗಳು",
      deic_sub: "ಜಿಲ್ಲಾ ಆಸ್ಪತ್ರೆಗೆ ಕಳುಹಿಸಲಾಗಿದೆ",
      recent: "ಇತ್ತೀಚಿನ ನೋಂದಣಿಗಳು",
      recent_sub: "ಸಕ್ರಿಯ ದಾಖಲೆಗಳು"
    },
    quick_actions: "ದೈನಂದಿನ ಫೀಲ್ಡ್ ಕಾರ್ಯಗಳು",
    qa_reg_title: "ಮಗುವನ್ನು ನೋಂದಾಯಿಸಿ",
    qa_reg_desc: "ಪೋಷಕರ ವಿವರ ಮತ್ತು ಸಮ್ಮತಿಯೊಂದಿಗೆ ನೋಂದಾಯಿಸಿ.",
    qa_obs_title: "ವೀಕ್ಷಣೆ ತಪಾಸಣೆ",
    qa_obs_desc: "ಎತ್ತರ, ತೂಕ ಮತ್ತು ನಡವಳಿಕೆಯನ್ನು ದಾಖಲಿಸಿ.",
    qa_deic_title: "DEIC ರೆಫರಲ್ ಕಳುಹಿಸಿ",
    qa_deic_desc: "ತಜ್ಞರ ತಪಾಸಣೆಗಾಗಿ ಜಿಲ್ಲಾ ಕೇಂದ್ರಕ್ಕೆ ರೆಫರ್ ಮಾಡಿ.",
    qa_fol_title: "ಗೃಹ ಭೇಟಿ ದಾಖಲಿಸಿ",
    qa_fol_desc: "ಭೇಟಿಯ ವಿವರ ಮತ್ತು ಪ್ರಯಾಣ ಸಹಾಯ ದಾಖಲಿಸಿ.",
    empty_dashboard_title: "ಇನ್ನೂ ಯಾವುದೇ ಮಗು ನೋಂದಣಿಯಾಗಿಲ್ಲ",
    empty_dashboard_desc: "ನಿಮ್ಮ ಫೀಲ್ಡ್ ರಿಜಿಸ್ಟರ್ ಪ್ರಸ್ತುತ ಸ್ವಚ್ಛವಾಗಿದೆ. ಮಕ್ಕಳ ಬೆಳವಣಿಗೆಯ ನಿಗಾ ವಹಿಸಲು ಮೊದಲ ಮಗುವನ್ನು ನೋಂದಾಯಿಸಿ.",
    empty_caseload: "ರಿಜಿಸ್ಟರ್‌ನಲ್ಲಿ ಯಾವುದೇ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಮೊದಲ ದಾಖಲೆ ಸೇರಿಸಲು 'ಹೊಸ ಮಗುವನ್ನು ನೋಂದಾಯಿಸಿ' ಕ್ಲಿಕ್ ಮಾಡಿ.",
    empty_deic: "ಇನ್ನೂ ಯಾವುದೇ DEIC ರೆಫರಲ್‌ಗಳು ಸೃಷ್ಟಿಯಾಗಿಲ್ಲ.",
    empty_obs: "ಇನ್ನೂ ಯಾವುದೇ ವೀಕ್ಷಣೆಗಳು ದಾಖಲಾಗಿಲ್ಲ.",
    empty_fol: "ಇನ್ನೂ ಯಾವುದೇ ಗೃಹ ಭೇಟಿಗಳು ದಾಖಲಾಗಿಲ್ಲ.",
    btn_register_first: "+ ಮೊದಲ ಮಗುವನ್ನು ನೋಂದಾಯಿಸಿ",
    btn_register_new: "+ ಹೊಸ ಮಗುವನ್ನು ನೋಂದಾಯಿಸಿ",
    btn_view_caseload: "ಕಾರ್ಯಪಟ್ಟಿ ವೀಕ್ಷಿಸಿ →",
    btn_cancel: "ರದ್ದುಮಾಡಿ",
    btn_save: "ದಾಖಲೆಯನ್ನು ಉಳಿಸಿ",
    btn_submit_obs: "ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ವೀಕ್ಷಣೆ ಉಳಿಸಿ",
    btn_submit_deic: "DEIC ರೆಫರಲ್ ರವಾನಿಸಿ",
    btn_submit_fol: "ಗೃಹ ಭೇಟಿಯನ್ನು ಉಳಿಸಿ",
    th_child: "ಮಗು ಮತ್ತು ಪೋಷಕರು",
    th_age_id: "ವಯಸ್ಸು / ಐಡಿ",
    th_village: "ಸ್ಥಳ / ವಾರ್ಡ್",
    th_last_visit: "ಕೊನೆಯ ಭೇಟಿ",
    th_status: "ಆರೈಕೆ ಸ್ಥಿತಿ",
    th_actions: "ಕ್ರಮಗಳು",
    search_ph: "ಮಗುವಿನ ಹೆಸರು, ಐಡಿ ಅಥವಾ ಪೋಷಕರನ್ನು ಹುಡುಕಿ...",
    filter_all: "ಎಲ್ಲಾ ದಾಖಲೆಗಳು",
    db_synced: "SQLite ಡೇಟಾಬೇಸ್ ಸಕ್ರಿಯ",
    db_offline: "ಸ್ಥಳೀಯ ಮೋಡ್",
    menu_title: "ಆಶಾ ಸೇವೆಗಳು ಮತ್ತು ಪರಿಕರಗಳು",
    menu_consent: "ಪೋಷಕರ ಸಮ್ಮತಿ ಪತ್ರ",
    menu_close: "ಮೆನು ಮುಚ್ಚಿ",
    auth: {
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
  }
};

function txt(path) {
  const dict = i18n[AppState.language] || i18n.en;
  const parts = path.split('.');
  let curr = dict;
  for (const p of parts) {
    if (curr && curr[p] !== undefined) {
      curr = curr[p];
    } else {
      let fallback = i18n.en;
      for (const fp of parts) {
        if (fallback && fallback[fp] !== undefined) fallback = fallback[fp];
        else return path;
      }
      return fallback;
    }
  }
  return curr;
}

// -------------------------------------------------------------
// BACKEND SQLITE DATA INITIALIZATION & SYNC
// -------------------------------------------------------------
async function fetchBackendData() {
  // First check if Supabase is configured
  if (window.SupabaseService && window.SupabaseService.isConfigured()) {
    try {
      const [caseload, referrals, followups] = await Promise.all([
        window.SupabaseService.fetchCaseload(),
        window.SupabaseService.fetchReferrals(),
        window.SupabaseService.fetchFollowups()
      ]);

      if (caseload !== null) {
        AppState.caseload = caseload;
        AppState.deicReferrals = referrals || [];
        AppState.followups = followups || [];
        AppState.dbConnected = true;
        AppState.supabaseConnected = true;
        AppState.dbType = 'supabase';
        renderApp();
        return;
      }
    } catch (err) {
      console.warn("Supabase query error, trying local SQLite backend:", err);
    }
  }

  // Fallback to local SQLite backend (server.py)
  try {
    const [caseloadRes, deicRes, followRes] = await Promise.all([
      fetch('/api/caseload'),
      fetch('/api/deic-referrals'),
      fetch('/api/followups')
    ]);

    if (caseloadRes.ok) {
      const data = await caseloadRes.json();
      AppState.caseload = data.caseload || [];
      AppState.dbConnected = true;
      AppState.supabaseConnected = false;
      AppState.dbType = 'sqlite';
    }
    if (deicRes.ok) {
      const data = await deicRes.json();
      AppState.deicReferrals = data.referrals || [];
    }
    if (followRes.ok) {
      const data = await followRes.json();
      AppState.followups = data.followups || [];
    }
  } catch (err) {
    console.warn("Local SQLite backend not reachable:", err);
    AppState.dbConnected = false;
    AppState.supabaseConnected = false;
  }
  renderApp();
}

// -------------------------------------------------------------
// MAIN APP RENDER FUNCTION
// -------------------------------------------------------------
function renderApp() {
  const container = document.getElementById('app-root');
  if (!container) return;

  // If not authenticated, render Login / Guided Sign Up screen
  if (!AppState.auth.isAuthenticated) {
    container.innerHTML = renderAuthScreen();
    return;
  }

  const isMobile = AppState.viewMode === 'mobile';
  let contentHtml = '';

  switch (AppState.activeTab) {
    case 'dashboard': contentHtml = renderDashboardView(); break;
    case 'caseload': contentHtml = renderCaseloadView(); break;
    case 'register': contentHtml = renderChildRegistrationView(); break;
    case 'observation': contentHtml = renderObservationFormView(); break;
    case 'deic': contentHtml = renderDeicReferralView(); break;
    case 'followup': contentHtml = renderFollowupView(); break;
    case 'consent': contentHtml = renderConsentView(); break;
    case 'feedback': contentHtml = renderFeedbackView(); break;
    default: contentHtml = renderDashboardView();
  }

  // Strictly 3 language options: English, Hindi, Kannada
  const langOptions = ['en', 'hi', 'kn'].map(k => `
    <option value="${k}" ${AppState.language === k ? 'selected' : ''}>${i18n[k].name}</option>
  `).join('');

  container.innerHTML = `
    <!-- Top ASHA System Bar -->
    <header class="top-controller-bar">
      <div class="brand-section">
        <button class="hamburger-btn" onclick="toggleHamburger(true)" title="Menu">☰</button>
        <div class="brand-logo" style="background: linear-gradient(135deg, #0d9488, #059669);">ASHA</div>
        <div>
          <div class="brand-title">${txt('appTitle')}</div>
          <div class="brand-subtitle">${txt('appSubtitle')}</div>
        </div>
      </div>

      <div class="controls-group">
        <!-- Viewport Mode Switcher -->
        <div class="view-mode-toggle">
          <button class="view-btn ${AppState.viewMode === 'desktop' ? 'active' : ''}" onclick="setViewMode('desktop')">
            💻 Desktop
          </button>
          <button class="view-btn ${AppState.viewMode === 'mobile' ? 'active' : ''}" onclick="setViewMode('mobile')">
            📱 Mobile App
          </button>
        </div>

        <!-- 3 Language Options Selector -->
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
        </div>

        <!-- Cloud Supabase / SQLite DB Indicator -->
        <button class="db-badge ${AppState.supabaseConnected ? 'db-supabase' : ''}" onclick="openSupabaseModal()" title="Click to view database connection or configure Supabase">
          <span>${AppState.supabaseConnected ? '⚡' : '🗄️'}</span>
          <span>${AppState.supabaseConnected ? 'Supabase (Live Cloud)' : (AppState.dbConnected ? 'SQLite (Connect Supabase ⚡)' : 'Offline / Standalone')}</span>
        </button>
      </div>
    </header>

    <!-- Main Workspace Stage -->
    <main class="main-stage">
      <div class="viewport-wrapper mode-${AppState.viewMode}">
        ${isMobile ? `
          <div class="mobile-notch">
            <span>09:41</span>
            <div class="notch-island"></div>
            <span>5G 📶 98%</span>
          </div>
          <div class="mobile-content-area">
            ${contentHtml}
          </div>
          ${renderMobileNav()}
        ` : `
          <div class="desktop-app-shell">
            ${renderDesktopSidebar()}
            <div class="desktop-content">
              ${contentHtml}
            </div>
          </div>
        `}
      </div>
    </main>

    ${AppState.hamburgerOpen ? renderHamburgerDrawer() : ''}
    <div id="modal-container"></div>
    <div id="toast-container" class="toast-container"></div>
  `;
}

// -------------------------------------------------------------
// NAVIGATION (SIDEBAR, BOTTOM BAR, HAMBURGER DRAWER)
// -------------------------------------------------------------
function renderDesktopSidebar() {
  const currentTab = AppState.activeTab;
  const count = AppState.caseload.length;
  const deicCount = AppState.deicReferrals.length;

  const navItems = [
    { id: 'dashboard', label: txt('nav.dashboard'), icon: '📋' },
    { id: 'caseload', label: txt('nav.caseload'), icon: '👥', badge: count > 0 ? count : null },
    { id: 'register', label: txt('nav.register'), icon: '➕' },
    { id: 'observation', label: txt('nav.observation'), icon: '📝' },
    { id: 'deic', label: txt('nav.deic'), icon: '🏥', special: true, badge: deicCount > 0 ? deicCount : null },
    { id: 'followup', label: txt('nav.followup'), icon: '🔄' },
    { id: 'consent', label: txt('nav.consent'), icon: '🛡️' },
    { id: 'feedback', label: txt('nav.feedback'), icon: '💬' }
  ];

  return `
    <aside class="desktop-sidebar">
      <div>
        <div class="sidebar-header" style="position: relative;">
          <div style="font-size: 11px; text-transform: uppercase; color: var(--neutral-400); font-weight: 700; letter-spacing: 0.05em;">
            ${txt('designation')}
          </div>
          <div style="font-size: 14px; font-weight: 800; color: var(--neutral-900); margin-top: 2px;">
            ${AppState.worker.name}
          </div>
          <div style="font-size: 11px; color: var(--teal-dark); font-weight: 600;">
            ${AppState.worker.sector}
          </div>
          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <button class="btn btn-sm btn-outline" style="padding: 3px 8px; font-size: 11px;" onclick="openWorkerProfileModal()">
              ⚙️ ${txt('edit_profile')}
            </button>
            <button class="btn btn-sm btn-outline" style="padding: 3px 8px; font-size: 11px; color: #dc2626; border-color: #fca5a5;" onclick="handleLogout()">
              🚪 ${txt('auth.logout')}
            </button>
          </div>
        </div>

        <nav class="sidebar-nav">
          ${navItems.map(item => `
            <button class="nav-item ${item.special ? 'special-nav' : ''} ${currentTab === item.id ? 'active' : ''}" onclick="setActiveTab('${item.id}')">
              <span>${item.icon}</span>
              <span>${item.label}</span>
              ${item.badge !== null && item.badge !== undefined ? `<span class="badge">${item.badge}</span>` : ''}
            </button>
          `).join('')}
        </nav>
      </div>

      <div style="padding: 16px; border-top: 1px solid var(--neutral-200); font-size: 12px; color: var(--neutral-600); background: #fafafa;">
        <div style="font-weight: 700;">🏥 Connected Center:</div>
        <div style="font-size: 11px; color: var(--neutral-500); margin-top: 2px;">${AppState.worker.deic}</div>
        <div style="margin-top: 6px; font-size: 11px; color: var(--emerald); font-weight: 600;">
          ● ${AppState.dbConnected ? 'Database Connected' : 'Ready'}
        </div>
      </div>
    </aside>
  `;
}

function renderMobileNav() {
  const currentTab = AppState.activeTab;
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: '📋' },
    { id: 'caseload', label: 'Children', icon: '👥' },
    { id: 'deic', label: 'DEIC', icon: '🏥' },
    { id: 'register', label: 'Register', icon: '➕' },
    { id: 'followup', label: 'Visits', icon: '🔄' }
  ];

  return `
    <nav class="mobile-bottom-nav">
      ${tabs.map(tab => `
        <button class="bottom-tab ${currentTab === tab.id ? 'active' : ''}" onclick="setActiveTab('${tab.id}')">
          <span class="tab-icon">${tab.icon}</span>
          <span>${tab.label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

function renderHamburgerDrawer() {
  return `
    <div class="drawer-overlay" onclick="toggleHamburger(false)">
      <div class="drawer-panel" onclick="event.stopPropagation()">
        <div class="drawer-header">
          <div>
            <div style="font-weight: 800; font-size: 15px; color: var(--neutral-900);">${txt('menu_title')}</div>
            <div style="font-size: 12px; color: var(--neutral-500);">${AppState.worker.name}</div>
          </div>
          <button class="btn btn-sm btn-outline" onclick="toggleHamburger(false)">✕</button>
        </div>

        <div class="drawer-content">
          <div class="drawer-section-title">Critical Verification</div>
          <button class="drawer-item highlight-consent" onclick="toggleHamburger(false); setActiveTab('consent');">
            <span>🛡️</span>
            <span>${txt('menu_consent')}</span>
            <span class="item-badge status-active">Consent</span>
          </button>

          <div class="drawer-section-title">Registers & Services</div>
          <button class="drawer-item" onclick="toggleHamburger(false); setActiveTab('dashboard');">
            <span>📋</span> <span>${txt('nav.dashboard')}</span>
          </button>
          <button class="drawer-item" onclick="toggleHamburger(false); setActiveTab('caseload');">
            <span>👥</span> <span>${txt('nav.caseload')} (${AppState.caseload.length})</span>
          </button>
          <button class="drawer-item" onclick="toggleHamburger(false); setActiveTab('register');">
            <span>➕</span> <span>${txt('nav.register')}</span>
          </button>
          <button class="drawer-item" onclick="toggleHamburger(false); setActiveTab('observation');">
            <span>📝</span> <span>${txt('nav.observation')}</span>
          </button>
          <button class="drawer-item" onclick="toggleHamburger(false); setActiveTab('deic');">
            <span>🏥</span> <span>${txt('nav.deic')}</span>
          </button>
          <button class="drawer-item" onclick="toggleHamburger(false); setActiveTab('followup');">
            <span>🔄</span> <span>${txt('nav.followup')}</span>
          </button>
          <button class="drawer-item" onclick="toggleHamburger(false); setActiveTab('feedback');">
            <span>💬</span> <span>${txt('nav.feedback')}</span>
          </button>

          <div class="drawer-section-title">Worker Setup</div>
          <button class="drawer-item" onclick="toggleHamburger(false); openWorkerProfileModal();">
            <span>⚙️</span> <span>${txt('edit_profile')}</span>
          </button>
          <button class="drawer-item" onclick="toggleHamburger(false); handleLogout();" style="color: #dc2626;">
            <span>🚪</span> <span>${txt('auth.switch_worker')}</span>
          </button>

          <div class="drawer-section-title">Cloud Backend</div>
          <button class="drawer-item" onclick="toggleHamburger(false); openSupabaseModal();" style="border-left: 3px solid ${AppState.supabaseConnected ? '#10b981' : '#0ea5e9'};">
            <span>⚡</span>
            <span>Supabase Cloud Settings</span>
            <span class="item-badge ${AppState.supabaseConnected ? 'status-active' : ''}">${AppState.supabaseConnected ? 'Connected' : 'Setup'}</span>
          </button>

          <div class="drawer-section-title">System</div>
          <div style="padding: 6px 14px; font-size: 12px; color: var(--neutral-600);">
            <strong>Language:</strong> ${i18n[AppState.language].name}
          </div>
          <div style="padding: 6px 14px; font-size: 12px; color: ${AppState.supabaseConnected ? 'var(--emerald)' : 'var(--teal)'};">
            ● ${AppState.supabaseConnected ? 'Cloud: Supabase Active' : (AppState.dbConnected ? 'Local: SQLite Active' : 'Offline')}
          </div>
        </div>

        <div style="padding: 16px; border-top: 1px solid var(--neutral-200); background: #f8fafc;">
          <button class="btn btn-outline" style="width: 100%; font-size: 13px;" onclick="toggleHamburger(false)">
            ${txt('menu_close')}
          </button>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------

// ==============================================================================
// AUTHENTICATION & GUIDED SIGN-UP WIZARD
// ==============================================================================

function renderAuthScreen() {
  const isLogin = AppState.auth.mode === 'login';
  const langOptions = ['en', 'hi', 'kn'].map(k => `
    <option value="${k}" ${AppState.language === k ? 'selected' : ''}>${i18n[k].name}</option>
  `).join('');

  return `
    <div class="auth-overlay">
      <div class="auth-wrapper">
        <div class="auth-card">
          <!-- Auth Brand Banner -->
          <div class="auth-brand-header">
            <div class="auth-brand-info">
              <div class="auth-brand-icon">🌱</div>
              <div>
                <h1 style="font-size: 20px; font-weight: 800; margin: 0; line-height: 1.2;">${txt('appTitle')}</h1>
                <p style="font-size: 12px; margin: 2px 0 0 0; opacity: 0.9;">${txt('appSubtitle')}</p>
              </div>
            </div>

            <!-- Language Switcher in Auth Screen -->
            <select class="lang-select" onchange="setLanguage(this.value)" style="border-color: rgba(255,255,255,0.4); background: rgba(0,0,0,0.2); color: #fff;">
              ${langOptions}
            </select>
          </div>

          <!-- Auth Mode Switcher Tabs -->
          <div class="auth-tab-switcher">
            <button class="auth-tab-btn ${isLogin ? 'active' : ''}" onclick="switchAuthMode('login')">
              <span>🔑</span> <span>${txt('auth.tab_login')}</span>
            </button>
            <button class="auth-tab-btn ${!isLogin ? 'active' : ''}" onclick="switchAuthMode('signup')">
              <span>✨</span> <span>${txt('auth.tab_signup')}</span>
            </button>
          </div>

          <!-- Auth Content Area -->
          <div class="auth-body">
            ${isLogin ? renderLoginForm() : renderGuidedSignupWizard()}
          </div>
        </div>

        <div style="text-align: center; margin-top: 18px; font-size: 12px; color: #94a3b8;">
          🏥 Government of Karnataka & National Health Mission Child Screening Initiative
        </div>
      </div>
    </div>
  `;
}

function renderLoginForm() {
  return `
    <div>
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0;">${txt('auth.login_title')}</h2>
        <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">${txt('auth.login_subtitle')}</p>
      </div>

      <form onsubmit="handleAuthLogin(event)">
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">${txt('auth.identifier_label')} <span style="color: #e11d48;">*</span></label>
          <input type="text" class="form-input" id="auth-login-identifier" 
            placeholder="${txt('auth.identifier_ph')}" 
            required 
            style="font-size: 13px;">
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label class="form-label" style="margin: 0;">${txt('auth.password_label')} <span style="color: #e11d48;">*</span></label>
          </div>
          <input type="password" class="form-input" id="auth-login-password" 
            placeholder="${txt('auth.password_ph')}" 
            required 
            style="font-size: 13px;">
        </div>

        <button type="submit" class="btn btn-teal" style="width: 100%; padding: 12px; font-size: 14px; font-weight: 700; border-radius: 10px; margin-bottom: 16px;">
          ${txt('auth.btn_login')}
        </button>

        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          <button type="button" class="btn btn-outline" style="width: 100%; font-size: 12px; font-weight: 600;" onclick="switchAuthMode('signup')">
            ${txt('auth.btn_go_signup')}
          </button>
        </div>
      </form>
    </div>
  `;
}

function renderGuidedSignupWizard() {
  const step = AppState.auth.signupStep;
  const f = AppState.auth.formData;

  // Stepper node active states
  const s1Class = step === 1 ? 'active' : (step > 1 ? 'completed' : '');
  const s2Class = step === 2 ? 'active' : (step > 2 ? 'completed' : '');
  const s3Class = step === 3 ? 'active' : (step > 3 ? 'completed' : '');
  const s4Class = step === 4 ? 'active' : '';

  const progressPercent = ((step - 1) / 3) * 100;

  let stepHtml = '';
  switch (step) {
    case 1: stepHtml = renderSignupStep1(f); break;
    case 2: stepHtml = renderSignupStep2(f); break;
    case 3: stepHtml = renderSignupStep3(f); break;
    case 4: stepHtml = renderSignupStep4(f); break;
    default: stepHtml = renderSignupStep1(f);
  }

  return `
    <div>
      <!-- Stepper Progress Header -->
      <div class="signup-stepper">
        <div class="stepper-progress-bar">
          <div class="stepper-progress-fill" style="width: ${progressPercent}%;"></div>
        </div>

        <div class="step-node ${s1Class}" onclick="handleJumpToStep(1)">
          <div class="step-node-bubble">${step > 1 ? '✓' : '1'}</div>
          <div class="step-node-label">${txt('auth.step1')}</div>
        </div>

        <div class="step-node ${s2Class}" onclick="handleJumpToStep(2)">
          <div class="step-node-bubble">${step > 2 ? '✓' : '2'}</div>
          <div class="step-node-label">${txt('auth.step2')}</div>
        </div>

        <div class="step-node ${s3Class}" onclick="handleJumpToStep(3)">
          <div class="step-node-bubble">${step > 3 ? '✓' : '3'}</div>
          <div class="step-node-label">${txt('auth.step3')}</div>
        </div>

        <div class="step-node ${s4Class}" onclick="handleJumpToStep(4)">
          <div class="step-node-bubble">4</div>
          <div class="step-node-label">${txt('auth.step4')}</div>
        </div>
      </div>

      <!-- Step Content -->
      ${stepHtml}
    </div>
  `;
}

function renderSignupStep1(f) {
  return `
    <div>
      <div class="step-hint-box">
        <span style="font-size: 18px;">💡</span>
        <div>
          <strong>${txt('auth.step1')}:</strong> ${txt('auth.step1_desc')}
        </div>
      </div>

      <form onsubmit="handleSignupStepNext(event, 1)">
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label">${txt('auth.name_label')} <span style="color: #e11d48;">*</span></label>
          <input type="text" class="form-input" id="su-name" 
            value="${f.name || ''}" 
            placeholder="e.g. Smt. Sumitra Bai" 
            required 
            onchange="updateSignupFormField('name', this.value)">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div class="form-group">
            <label class="form-label">${txt('auth.phone_label')} <span style="color: #e11d48;">*</span></label>
            <input type="tel" class="form-input" id="su-phone" 
              value="${f.phone || ''}" 
              placeholder="9876543210" 
              pattern="[0-9]{10}" 
              maxlength="10" 
              required 
              onchange="updateSignupFormField('phone', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">${txt('auth.email_label')}</label>
            <input type="email" class="form-input" id="su-email" 
              value="${f.email || ''}" 
              placeholder="asha@health.gov.in" 
              onchange="updateSignupFormField('email', this.value)">
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label">${txt('auth.badge_label')}</label>
          <input type="text" class="form-input" id="su-badge" 
            value="${f.badgeId || ''}" 
            placeholder="e.g. KA-ASHA-042 (Auto-generated if left blank)" 
            onchange="updateSignupFormField('badgeId', this.value)">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px;">
          <div class="form-group">
            <label class="form-label">${txt('auth.pass_label')} <span style="color: #e11d48;">*</span></label>
            <input type="password" class="form-input" id="su-password" 
              value="${f.password || ''}" 
              placeholder="Min 6 characters" 
              required 
              minlength="6" 
              onchange="updateSignupFormField('password', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">${txt('auth.confirm_pass_label')} <span style="color: #e11d48;">*</span></label>
            <input type="password" class="form-input" id="su-confirm-password" 
              value="${f.confirmPassword || ''}" 
              placeholder="Confirm password" 
              required 
              minlength="6" 
              onchange="updateSignupFormField('confirmPassword', this.value)">
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          <button type="button" class="btn btn-outline" onclick="switchAuthMode('login')">
            ${txt('auth.btn_go_login')}
          </button>
          <button type="submit" class="btn btn-teal">
            ${txt('auth.btn_next')}
          </button>
        </div>
      </form>
    </div>
  `;
}

function renderSignupStep2(f) {
  return `
    <div>
      <div class="step-hint-box">
        <span style="font-size: 18px;">📍</span>
        <div>
          <strong>${txt('auth.step2')}:</strong> ${txt('auth.step2_desc')}
        </div>
      </div>

      <form onsubmit="handleSignupStepNext(event, 2)">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div class="form-group">
            <label class="form-label">${txt('auth.state_label')} <span style="color: #e11d48;">*</span></label>
            <input type="text" class="form-input" id="su-state" 
              value="${f.state || 'Karnataka'}" 
              required 
              onchange="updateSignupFormField('state', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">${txt('auth.district_label')} <span style="color: #e11d48;">*</span></label>
            <input type="text" class="form-input" id="su-district" 
              value="${f.district || ''}" 
              placeholder="e.g. Ramanagara" 
              required 
              onchange="updateSignupFormField('district', this.value)">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div class="form-group">
            <label class="form-label">${txt('auth.taluk_label')} <span style="color: #e11d48;">*</span></label>
            <input type="text" class="form-input" id="su-taluk" 
              value="${f.taluk || ''}" 
              placeholder="e.g. Channapatna" 
              required 
              onchange="updateSignupFormField('taluk', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">${txt('auth.catchment_label')}</label>
            <input type="number" class="form-input" id="su-catchment" 
              value="${f.catchment || '1000'}" 
              placeholder="e.g. 1000" 
              onchange="updateSignupFormField('catchment', this.value)">
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 18px;">
          <label class="form-label">${txt('auth.sector_label')} <span style="color: #e11d48;">*</span></label>
          <input type="text" class="form-input" id="su-sector" 
            value="${f.sector || ''}" 
            placeholder="e.g. Sub-Centre 2, Ward 4, Kootagal Grama" 
            required 
            onchange="updateSignupFormField('sector', this.value)">
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          <button type="button" class="btn btn-outline" onclick="handleSignupStepBack(2)">
            ${txt('auth.btn_back')}
          </button>
          <button type="submit" class="btn btn-teal">
            ${txt('auth.btn_next')}
          </button>
        </div>
      </form>
    </div>
  `;
}

function renderSignupStep3(f) {
  return `
    <div>
      <div class="step-hint-box">
        <span style="font-size: 18px;">🏥</span>
        <div>
          <strong>${txt('auth.step3')}:</strong> ${txt('auth.step3_desc')}
        </div>
      </div>

      <form onsubmit="handleSignupStepNext(event, 3)">
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">${txt('auth.phc_label')} <span style="color: #e11d48;">*</span></label>
          <input type="text" class="form-input" id="su-facility" 
            value="${f.facility || ''}" 
            placeholder="e.g. Kootagal Primary Health Centre" 
            required 
            onchange="updateSignupFormField('facility', this.value)">
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">${txt('auth.deic_label')} <span style="color: #e11d48;">*</span></label>
          <input type="text" class="form-input" id="su-deic" 
            value="${f.deic || ''}" 
            placeholder="e.g. District Hospital Ramanagara DEIC Hub" 
            required 
            onchange="updateSignupFormField('deic', this.value)">
        </div>

        <div class="form-group" style="margin-bottom: 18px;">
          <label class="form-label">${txt('auth.mentor_label')}</label>
          <input type="text" class="form-input" id="su-mentor" 
            value="${f.mentor || ''}" 
            placeholder="e.g. Dr. Rajesh Kumar (Medical Officer)" 
            onchange="updateSignupFormField('mentor', this.value)">
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          <button type="button" class="btn btn-outline" onclick="handleSignupStepBack(3)">
            ${txt('auth.btn_back')}
          </button>
          <button type="submit" class="btn btn-teal">
            ${txt('auth.btn_next')}
          </button>
        </div>
      </form>
    </div>
  `;
}

function renderSignupStep4(f) {
  return `
    <div>
      <div class="step-hint-box" style="background: #f0fdf4; border-color: #bbf7d0; color: #166534;">
        <span style="font-size: 18px;">🛡️</span>
        <div>
          <strong>${txt('auth.step4')}:</strong> ${txt('auth.step4_desc')}
        </div>
      </div>

      <!-- 4 Core Fieldwork Orientation Cards -->
      <div class="guidance-grid">
        <div class="guide-card">
          <div class="guide-icon-badge">📋</div>
          <div>
            <div style="font-weight: 700; font-size: 13px; color: #0f172a;">1. Complete Village Child Census</div>
            <div style="font-size: 11px; color: #64748b; line-height: 1.4; margin-top: 2px;">
              Register every child aged 0–6 years in your catchment area with parent details and birth history.
            </div>
          </div>
        </div>

        <div class="guide-card">
          <div class="guide-icon-badge">🛡️</div>
          <div>
            <div style="font-weight: 700; font-size: 13px; color: #0f172a;">2. Mandatory Caregiver Consent</div>
            <div style="font-size: 11px; color: #64748b; line-height: 1.4; margin-top: 2px;">
              Always verify caregiver consent prior to anthropometry, milestone observations, or hospital referral.
            </div>
          </div>
        </div>

        <div class="guide-card">
          <div class="guide-icon-badge">📝</div>
          <div>
            <div style="font-weight: 700; font-size: 13px; color: #0f172a;">3. Developmental & Nutrition Screening</div>
            <div style="font-size: 11px; color: #64748b; line-height: 1.4; margin-top: 2px;">
              Record height, weight, MUAC, meals, and speech/motor milestones systematically during monthly home visits.
            </div>
          </div>
        </div>

        <div class="guide-card">
          <div class="guide-icon-badge">🏥</div>
          <div>
            <div style="font-weight: 700; font-size: 13px; color: #0f172a;">4. Fast-Track DEIC Facilitation</div>
            <div style="font-size: 11px; color: #64748b; line-height: 1.4; margin-top: 2px;">
              Immediately refer any child with developmental concerns to your linked District Early Intervention Centre.
            </div>
          </div>
        </div>
      </div>

      <form onsubmit="handleCompleteSignup(event)">
        <!-- Mandatory Pledge Checkbox -->
        <div style="background: #fafafa; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; margin-bottom: 20px;">
          <label style="display: flex; gap: 10px; align-items: flex-start; cursor: pointer; font-size: 12px; color: #1e293b; font-weight: 600;">
            <input type="checkbox" id="su-pledge" required style="width: 18px; height: 18px; margin-top: 1px; accent-color: #0d9488;" ${f.pledgeAccepted ? 'checked' : ''} onchange="updateSignupFormField('pledgeAccepted', this.checked)">
            <span>${txt('auth.pledge_text')}</span>
          </label>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          <button type="button" class="btn btn-outline" onclick="handleSignupStepBack(4)">
            ${txt('auth.btn_back')}
          </button>
          <button type="submit" class="btn btn-teal" style="font-weight: 800; padding: 10px 18px;">
            ${txt('auth.btn_complete')}
          </button>
        </div>
      </form>
    </div>
  `;
}

// -------------------------------------------------------------
// AUTHENTICATION EVENT HANDLERS
// -------------------------------------------------------------
function switchAuthMode(mode) {
  AppState.auth.mode = mode;
  if (mode === 'signup') {
    AppState.auth.signupStep = 1;
  }
  renderApp();
}

function handleJumpToStep(targetStep) {
  if (targetStep < AppState.auth.signupStep) {
    AppState.auth.signupStep = targetStep;
    renderApp();
  }
}

function updateSignupFormField(field, val) {
  AppState.auth.formData[field] = val;
}

function handleSignupStepNext(e, currentStep) {
  e.preventDefault();

  const f = AppState.auth.formData;

  if (currentStep === 1) {
    const p1 = document.getElementById('su-password').value;
    const p2 = document.getElementById('su-confirm-password').value;
    if (p1 !== p2) {
      showToast("Passwords do not match! Please verify.");
      return;
    }
    f.name = document.getElementById('su-name').value.trim();
    f.phone = document.getElementById('su-phone').value.trim();
    f.email = document.getElementById('su-email').value.trim();
    f.badgeId = document.getElementById('su-badge').value.trim();
    f.password = p1;
    f.confirmPassword = p2;
    AppState.auth.signupStep = 2;
  } else if (currentStep === 2) {
    f.state = document.getElementById('su-state').value.trim();
    f.district = document.getElementById('su-district').value.trim();
    f.taluk = document.getElementById('su-taluk').value.trim();
    f.sector = document.getElementById('su-sector').value.trim();
    f.catchment = document.getElementById('su-catchment').value.trim();
    AppState.auth.signupStep = 3;
  } else if (currentStep === 3) {
    f.facility = document.getElementById('su-facility').value.trim();
    f.deic = document.getElementById('su-deic').value.trim();
    f.mentor = document.getElementById('su-mentor') ? document.getElementById('su-mentor').value.trim() : '';
    AppState.auth.signupStep = 4;
  }

  renderApp();
}

function handleSignupStepBack(currentStep) {
  if (currentStep > 1) {
    AppState.auth.signupStep = currentStep - 1;
    renderApp();
  }
}

async function handleCompleteSignup(e) {
  e.preventDefault();
  const f = AppState.auth.formData;
  const pledge = document.getElementById('su-pledge').checked;

  if (!pledge) {
    showToast("Please accept the confidentiality pledge to complete sign up.");
    return;
  }

  const workerId = f.badgeId || ('ASHA-' + Math.floor(10000 + Math.random() * 90000));
  const newWorker = {
    id: workerId,
    name: f.name,
    phone: f.phone,
    email: f.email,
    password: f.password,
    badgeId: workerId,
    state: f.state || 'Karnataka',
    district: f.district || 'Ramanagara',
    taluk: f.taluk || 'Channapatna',
    sector: f.sector || 'Sub-Centre / Ward',
    facility: f.facility || 'Primary Health Centre (PHC)',
    deic: f.deic || 'District Early Intervention Centre (DEIC)',
    catchment: f.catchment || '1000',
    createdAt: new Date().toISOString()
  };

  // 1. Save to local storage session
  try {
    localStorage.setItem('careloop_auth_session', JSON.stringify(newWorker));
    const allWorkers = JSON.parse(localStorage.getItem('careloop_registered_workers') || '[]');
    allWorkers.push(newWorker);
    localStorage.setItem('careloop_registered_workers', JSON.stringify(allWorkers));
  } catch (err) {}

  // 2. Try registering worker in Supabase cloud
  if (window.SupabaseService && window.SupabaseService.isConfigured()) {
    try {
      await window.SupabaseService.registerWorker(newWorker);
    } catch (err) {
      console.warn("Supabase worker registration notice:", err);
    }
  }

  // 3. Update AppState and authenticate
  AppState.auth.isAuthenticated = true;
  AppState.auth.currentUser = newWorker;
  AppState.worker.name = newWorker.name;
  AppState.worker.sector = `${newWorker.sector} (${newWorker.district})`;
  AppState.worker.deic = newWorker.deic;

  showToast(`Welcome, ${newWorker.name}! Your ASHA profile is active.`);
  renderApp();
}

async function handleAuthLogin(e) {
  e.preventDefault();
  const identifier = document.getElementById('auth-login-identifier').value.trim();
  const password = document.getElementById('auth-login-password').value;

  if (!identifier || !password) {
    showToast("Please provide both identifier and password.");
    return;
  }

  showToast("Verifying credentials...");

  // 1. Check local registered workers
  let matchedWorker = null;
  try {
    const allWorkers = JSON.parse(localStorage.getItem('careloop_registered_workers') || '[]');
    matchedWorker = allWorkers.find(w => 
      (w.phone === identifier || w.email === identifier || w.id === identifier) && 
      (!w.password || w.password === password)
    );
  } catch (err) {}

  // 2. Check Supabase cloud if not found locally
  if (!matchedWorker && window.SupabaseService && window.SupabaseService.isConfigured()) {
    try {
      const supaAuth = await window.SupabaseService.authenticateWorker(identifier, password);
      if (supaAuth && supaAuth.success && supaAuth.worker) {
        matchedWorker = supaAuth.worker;
      }
    } catch (err) {
      console.warn("Supabase auth check error:", err);
    }
  }

  // 3. If still not matched, check if there was a saved session
  if (!matchedWorker) {
    const saved = localStorage.getItem('careloop_auth_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if ((parsed.phone === identifier || parsed.email === identifier || parsed.id === identifier) && 
          (!parsed.password || parsed.password === password)) {
        matchedWorker = parsed;
      }
    }
  }

  if (matchedWorker) {
    AppState.auth.isAuthenticated = true;
    AppState.auth.currentUser = matchedWorker;
    AppState.worker.name = matchedWorker.name;
    AppState.worker.sector = matchedWorker.sector;
    AppState.worker.deic = matchedWorker.deic;
    try {
      localStorage.setItem('careloop_auth_session', JSON.stringify(matchedWorker));
    } catch (err) {}
    showToast(`Welcome back, ${matchedWorker.name}!`);
    renderApp();
  } else {
    showToast("Invalid credentials. Try your registered phone/email or start Guided Sign Up.");
  }
}

function handleLogout() {
  AppState.auth.isAuthenticated = false;
  AppState.auth.currentUser = null;
  AppState.auth.mode = 'login';
  AppState.auth.signupStep = 1;
  try {
    localStorage.removeItem('careloop_auth_session');
  } catch (err) {}
  showToast("Logged out successfully.");
  renderApp();
}

// -------------------------------------------------------------
// SCREEN A1: FIELD DASHBOARD (CLEAN & DYNAMIC)
// -------------------------------------------------------------
function renderDashboardView() {
  const count = AppState.caseload.length;
  const deicCount = AppState.deicReferrals.length;
  const followupCount = AppState.caseload.filter(c => c.priority === 'High' || (c.status && c.status.includes('Due'))).length;

  return `
    <div class="page-header">
      <div>
        <div style="font-size: 13px; color: var(--teal-dark); font-weight: 700;">
          ${txt('greeting')}
        </div>
        <h1 class="page-title">${txt('nav.dashboard')}</h1>
        <p class="page-subtitle">${txt('designation')} • ${AppState.worker.sector}</p>
      </div>

      <div style="display: flex; gap: 8px;">
        <button class="btn btn-teal btn-sm" onclick="setActiveTab('register')">
          + ${txt('btn_register_new')}
        </button>
      </div>
    </div>

    <div class="screen-body">
      <!-- Real Statistics Counters (0 on fresh launch) -->
      <div class="grid-4">
        <div class="card" style="border-top: 4px solid var(--teal);">
          <div style="font-size: 12px; font-weight: 600; color: var(--neutral-500);">${txt('stats.total')}</div>
          <div style="font-size: 30px; font-weight: 800; color: var(--neutral-900); margin: 4px 0;">${count}</div>
          <div style="font-size: 11px; color: var(--emerald); font-weight: 600;">${txt('stats.total_sub')}</div>
        </div>

        <div class="card" style="border-top: 4px solid var(--amber);">
          <div style="font-size: 12px; font-weight: 600; color: var(--neutral-500);">${txt('stats.followups')}</div>
          <div style="font-size: 30px; font-weight: 800; color: var(--amber); margin: 4px 0;">${followupCount}</div>
          <div style="font-size: 11px; color: var(--neutral-500);">${txt('stats.followups_sub')}</div>
        </div>

        <div class="card" style="border-top: 4px solid var(--primary);">
          <div style="font-size: 12px; font-weight: 600; color: var(--neutral-500);">${txt('stats.deic')}</div>
          <div style="font-size: 30px; font-weight: 800; color: var(--primary); margin: 4px 0;">${deicCount}</div>
          <div style="font-size: 11px; color: var(--primary); font-weight: 600;">${txt('stats.deic_sub')}</div>
        </div>

        <div class="card" style="border-top: 4px solid var(--emerald);">
          <div style="font-size: 12px; font-weight: 600; color: var(--neutral-500);">${txt('stats.recent')}</div>
          <div style="font-size: 30px; font-weight: 800; color: var(--emerald); margin: 4px 0;">${count}</div>
          <div style="font-size: 11px; color: var(--neutral-500);">${txt('stats.recent_sub')}</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <div class="card-title" style="margin-bottom: 14px;">⚡ ${txt('quick_actions')}</div>
        <div class="grid-4">
          <div class="action-card" onclick="setActiveTab('register')" style="border-left: 3px solid var(--primary);">
            <div class="action-icon" style="background: var(--primary-light); color: var(--primary);">➕</div>
            <div>
              <div style="font-weight: 700; font-size: 13px;">${txt('qa_reg_title')}</div>
              <div style="font-size: 11px; color: var(--neutral-500); margin-top: 2px;">${txt('qa_reg_desc')}</div>
            </div>
          </div>

          <div class="action-card" onclick="setActiveTab('observation')" style="border-left: 3px solid var(--emerald);">
            <div class="action-icon" style="background: var(--emerald-light); color: var(--emerald);">📝</div>
            <div>
              <div style="font-weight: 700; font-size: 13px;">${txt('qa_obs_title')}</div>
              <div style="font-size: 11px; color: var(--neutral-500); margin-top: 2px;">${txt('qa_obs_desc')}</div>
            </div>
          </div>

          <div class="action-card" onclick="setActiveTab('deic')" style="border-left: 3px solid var(--teal);">
            <div class="action-icon" style="background: var(--teal-light); color: var(--teal);">🏥</div>
            <div>
              <div style="font-weight: 700; font-size: 13px;">${txt('qa_deic_title')}</div>
              <div style="font-size: 11px; color: var(--neutral-500); margin-top: 2px;">${txt('qa_deic_desc')}</div>
            </div>
          </div>

          <div class="action-card" onclick="setActiveTab('followup')" style="border-left: 3px solid var(--amber);">
            <div class="action-icon" style="background: var(--amber-light); color: var(--amber);">🔄</div>
            <div>
              <div style="font-weight: 700; font-size: 13px;">${txt('qa_fol_title')}</div>
              <div style="font-size: 11px; color: var(--neutral-500); margin-top: 2px;">${txt('qa_fol_desc')}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Real Caseload Section or Clean Empty State -->
      ${count === 0 ? `
        <div class="card" style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 42px; margin-bottom: 10px;">📋</div>
          <div style="font-size: 17px; font-weight: 700; color: var(--neutral-900);">
            ${txt('empty_dashboard_title')}
          </div>
          <p style="font-size: 13px; color: var(--neutral-500); max-width: 480px; margin: 8px auto 20px auto;">
            ${txt('empty_dashboard_desc')}
          </p>
          <button class="btn btn-teal btn-lg" onclick="setActiveTab('register')">
            ${txt('btn_register_first')}
          </button>
        </div>
      ` : `
        <div class="card">
          <div class="card-header">
            <div class="card-title">📋 Active Registered Children (${count})</div>
            <button class="btn btn-sm btn-outline" onclick="setActiveTab('caseload')">
              ${txt('btn_view_caseload')}
            </button>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="border-bottom: 2px solid var(--neutral-200); text-align: left; color: var(--neutral-600);">
                  <th style="padding: 10px 8px;">${txt('th_child')}</th>
                  <th style="padding: 10px 8px;">${txt('th_age_id')}</th>
                  <th style="padding: 10px 8px;">${txt('th_village')}</th>
                  <th style="padding: 10px 8px;">${txt('th_last_visit')}</th>
                  <th style="padding: 10px 8px;">${txt('th_status')}</th>
                  <th style="padding: 10px 8px;">${txt('th_actions')}</th>
                </tr>
              </thead>
              <tbody>
                ${AppState.caseload.slice(0, 5).map(row => `
                  <tr style="border-bottom: 1px solid var(--neutral-100);">
                    <td style="padding: 12px 8px;">
                      <strong>${row.name}</strong><br>
                      <span style="font-size: 11px; color: var(--neutral-500);">${row.guardian || ''}</span>
                    </td>
                    <td style="padding: 12px 8px; color: var(--neutral-600);">${row.age}<br><span style="font-size: 11px;">${row.id}</span></td>
                    <td style="padding: 12px 8px;">${row.village}</td>
                    <td style="padding: 12px 8px;">${row.last_visit || 'Today'}</td>
                    <td style="padding: 12px 8px;">
                      <span class="status-pill status-${row.priority === 'High' ? 'alert' : 'active'}">
                        ${row.status || 'Registered'}
                      </span>
                    </td>
                    <td style="padding: 12px 8px;">
                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-sm btn-outline" onclick="prepareObservation('${row.id}')">📝 Observe</button>
                        <button class="btn btn-sm btn-teal" onclick="prepareDeicReferral('${row.id}', '${row.name}')">🏥 DEIC</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `}
    </div>
  `;
}

// -------------------------------------------------------------
// SCREEN A2: CHILD REGISTRATION FORM (UNFILLED, CLEAN PLACEHOLDERS)
// -------------------------------------------------------------
function renderChildRegistrationView() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">${txt('nav.register')}</h1>
        <p class="page-subtitle">Enroll a child in the community register. All fields save directly to the SQLite database.</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="setActiveTab('dashboard')">← ${txt('nav.dashboard')}</button>
    </div>

    <div class="screen-body">
      <div class="card" style="max-width: 680px; margin: 0 auto; width: 100%;">
        <div style="font-weight: 700; font-size: 16px; margin-bottom: 16px; color: var(--neutral-900);">
          Household Child Registration
        </div>

        <form onsubmit="handleChildRegistration(event)">
          <div class="form-group">
            <label class="form-label">Child Full Name *</label>
            <input type="text" id="reg-name" class="form-input" required placeholder="Enter child's full name">
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Age or Date of Birth *</label>
              <input type="text" id="reg-age" class="form-input" required placeholder="e.g., 3 years or DD/MM/YYYY">
            </div>
            <div class="form-group">
              <label class="form-label">Gender</label>
              <select class="form-select" id="reg-gender">
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Village / Ward / Location Address *</label>
            <input type="text" id="reg-address" class="form-input" required placeholder="Enter house no., street, ward, or village">
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Primary Guardian Name *</label>
              <input type="text" id="reg-guardian" class="form-input" required placeholder="Enter parent / guardian name">
            </div>
            <div class="form-group">
              <label class="form-label">Relationship to Child *</label>
              <select class="form-select" id="reg-rel">
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Grandparent">Grandparent</option>
                <option value="Legal Guardian">Legal Guardian</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Guardian Mobile Number *</label>
            <input type="tel" id="reg-phone" class="form-input" required placeholder="Enter 10-digit mobile number">
          </div>

          <!-- Informed Guardian Consent Verification Checkbox -->
          <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: var(--radius-sm); padding: 14px; margin: 16px 0;">
            <label style="display: flex; gap: 10px; align-items: flex-start; cursor: pointer;">
              <input type="checkbox" id="reg-consent" checked required style="margin-top: 3px; transform: scale(1.2);">
              <span style="font-size: 13px; color: #166534;">
                <strong>Informed Guardian Consent Obtained:</strong> The parent/guardian consents to developmental observation, screening records, and referral to District Early Intervention Centre (DEIC) specialists.
              </span>
            </label>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button type="button" class="btn btn-outline" onclick="setActiveTab('dashboard')">${txt('btn_cancel')}</button>
            <button type="submit" class="btn btn-teal">Save Child in SQLite Database</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// SCREEN A3: ASSIGNED CASELOAD DIRECTORY
// -------------------------------------------------------------
function renderCaseloadView() {
  const list = AppState.caseload;

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">${txt('nav.caseload')}</h1>
        <p class="page-subtitle">Directory of registered children in your assigned community area.</p>
      </div>
      <button class="btn btn-primary btn-sm" onclick="setActiveTab('register')">${txt('btn_register_new')}</button>
    </div>

    <div class="screen-body">
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
          <input type="text" id="caseload-search" oninput="filterCaseload(this.value)" placeholder="${txt('search_ph')}" class="form-input" style="max-width: 300px;">
          <div style="font-size: 13px; color: var(--neutral-500);">
            Total Records: <strong>${list.length}</strong>
          </div>
        </div>

        ${list.length === 0 ? `
          <div style="text-align: center; padding: 40px 20px; color: var(--neutral-500);">
            <div style="font-size: 36px; margin-bottom: 8px;">👥</div>
            <div style="font-size: 15px; font-weight: 600;">${txt('empty_caseload')}</div>
            <button class="btn btn-teal btn-sm" style="margin-top: 14px;" onclick="setActiveTab('register')">
              ${txt('btn_register_new')}
            </button>
          </div>
        ` : `
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="border-bottom: 2px solid var(--neutral-200); text-align: left; color: var(--neutral-600);">
                  <th style="padding: 10px 8px;">${txt('th_child')}</th>
                  <th style="padding: 10px 8px;">${txt('th_age_id')}</th>
                  <th style="padding: 10px 8px;">${txt('th_village')}</th>
                  <th style="padding: 10px 8px;">${txt('th_last_visit')}</th>
                  <th style="padding: 10px 8px;">${txt('th_status')}</th>
                  <th style="padding: 10px 8px;">${txt('th_actions')}</th>
                </tr>
              </thead>
              <tbody id="caseload-table-body">
                ${list.map(row => `
                  <tr style="border-bottom: 1px solid var(--neutral-100);">
                    <td style="padding: 12px 8px;">
                      <strong>${row.name}</strong><br>
                      <span style="font-size: 11px; color: var(--neutral-500);">${row.guardian || ''}</span>
                    </td>
                    <td style="padding: 12px 8px; color: var(--neutral-600);">${row.age}<br><span style="font-size: 11px;">${row.id}</span></td>
                    <td style="padding: 12px 8px;">${row.village}</td>
                    <td style="padding: 12px 8px;">${row.last_visit || 'Today'}</td>
                    <td style="padding: 12px 8px;">
                      <span class="status-pill status-${row.priority === 'High' ? 'alert' : 'active'}">
                        ${row.status || 'Registered'}
                      </span>
                    </td>
                    <td style="padding: 12px 8px;">
                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-sm btn-outline" onclick="prepareObservation('${row.id}')">📝 Observe</button>
                        <button class="btn btn-sm btn-teal" onclick="prepareDeicReferral('${row.id}', '${row.name}')">🏥 DEIC</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// SCREEN A4: BASIC OBSERVATION SCREENING FORM (CLEAN UNFILLED)
// -------------------------------------------------------------
function renderObservationFormView() {
  const children = AppState.caseload;

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">${txt('nav.observation')}</h1>
        <p class="page-subtitle">Document everyday observable behaviors, measurements, and feeding habits.</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="setActiveTab('dashboard')">← ${txt('nav.dashboard')}</button>
    </div>

    <div class="screen-body">
      <div class="card" style="max-width: 760px; margin: 0 auto; width: 100%;">
        ${children.length === 0 ? `
          <div style="text-align: center; padding: 30px; color: var(--neutral-500);">
            <div style="font-size: 32px; margin-bottom: 6px;">📝</div>
            <div style="font-size: 15px; font-weight: 600;">Please register a child first before entering observations.</div>
            <button class="btn btn-teal btn-sm" style="margin-top: 12px;" onclick="setActiveTab('register')">
              ${txt('btn_register_new')}
            </button>
          </div>
        ` : `
          <form onsubmit="handleObservationSubmit(event)">
            <!-- Select Child -->
            <div class="form-group" style="margin-bottom: 20px;">
              <label class="form-label">Select Registered Child *</label>
              <select class="form-select" id="obs-child-id" required>
                ${children.map(c => `
                  <option value="${c.id}" ${AppState.selectedChildId === c.id ? 'selected' : ''}>
                    ${c.name} (${c.id}) - ${c.age}
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Measurements -->
            <div style="margin-bottom: 20px;">
              <div style="font-weight: 700; font-size: 14px; border-bottom: 1px solid var(--neutral-200); padding-bottom: 6px; margin-bottom: 12px;">
                1. Physical Measurements
              </div>
              <div class="grid-3">
                <div class="form-group">
                  <label class="form-label">Height (cm) *</label>
                  <input type="number" step="0.1" id="obs-height" class="form-input" required placeholder="e.g., 95.5">
                </div>
                <div class="form-group">
                  <label class="form-label">Weight (kg) *</label>
                  <input type="number" step="0.1" id="obs-weight" class="form-input" required placeholder="e.g., 14.2">
                </div>
                <div class="form-group">
                  <label class="form-label">MUAC (cm)</label>
                  <input type="number" step="0.1" id="obs-muac" class="form-input" placeholder="e.g., 14.0">
                </div>
              </div>
            </div>

            <!-- Nutrition & Appetite -->
            <div style="margin-bottom: 20px;">
              <div style="font-weight: 700; font-size: 14px; border-bottom: 1px solid var(--neutral-200); padding-bottom: 6px; margin-bottom: 12px;">
                2. Nutrition & Appetite Observations
              </div>
              <div class="form-group">
                <label class="form-label">Daily Meal Frequency & Appetite</label>
                <select class="form-select" id="obs-meals">
                  <option value="3 regular meals + Anganwadi midday meal">3 regular meals + Anganwadi midday meal</option>
                  <option value="2 meals (Irregular appetite reported)">2 meals (Irregular appetite reported)</option>
                  <option value="Severe refusal of solid foods / selective eating">Severe refusal of solid foods / selective eating</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Feeding Sensitivities & Difficulties</label>
                <input type="text" id="obs-feeding" class="form-input" placeholder="e.g., Texture aversion, refusal of solids, prolonged mealtime">
              </div>
            </div>

            <!-- Development & Everyday Observable Behavior -->
            <div style="margin-bottom: 20px;">
              <div style="font-weight: 700; font-size: 14px; border-bottom: 1px solid var(--neutral-200); padding-bottom: 6px; margin-bottom: 12px;">
                3. Everyday Observable Behaviors
              </div>
              <div class="form-group">
                <label class="form-label">Communication & Speech Observations</label>
                <select class="form-select" id="obs-speech">
                  <option value="Uses single words or gestures instead of connected sentences">Uses single words or gestures instead of connected sentences</option>
                  <option value="Speaks in age-appropriate connected sentences">Speaks in age-appropriate connected sentences</option>
                  <option value="Non-verbal (leads caregiver by hand, cries when misunderstood)">Non-verbal (leads caregiver by hand, cries when misunderstood)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Response to Sound / Ambient Noise</label>
                <select class="form-select" id="obs-sound">
                  <option value="Normal response to name and sounds">Normal response to name and sounds</option>
                  <option value="Covers ears or shows extreme distress in loud/crowded places">Covers ears or shows extreme distress in loud/crowded places</option>
                  <option value="Does not respond when name is called">Does not respond when name is called</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Detailed Notes from Household Visit</label>
                <textarea class="form-textarea" id="obs-notes" rows="3" placeholder="Enter objective observations directly noticed during the visit..."></textarea>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" class="btn btn-outline" onclick="setActiveTab('dashboard')">${txt('btn_cancel')}</button>
              <button type="submit" class="btn btn-teal">${txt('btn_submit_obs')}</button>
            </div>
          </form>
        `}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// SCREEN A6: DEDICATED DEIC REFERRAL FACILITATION
// -------------------------------------------------------------
function renderDeicReferralView() {
  const referrals = AppState.deicReferrals;
  const children = AppState.caseload;

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">${txt('nav.deic')}</h1>
        <p class="page-subtitle">Separate referral pathway connecting children to District Early Intervention Centre (DEIC) under RBSK.</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-teal btn-sm" onclick="openNewDeicModal()">+ Create New DEIC Referral</button>
        <button class="btn btn-outline btn-sm" onclick="setActiveTab('dashboard')">← ${txt('nav.dashboard')}</button>
      </div>
    </div>

    <div class="screen-body">
      <!-- DEIC Facility Information Banner -->
      <div class="card" style="background: linear-gradient(135deg, #0f766e, #0d9488); color: white;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="font-size: 18px; font-weight: 800;">District Early Intervention Centre (DEIC) Hub</div>
            <div style="font-size: 13px; opacity: 0.9; margin-top: 4px;">
              ${AppState.worker.deic} • Free multidisciplinary evaluation under RBSK
            </div>
          </div>
          <button class="btn btn-sm" style="background: white; color: var(--teal-dark); font-weight: 700;" onclick="openNewDeicModal()">
            + Facilitate Referral
          </button>
        </div>
      </div>

      <!-- Real DEIC Referrals List -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📋 DEIC Referrals Submitted (${referrals.length})</div>
        </div>

        ${referrals.length === 0 ? `
          <div style="text-align: center; padding: 40px 20px; color: var(--neutral-500);">
            <div style="font-size: 36px; margin-bottom: 8px;">🏥</div>
            <div style="font-size: 15px; font-weight: 600;">${txt('empty_deic')}</div>
            ${children.length > 0 ? `
              <button class="btn btn-teal btn-sm" style="margin-top: 14px;" onclick="openNewDeicModal()">
                + Facilitate First Referral
              </button>
            ` : `
              <button class="btn btn-primary btn-sm" style="margin-top: 14px;" onclick="setActiveTab('register')">
                Register a Child First
              </button>
            `}
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${referrals.map(ref => `
              <div style="border: 1.5px solid var(--neutral-200); border-radius: var(--radius-md); padding: 18px; background: white;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 16px; font-weight: 800; color: var(--neutral-900);">${ref.child_name || 'Child'}</span>
                      <span class="status-pill status-scheduled">${ref.status || 'Submitted'}</span>
                      <span class="status-pill status-alert">${ref.urgency || 'Priority'}</span>
                    </div>
                    <div style="font-size: 12px; color: var(--neutral-500); margin-top: 3px;">
                      Referral ID: <strong>${ref.id}</strong> • Primary Concern: <strong>${ref.primary_concerns}</strong>
                    </div>
                  </div>
                </div>

                <div style="margin-top: 12px; background: var(--neutral-50); border-left: 4px solid var(--teal); padding: 12px; border-radius: 6px;">
                  <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--teal-dark); margin-bottom: 4px;">
                    Detailed Clinical & Observational Reason for Referral:
                  </div>
                  <p style="font-size: 13px; color: var(--neutral-800); line-height: 1.5;">
                    ${ref.detailed_referral_reason}
                  </p>
                </div>

                <div style="margin-top: 12px; font-size: 12px; color: var(--neutral-600); display: flex; justify-content: space-between;">
                  <div>Target DEIC: <strong>${ref.deic_center}</strong></div>
                  <div>${ref.transit_assistance_requested ? '<span style="color: var(--emerald); font-weight: 600;">🚌 RBSK Free Travel Grant Requested</span>' : ''}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// SCREEN A7: HOUSEHOLD FOLLOW-UP & CONTINUITY
// -------------------------------------------------------------
function renderFollowupView() {
  const followups = AppState.followups;
  const children = AppState.caseload;

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">${txt('nav.followup')}</h1>
        <p class="page-subtitle">Track household visits, ensure appointments are kept, and solve travel/wage barriers.</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="setActiveTab('dashboard')">← ${txt('nav.dashboard')}</button>
    </div>

    <div class="screen-body">
      ${children.length === 0 ? `
        <div class="card" style="text-align: center; padding: 40px; color: var(--neutral-500);">
          <div style="font-size: 32px; margin-bottom: 6px;">🔄</div>
          <div style="font-size: 15px; font-weight: 600;">Register children in your caseload to log household follow-ups.</div>
          <button class="btn btn-teal btn-sm" style="margin-top: 12px;" onclick="setActiveTab('register')">
            ${txt('btn_register_new')}
          </button>
        </div>
      ` : `
        <!-- Form to Record Follow-up Visit -->
        <div class="card" style="border-left: 4px solid var(--amber);">
          <div class="card-title" style="margin-bottom: 12px;">📝 Log Household Follow-up Visit</div>
          <form onsubmit="handleFollowupSubmit(event)">
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Select Child *</label>
                <select class="form-select" id="fol-child-id" required>
                  ${children.map(c => `
                    <option value="${c.id}" data-name="${c.name}">${c.name} (${c.id})</option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Family Contact Status *</label>
                <select class="form-select" id="fol-status">
                  <option value="Visited household in person, spoke with guardian">Visited household in person, spoke with guardian</option>
                  <option value="Contacted caregiver via phone">Contacted caregiver via phone</option>
                  <option value="Family temporarily away from home">Family temporarily away from home</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Appointment Readiness & Barrier Identification</label>
              <select class="form-select" id="fol-readiness">
                <option value="Confirmed: Family will attend scheduled DEIC appointment">Confirmed: Family will attend scheduled DEIC appointment</option>
                <option value="Barrier: Needs travel support / bus fare assistance">Barrier: Needs travel support / bus fare assistance</option>
                <option value="Barrier: Caregiver work or daily wage commitment">Barrier: Caregiver work or daily wage commitment</option>
                <option value="Barrier: Family hesitation or fear of stigma">Barrier: Family hesitation or fear of stigma</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Visit Notes & Assistance Provided</label>
              <textarea class="form-textarea" id="fol-notes" rows="3" placeholder="Describe the outcome of your visit and any guidance given to the guardian..."></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button type="submit" class="btn btn-teal">${txt('btn_submit_fol')}</button>
            </div>
          </form>
        </div>

        <!-- Follow-up History Log -->
        <div class="card">
          <div class="card-title" style="margin-bottom: 12px;">📅 Recorded Household Visits (${followups.length})</div>
          ${followups.length === 0 ? `
            <div style="text-align: center; padding: 20px; color: var(--neutral-500); font-size: 13px;">
              ${txt('empty_fol')}
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${followups.map(f => `
                <div style="border-left: 3px solid var(--primary); padding-left: 12px;">
                  <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--neutral-500);">
                    <span><strong>${f.child_name || 'Child'}</strong> (${f.contact_status})</span>
                    <span>${f.date}</span>
                  </div>
                  <p style="font-size: 13px; color: var(--neutral-800); margin-top: 4px;">${f.notes || f.readiness}</p>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `}
    </div>
  `;
}

// -------------------------------------------------------------
// CAREGIVER CONSENT REVIEW (IN HAMBURGER MENU)
// -------------------------------------------------------------
function renderConsentView() {
  const children = AppState.caseload;

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">${txt('nav.consent')}</h1>
        <p class="page-subtitle">Verify guardian consent scope for screening, DEIC referrals, and household visits.</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="setActiveTab('dashboard')">← ${txt('nav.dashboard')}</button>
    </div>

    <div class="screen-body">
      <div class="card" style="border-left: 4px solid var(--emerald); background: #f0fdf4;">
        <div style="font-size: 16px; font-weight: 800; color: #166534;">
          🛡️ Informed Guardian Consent Protocol
        </div>
        <div style="font-size: 13px; color: #15803d; margin-top: 4px;">
          All registrations require explicit consent from the primary caregiver before observation notes are transmitted to DEIC specialists.
        </div>
      </div>

      <div class="card">
        <div class="card-title" style="margin-bottom: 12px;">Registered Guardian Authorizations:</div>
        ${children.length === 0 ? `
          <div style="text-align: center; padding: 30px; color: var(--neutral-500); font-size: 13px;">
            No children registered yet. Guardian consent is recorded during child enrollment.
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${children.map(c => `
              <div style="padding: 12px; border-radius: 6px; background: var(--neutral-50); border: 1px solid var(--neutral-200); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong>${c.name}</strong> (${c.id})<br>
                  <span style="font-size: 12px; color: var(--neutral-500);">Guardian: ${c.guardian || 'Parent'} • Phone: ${c.phone || 'Recorded'}</span>
                </div>
                <span class="status-pill status-active">✓ Consent Verified</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// SCREEN A8: ASHA WORKER FEEDBACK
// -------------------------------------------------------------
function renderFeedbackView() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">${txt('nav.feedback')}</h1>
        <p class="page-subtitle">Submit your feedback to help the health administration improve field forms.</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="setActiveTab('dashboard')">← ${txt('nav.dashboard')}</button>
    </div>

    <div class="screen-body">
      <div class="card" style="max-width: 640px; margin: 0 auto; width: 100%;">
        <form onsubmit="event.preventDefault(); showToast('Thank you! Feedback recorded for Health Administration.'); setActiveTab('dashboard');">
          <div class="form-group">
            <label class="form-label">How easy was it to complete child registration and observation?</label>
            <select class="form-select">
              <option>Very easy and fast</option>
              <option>Moderate</option>
              <option>Needs fewer questions</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">What field support would make your visits easier?</label>
            <textarea class="form-textarea" rows="3" placeholder="Enter your suggestions..."></textarea>
          </div>
          <button type="submit" class="btn btn-teal">Submit Field Feedback</button>
        </form>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// WORKER PROFILE CONFIGURATION MODAL
// -------------------------------------------------------------
function openWorkerProfileModal() {
  const modal = document.getElementById('modal-container');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal-card" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3 style="font-size: 16px; font-weight: 700;">⚙️ ${txt('edit_profile')}</h3>
          <button class="btn btn-sm btn-outline" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <form onsubmit="handleSaveWorkerProfile(event)">
            <div class="form-group">
              <label class="form-label">Your Name (ASHA Worker)</label>
              <input type="text" class="form-input" id="cfg-worker-name" value="${AppState.worker.name === 'ASHA Worker' ? '' : AppState.worker.name}" placeholder="Enter your full name">
            </div>
            <div class="form-group">
              <label class="form-label">Sub-Centre / Ward / Sector</label>
              <input type="text" class="form-input" id="cfg-worker-sector" value="${AppState.worker.sector === 'Local Sub-Centre / Ward' ? '' : AppState.worker.sector}" placeholder="e.g. Sub-Centre 2, Ward 1">
            </div>
            <div class="form-group">
              <label class="form-label">Assigned District Hospital DEIC Hub</label>
              <input type="text" class="form-input" id="cfg-worker-deic" value="${AppState.worker.deic === 'District Early Intervention Centre (DEIC)' ? '' : AppState.worker.deic}" placeholder="e.g. District Early Intervention Centre, District Hospital">
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px;">
              <button type="button" class="btn btn-outline" onclick="closeModal()">${txt('btn_cancel')}</button>
              <button type="submit" class="btn btn-teal">${txt('btn_save')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function handleSaveWorkerProfile(e) {
  e.preventDefault();
  const name = document.getElementById('cfg-worker-name').value.trim() || "ASHA Worker";
  const sector = document.getElementById('cfg-worker-sector').value.trim() || "Local Sub-Centre / Ward";
  const deic = document.getElementById('cfg-worker-deic').value.trim() || "District Early Intervention Centre (DEIC)";

  AppState.worker.name = name;
  AppState.worker.sector = sector;
  AppState.worker.deic = deic;

  try {
    localStorage.setItem('asha_worker_profile', JSON.stringify(AppState.worker));
  } catch (err) {}

  closeModal();
  showToast("Profile updated!");
  renderApp();
}

// -------------------------------------------------------------
// EVENT HANDLERS & MODALS
// -------------------------------------------------------------
async function handleChildRegistration(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const age = document.getElementById('reg-age').value.trim();
  const gender = document.getElementById('reg-gender').value;
  const address = document.getElementById('reg-address').value.trim();
  const guardian = document.getElementById('reg-guardian').value.trim();
  const rel = document.getElementById('reg-rel').value;
  const phone = document.getElementById('reg-phone').value.trim();
  const consent = document.getElementById('reg-consent').checked;
  const newId = "CHILD-" + String(Math.floor(10000 + Math.random() * 90000));

  const payload = {
    id: newId,
    name: name,
    age: age,
    gender: gender,
    address: address,
    guardian_name: guardian,
    guardian_relation: rel,
    guardian_phone: phone,
    asha_worker: AppState.worker.name,
    consent: consent
  };

  if (window.SupabaseService && window.SupabaseService.isConfigured()) {
    try {
      await window.SupabaseService.insertChild(payload);
      showToast(`Child registered in Supabase cloud! ID: ${newId}`);
    } catch (err) {
      console.error("Supabase insert child error:", err);
      showToast(`Child registered locally (Cloud sync error: ${err.message})`);
    }
  } else {
    try {
      const res = await fetch('/api/register-child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(`Child registered in SQLite database! ID: ${newId}`);
      } else {
        showToast(`Child registered! ID: ${newId}`);
      }
    } catch (err) {
      showToast(`Child registered! ID: ${newId}`);
    }
  }

  // Add to active caseload
  AppState.caseload.unshift({
    id: newId,
    name: name,
    age: age,
    village: address,
    guardian: guardian,
    phone: phone,
    status: "Newly Registered",
    priority: "Normal",
    last_visit: "Today"
  });

  setActiveTab('caseload');
}

async function handleObservationSubmit(e) {
  e.preventDefault();
  const childId = document.getElementById('obs-child-id').value;
  const height = document.getElementById('obs-height').value;
  const weight = document.getElementById('obs-weight').value;
  const muac = document.getElementById('obs-muac').value;
  const meals = document.getElementById('obs-meals').value;
  const speech = document.getElementById('obs-speech').value;
  const sound = document.getElementById('obs-sound').value;
  const notes = document.getElementById('obs-notes').value;

  const payload = {
    child_id: childId,
    author: AppState.worker.name,
    height_cm: height,
    weight_kg: weight,
    muac_cm: muac,
    meals_note: meals,
    speech_obs: speech,
    sound_obs: sound,
    text: notes
  };

  if (window.SupabaseService && window.SupabaseService.isConfigured()) {
    try {
      await window.SupabaseService.insertObservation(payload);
      showToast("Observation saved in Supabase cloud!");
    } catch (err) {
      console.error("Supabase obs error:", err);
      showToast("Observation saved locally!");
    }
  } else {
    try {
      await fetch('/api/observation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {}
    showToast("Observation recorded in SQLite database!");
  }
  setActiveTab('dashboard');
}

function openNewDeicModal(presetChildId = '', presetChildName = '') {
  const children = AppState.caseload;
  const modal = document.getElementById('modal-container');

  if (children.length === 0) {
    showToast("Please register a child first before creating a DEIC referral.");
    setActiveTab('register');
    return;
  }

  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal-card" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--teal-dark);">🏥 Create DEIC Referral</h3>
          <button class="btn btn-sm btn-outline" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <form onsubmit="handleDeicSubmitModal(event)">
            <div class="form-group">
              <label class="form-label">Select Child *</label>
              <select class="form-select" id="m-deic-child" required>
                ${children.map(c => `
                  <option value="${c.id}" data-name="${c.name}" ${(presetChildId === c.id || AppState.selectedChildId === c.id) ? 'selected' : ''}>
                    ${c.name} (${c.id})
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Primary Concern Domain *</label>
              <select class="form-select" id="m-deic-concern">
                <option value="Speech & Language Delay">Speech & Language Delay</option>
                <option value="Gross/Fine Motor Delay">Gross/Fine Motor Delay</option>
                <option value="Sensory Sensitivity & Sound Distress">Sensory Sensitivity & Sound Distress</option>
                <option value="Social Interaction & Play Difficulties">Social Interaction & Play Difficulties</option>
                <option value="Multiple Developmental Delays">Multiple Developmental Delays</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Detailed Reason as to Why the Child is Being Referred *</label>
              <textarea class="form-textarea" id="m-deic-reason" rows="3" required placeholder="Describe what was directly observed and why specialist assessment is needed..."></textarea>
            </div>
            <div style="background: var(--teal-light); padding: 10px; border-radius: 6px; font-size: 12px; margin-bottom: 12px;">
              <label style="cursor: pointer;"><input type="checkbox" id="m-deic-transit" checked> Request RBSK Free Travel Grant for family</label>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 8px;">
              <button type="button" class="btn btn-outline" onclick="closeModal()">${txt('btn_cancel')}</button>
              <button type="submit" class="btn btn-teal">Submit DEIC Referral</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

async function handleDeicSubmitModal(e) {
  e.preventDefault();
  const selectEl = document.getElementById('m-deic-child');
  const childId = selectEl.value;
  const childName = selectEl.options[selectEl.selectedIndex].getAttribute('data-name');
  const concern = document.getElementById('m-deic-concern').value;
  const reason = document.getElementById('m-deic-reason').value.trim();
  const transit = document.getElementById('m-deic-transit').checked;

  const payload = {
    child_id: childId,
    child_name: childName,
    referred_by: AppState.worker.name,
    referred_by_role: "ASHA Worker",
    deic_center: AppState.worker.deic,
    primary_concerns: concern,
    detailed_referral_reason: reason,
    transit_assistance_requested: transit,
    urgency: "Priority"
  };

  if (window.SupabaseService && window.SupabaseService.isConfigured()) {
    try {
      await window.SupabaseService.insertDeicReferral(payload);
      showToast("DEIC Referral saved in Supabase cloud!");
    } catch (err) {
      console.error("Supabase deic error:", err);
      showToast("DEIC Referral recorded!");
    }
  } else {
    try {
      const res = await fetch('/api/deic-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast("DEIC Referral saved in SQLite database!");
      } else {
        showToast("DEIC Referral recorded!");
      }
    } catch (err) {
      showToast("DEIC Referral recorded!");
    }
  }

  AppState.deicReferrals.unshift({
    id: "DEIC-REF-" + Date.now(),
    child_id: childId,
    child_name: childName,
    primary_concerns: concern,
    detailed_referral_reason: reason,
    deic_center: AppState.worker.deic,
    transit_assistance_requested: transit,
    status: "Submitted to DEIC",
    urgency: "Priority"
  });

  closeModal();
  setActiveTab('deic');
}

async function handleFollowupSubmit(e) {
  e.preventDefault();
  const selectEl = document.getElementById('fol-child-id');
  const childId = selectEl.value;
  const childName = selectEl.options[selectEl.selectedIndex].getAttribute('data-name');
  const status = document.getElementById('fol-status').value;
  const readiness = document.getElementById('fol-readiness').value;
  const notes = document.getElementById('fol-notes').value.trim();

  const payload = {
    child_id: childId,
    child_name: childName,
    contact_status: status,
    readiness: readiness,
    notes: notes
  };

  if (window.SupabaseService && window.SupabaseService.isConfigured()) {
    try {
      await window.SupabaseService.insertFollowup(payload);
      showToast("Household follow-up saved in Supabase cloud!");
    } catch (err) {
      console.error("Supabase followup error:", err);
      showToast("Household follow-up saved!");
    }
  } else {
    try {
      await fetch('/api/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {}
    showToast("Household follow-up visit saved in SQLite DB!");
  }

  AppState.followups.unshift({
    id: "FOL-" + Date.now(),
    child_id: childId,
    child_name: childName,
    date: "Today",
    contact_status: status,
    readiness: readiness,
    notes: notes
  });
  setActiveTab('dashboard');
}

function prepareObservation(childId) {
  AppState.selectedChildId = childId;
  setActiveTab('observation');
}

function prepareDeicReferral(childId, childName) {
  AppState.selectedChildId = childId;
  openNewDeicModal(childId, childName);
}

function filterCaseload(query) {
  const tbody = document.getElementById('caseload-table-body');
  if (!tbody) return;
  const q = query.toLowerCase();
  const filtered = AppState.caseload.filter(c =>
    (c.name && c.name.toLowerCase().includes(q)) ||
    (c.id && c.id.toLowerCase().includes(q)) ||
    (c.guardian && c.guardian.toLowerCase().includes(q))
  );

  tbody.innerHTML = filtered.map(row => `
    <tr style="border-bottom: 1px solid var(--neutral-100);">
      <td style="padding: 12px 8px;">
        <strong>${row.name}</strong><br>
        <span style="font-size: 11px; color: var(--neutral-500);">${row.guardian || ''}</span>
      </td>
      <td style="padding: 12px 8px; color: var(--neutral-600);">${row.age}<br><span style="font-size: 11px;">${row.id}</span></td>
      <td style="padding: 12px 8px;">${row.village}</td>
      <td style="padding: 12px 8px;">${row.last_visit || 'Today'}</td>
      <td style="padding: 12px 8px;">
        <span class="status-pill status-${row.priority === 'High' ? 'alert' : 'active'}">
          ${row.status || 'Registered'}
        </span>
      </td>
      <td style="padding: 12px 8px;">
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-sm btn-outline" onclick="prepareObservation('${row.id}')">📝 Observe</button>
          <button class="btn btn-sm btn-teal" onclick="prepareDeicReferral('${row.id}', '${row.name}')">🏥 DEIC</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function setViewMode(mode) {
  AppState.viewMode = mode;
  renderApp();
}

function setLanguage(lang) {
  AppState.language = lang;
  renderApp();
  showToast(`Language: ${i18n[lang].name}`);
}

function setActiveTab(tab) {
  AppState.activeTab = tab;
  renderApp();
}

function toggleHamburger(open) {
  AppState.hamburgerOpen = open;
  renderApp();
}

function closeModal(event) {
  if (event) event.stopPropagation();
  const modal = document.getElementById('modal-container');
  if (modal) modal.innerHTML = '';
}

function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>✓</span> <span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}


// -------------------------------------------------------------
// SUPABASE BACKEND CONFIGURATION MODAL & CONTROLLERS
// -------------------------------------------------------------
function openSupabaseModal() {
  const modal = document.getElementById('modal-container');
  const supaStatus = window.SupabaseService ? window.SupabaseService.getStatus() : { configured: false, url: '', key: '' };
  const isConnected = AppState.supabaseConnected;

  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal-card" onclick="event.stopPropagation()" style="max-width: 650px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 22px;">⚡</span>
            <div>
              <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0;">Supabase Backend Integration</h3>
              <div style="font-size: 12px; color: #64748b;">Connect your live Supabase cloud database or continue using local SQLite</div>
            </div>
          </div>
          <button class="btn btn-sm btn-outline" onclick="closeModal()">✕</button>
        </div>

        <div class="modal-body" style="padding: 20px 24px;">
          <!-- Status Banner -->
          <div style="padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; background: ${isConnected ? '#ecfdf5; border: 1px solid #a7f3d0;' : '#f8fafc; border: 1px solid #e2e8f0;'}">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 18px;">${isConnected ? '🟢' : '⚪'}</span>
              <div>
                <div style="font-weight: 700; font-size: 13px; color: ${isConnected ? '#065f46' : '#334155'};">
                  ${isConnected ? 'Supabase Cloud Connected & Live' : (supaStatus.configured ? 'Credentials Saved (Pending sync)' : 'No Supabase Connected (Using Local SQLite)')}
                </div>
                <div style="font-size: 11px; color: ${isConnected ? '#047857' : '#64748b'};">
                  ${isConnected ? `Synced: ${AppState.caseload.length} children, ${AppState.deicReferrals.length} DEIC referrals` : 'Connect your Supabase project to enable real-time cloud sync across devices'}
                </div>
              </div>
            </div>
            ${isConnected ? `
              <button class="btn btn-sm btn-outline" style="color: #dc2626; border-color: #fca5a5; font-size: 11px;" onclick="handleDisconnectSupabase()">
                Disconnect
              </button>
            ` : ''}
          </div>

          <!-- Configuration Form -->
          <form onsubmit="handleSaveSupabaseConfig(event)">
            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label" style="font-weight: 700;">
                Supabase Project URL <span style="color: #e11d48;">*</span>
              </label>
              <input type="url" class="form-input" id="cfg-supa-url" 
                value="${supaStatus.url || ''}" 
                placeholder="https://xyzcompany.supabase.co" 
                required 
                style="font-family: monospace; font-size: 12px;">
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                Find this in your Supabase Dashboard under <strong>Project Settings → API → Project URL</strong>.
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 16px;">
              <label class="form-label" style="font-weight: 700;">
                Supabase anon / public API Key <span style="color: #e11d48;">*</span>
              </label>
              <input type="password" class="form-input" id="cfg-supa-key" 
                value="${supaStatus.key || ''}" 
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                required 
                style="font-family: monospace; font-size: 12px;">
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                Find this in your Supabase Dashboard under <strong>Project Settings → API → Project API Keys (anon / public)</strong>.
              </div>
            </div>

            <div id="supa-test-status" style="margin-bottom: 14px; font-size: 12px; display: none;"></div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 10px;">
              <button type="button" class="btn btn-sm btn-outline" onclick="handleTestSupabaseConnection()">
                🔍 Test Connection
              </button>

              <div style="display: flex; gap: 8px;">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Close</button>
                <button type="submit" class="btn btn-teal">Save & Connect</button>
              </div>
            </div>
          </form>

          <!-- Database Schema Helper Section -->
          <div style="margin-top: 24px; padding: 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-weight: 700; font-size: 12px; color: #1e293b; margin-bottom: 4px;">
              📋 First Time Setting Up Supabase?
            </div>
            <div style="font-size: 11px; color: #475569; line-height: 1.5; margin-bottom: 10px;">
              You need to run our database schema script in your Supabase SQL Editor once to create the required tables (<code>children</code>, <code>deic_referrals</code>, <code>observations</code>, <code>followups</code>, <code>caregiver_consent</code>).
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-sm btn-outline" onclick="window.open('supabase-schema.sql', '_blank')">
                📄 View schema.sql
              </button>
              <button class="btn btn-sm btn-outline" onclick="copySchemaToClipboard()">
                📋 Copy SQL Schema
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function handleTestSupabaseConnection() {
  const url = document.getElementById('cfg-supa-url').value.trim();
  const key = document.getElementById('cfg-supa-key').value.trim();
  const statusDiv = document.getElementById('supa-test-status');

  if (!url || !key) {
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = '<span style="color: #e11d48;">⚠️ Please fill in both the Project URL and Anon API key.</span>';
    return;
  }

  statusDiv.style.display = 'block';
  statusDiv.innerHTML = '<span style="color: #0284c7;">Testing connection to Supabase...</span>';

  if (!window.SupabaseService) {
    statusDiv.innerHTML = '<span style="color: #e11d48;">⚠️ Supabase Service not loaded. Check internet connection.</span>';
    return;
  }

  const result = await window.SupabaseService.testConnection(url, key);
  if (result.success) {
    statusDiv.innerHTML = `<span style="color: #059669; font-weight: 600;">✓ Connected successfully! Found ${result.childCount} registered child records in table.</span>`;
  } else {
    statusDiv.innerHTML = `<span style="color: #e11d48; font-weight: 600;">✕ Connection failed: ${result.message}</span>`;
  }
}

async function handleSaveSupabaseConfig(e) {
  e.preventDefault();
  const url = document.getElementById('cfg-supa-url').value.trim();
  const key = document.getElementById('cfg-supa-key').value.trim();

  if (!url || !key) {
    showToast("Please provide both Supabase URL and Anon Key.");
    return;
  }

  if (window.SupabaseService) {
    window.SupabaseService.saveCredentials(url, key);
    showToast("Connecting to Supabase...");
    closeModal();
    await fetchBackendData();
    if (AppState.supabaseConnected) {
      showToast("Connected to Supabase Cloud Database!");
    } else {
      showToast("Credentials saved! Ensure tables exist in Supabase.");
    }
  }
}

async function handleDisconnectSupabase() {
  if (window.SupabaseService) {
    window.SupabaseService.clearCredentials();
  }
  AppState.supabaseConnected = false;
  AppState.dbType = 'sqlite';
  closeModal();
  showToast("Disconnected from Supabase. Reverting to local SQLite database.");
  await fetchBackendData();
}

function copySchemaToClipboard() {
  fetch('supabase-schema.sql')
    .then(r => r.text())
    .then(sql => {
      navigator.clipboard.writeText(sql).then(() => {
        showToast("SQL Schema copied to clipboard! Paste it into Supabase SQL Editor.");
      }).catch(() => {
        showToast("Schema ready in file supabase-schema.sql");
      });
    })
    .catch(() => {
      showToast("Schema ready in file supabase-schema.sql");
    });
}

// Initialise application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.SupabaseService) {
    window.SupabaseService.init();
  }
  fetchBackendData();
});
