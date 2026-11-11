// ==============================================================================
// CareLoop ASHA Platform - Supabase Client & Data Synchronization Service
// ==============================================================================

const SupabaseService = (function() {
  let client = null;
  let status = {
    configured: false,
    connected: false,
    lastError: null,
    url: '',
    key: ''
  };

  function getStoredCredentials() {
    const configUrl = (window.CARELOOP_SUPABASE_CONFIG && window.CARELOOP_SUPABASE_CONFIG.url) || '';
    const configKey = (window.CARELOOP_SUPABASE_CONFIG && window.CARELOOP_SUPABASE_CONFIG.anonKey) || '';
    const url = configUrl.trim() || localStorage.getItem('careloop_supabase_url') || '';
    const key = configKey.trim() || localStorage.getItem('careloop_supabase_anon_key') || '';
    return { url: url.trim(), key: key.trim() };
  }

  function init() {
    const { url, key } = getStoredCredentials();
    status.url = url;
    status.key = key;

    if (url && key && window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        client = window.supabase.createClient(url, key);
        status.configured = true;
        console.log("Supabase client initialized for:", url);
      } catch (err) {
        console.error("Failed to initialize Supabase client:", err);
        status.lastError = err.message;
        client = null;
        status.configured = false;
      }
    } else {
      client = null;
      status.configured = false;
    }
    return client;
  }

  async function testConnection(customUrl, customKey) {
    const testUrl = (customUrl || status.url).trim();
    const testKey = (customKey || status.key).trim();

    if (!testUrl || !testKey) {
      return { success: false, message: "Project URL and Anon API Key are required." };
    }
    if (!window.supabase) {
      return { success: false, message: "Supabase JS library not loaded." };
    }

    try {
      const tempClient = window.supabase.createClient(testUrl, testKey);
      const { data, error, count } = await tempClient
        .from('children')
        .select('id', { count: 'exact', head: true });

      if (error) {
        return { 
          success: false, 
          message: `Database error: ${error.message}. (Ensure you have executed the schema.sql script in your Supabase SQL Editor)` 
        };
      }

      return { 
        success: true, 
        message: "Successfully connected to Supabase!",
        childCount: count || 0
      };
    } catch (err) {
      return { success: false, message: err.message || "Failed to connect to Supabase." };
    }
  }

  function saveCredentials(url, key) {
    localStorage.setItem('careloop_supabase_url', url.trim());
    localStorage.setItem('careloop_supabase_anon_key', key.trim());
    if (window.CARELOOP_SUPABASE_CONFIG) {
      window.CARELOOP_SUPABASE_CONFIG.url = url.trim();
      window.CARELOOP_SUPABASE_CONFIG.anonKey = key.trim();
    }
    init();
  }

  function clearCredentials() {
    localStorage.removeItem('careloop_supabase_url');
    localStorage.removeItem('careloop_supabase_anon_key');
    if (window.CARELOOP_SUPABASE_CONFIG) {
      window.CARELOOP_SUPABASE_CONFIG.url = '';
      window.CARELOOP_SUPABASE_CONFIG.anonKey = '';
    }
    client = null;
    status.configured = false;
    status.connected = false;
    status.url = '';
    status.key = '';
  }

  // --- Remote Queries ---

  async function fetchCaseload() {
    if (!client) return null;
    const { data, error } = await client
      .from('children')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Supabase fetchCaseload error:", error);
      status.lastError = error.message;
      return null;
    }
    status.connected = true;
    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      age: row.age,
      village: row.address,
      guardian: row.guardian_name,
      phone: row.guardian_phone,
      last_visit: 'Recently',
      status: row.status_text || 'Active',
      priority: 'Normal'
    }));
  }

  async function fetchReferrals() {
    if (!client) return null;
    const { data, error } = await client
      .from('deic_referrals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase fetchReferrals error:", error);
      return null;
    }
    return data || [];
  }

  async function fetchFollowups() {
    if (!client) return null;
    const { data, error } = await client
      .from('followups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase fetchFollowups error:", error);
      return null;
    }
    return data || [];
  }

  // --- Remote Insertions ---

  async function insertChild(payload) {
    if (!client) return null;
    const childRow = {
      id: payload.id,
      name: payload.name,
      age: payload.age,
      dob: payload.dob || null,
      gender: payload.gender || 'Unknown',
      address: payload.address,
      guardian_name: payload.guardian_name,
      guardian_relation: payload.guardian_relation || 'Parent',
      guardian_phone: payload.guardian_phone,
      asha_worker: payload.asha_worker,
      assigned_facility: payload.assigned_facility || 'Local PHC',
      current_stage: 1,
      status_text: 'Newly Registered'
    };

    const { error: childErr } = await client
      .from('children')
      .insert([childRow]);

    if (childErr) {
      console.error("Supabase insert child error:", childErr);
      throw childErr;
    }

    // Insert consent if provided
    if (payload.consent) {
      const consentRow = {
        child_id: payload.id,
        guardian_name: payload.guardian_name,
        relationship: payload.guardian_relation || 'Parent',
        consent_screening: true,
        consent_data_sharing: true,
        consent_deic_referral: true,
        consent_followup: true,
        signature_type: payload.consent.signature_type || 'Digital Thumb / Verbal Consent',
        verified_mobile: payload.guardian_phone
      };
      await client.from('caregiver_consent').insert([consentRow]);
    }

    return true;
  }

  async function insertObservation(payload) {
    if (!client) return null;
    const obsRow = {
      child_id: payload.child_id,
      date: new Date().toISOString().split('T')[0],
      author: payload.author,
      role: 'ASHA Facilitator',
      height_cm: payload.height_cm ? parseFloat(payload.height_cm) : null,
      weight_kg: payload.weight_kg ? parseFloat(payload.weight_kg) : null,
      muac_cm: payload.muac_cm ? parseFloat(payload.muac_cm) : null,
      meals_note: payload.meals_note || '',
      speech_obs: payload.speech_obs || '',
      sound_obs: payload.sound_obs || '',
      text: payload.text || 'Routine milestone screening'
    };

    const { error } = await client.from('observations').insert([obsRow]);
    if (error) {
      console.error("Supabase insert observation error:", error);
      throw error;
    }
    return true;
  }

  async function insertDeicReferral(payload) {
    if (!client) return null;
    const refRow = {
      id: payload.id || ('DEIC-REF-' + Date.now()),
      child_id: payload.child_id,
      child_name: payload.child_name,
      referred_by: payload.referred_by,
      referred_by_role: payload.referred_by_role || 'ASHA Worker',
      deic_center: payload.deic_center,
      target_specialties: payload.target_specialties || payload.primary_concerns,
      primary_concerns: payload.primary_concerns,
      detailed_referral_reason: payload.detailed_referral_reason,
      urgency: payload.urgency || 'Priority',
      transit_assistance_requested: !!payload.transit_assistance_requested,
      status: 'Submitted to DEIC'
    };

    const { error } = await client.from('deic_referrals').insert([refRow]);
    if (error) {
      console.error("Supabase insert referral error:", error);
      throw error;
    }
    return true;
  }

  async function insertFollowup(payload) {
    if (!client) return null;
    const folRow = {
      child_id: payload.child_id,
      child_name: payload.child_name,
      contact_status: payload.contact_status,
      readiness: payload.readiness,
      notes: payload.notes || ''
    };

    const { error } = await client.from('followups').insert([folRow]);
    if (error) {
      console.error("Supabase insert followup error:", error);
      throw error;
    }
    return true;
  }

  return {
    init,
    getClient: () => client,
    getStatus: () => ({ ...status }),
    isConfigured: () => status.configured && client !== null,
    testConnection,
    saveCredentials,
    clearCredentials,
    fetchCaseload,
    fetchReferrals,
    fetchFollowups,
    insertChild,
    insertObservation,
    insertDeicReferral,
    insertFollowup
  };
})();

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  window.SupabaseService = SupabaseService;
}
