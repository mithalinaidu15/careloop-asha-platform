auth_views_code = """
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
"""

with open('app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Place the auth views code right above renderDashboardView()
anchor = "// SCREEN A1: FIELD DASHBOARD (CLEAN & DYNAMIC)"
assert anchor in code, "anchor not found"

code = code.replace(anchor, auth_views_code + "\n// -------------------------------------------------------------\n" + anchor, 1)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Part 2 of app.js patch complete!")
