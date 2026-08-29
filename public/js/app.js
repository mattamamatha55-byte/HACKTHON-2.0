/**
 * RaaituSeva — Smart Farming Assistant
 * Main Application Controller
 * Features:
 * - Live Satellite Weather Sync with Open-Meteo
 * - Authentic 10-Crop Disease Diagnostics & Reference Visuals
 * - Accurate Visual Crop Library Navigation (Tomato, Chilli, Rice, Cotton, Groundnut, Maize, Banana, Mango, Coconut)
 * - Canvas-based Leaf Image Health Analysis
 * - Bilingual Voice Synthesis & Telugu/English i18n
 */

/* =============================================
   APP STATE
   ============================================= */
let selectedPresetKey = 'tomato_blight';
let selectedFile = null;
let selectedCropFilter = 'Tomato';
let currentDistrict = 'guntur';
let lastScanResult = null; // Cache for seamless language toggle
let currentUserProfile = null; // Farmer Digital Profile state
let isFarmerEasyMode = localStorage.getItem('raaitu_easy_mode') === 'true'; // Low-literacy Farmer Voice Mode state

/* =============================================
   DOM READY — INITIALIZATION
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  // 0. Initialize Farmer Easy Mode State
  if (isFarmerEasyMode) {
    document.body.classList.add('farmer-easy-mode');
    const btn = document.getElementById('easyModeToggleBtn');
    if (btn) btn.classList.add('active');
  }

  // 1. Load Farmer Digital Profile
  loadUserProfile();

  // 2. Fetch Real-time Live Weather
  loadWeatherData(currentDistrict);

  // 3. Initialize Dashboard Visual Charts
  if (window.ChartsManager) {
    window.ChartsManager.initDashboardCharts();
  }

  // 4. Load Pest Alerts Feed
  loadPestAlerts();

  // 5. Run initial scan to populate report
  runDiseaseScan();

  // 6. Accessible keyboard navigation for interactive cards
  document.querySelectorAll('.crop-card-item, .feature-card').forEach(el => {
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });
});

/* =============================================
   SPA TAB ROUTING
   ============================================= */
function showTab(tabId) {
  // Hide all pages
  document.querySelectorAll('.tab-page').forEach(page => page.classList.remove('active'));

  // Show target
  const targetPage = document.getElementById(tabId);
  if (targetPage) targetPage.classList.add('active');

  // Update desktop nav
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  const desktopNav = document.getElementById(`nav-${tabId}`);
  if (desktopNav) desktopNav.classList.add('active');

  // Update mobile bottom nav
  document.querySelectorAll('.mob-nav-item').forEach(item => item.classList.remove('active'));
  const mobileNav = document.getElementById(`mob-nav-${tabId}`);
  if (mobileNav) mobileNav.classList.add('active');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Re-render charts when entering relevant tabs
  if (tabId === 'dashboard' && window.ChartsManager) {
    setTimeout(() => window.ChartsManager.initDashboardCharts(), 120);
  }
  if (tabId === 'soil-health' && window.ChartsManager) {
    setTimeout(() => {
      const N = parseFloat(document.getElementById('soilN').value) || 180;
      const P = parseFloat(document.getElementById('soilP').value) || 18;
      const K = parseFloat(document.getElementById('soilK').value) || 140;
      window.ChartsManager.updateSoilNPKChart(N, P, K);
    }, 120);
  }
  if (tabId === 'user-profile') {
    renderUserProfile();
  }
  if (tabId === 'mandi') {
    renderMandiMarket();
  }

  // Low-Literacy Farmer Easy Mode: Auto-Speech Narration
  if (isFarmerEasyMode) {
    const lang = (window.i18n && window.i18n.currentLang) || 'en';
    if (tabId === 'weather') {
      setTimeout(listenToWeather, 300);
    } else if (tabId === 'irrigation') {
      setTimeout(listenToIrrigation, 300);
    } else if (tabId === 'soil-health') {
      setTimeout(listenToSoil, 300);
    } else if (tabId === 'disease-detection') {
      const promptMap = {
        te: "పంట రోగ స్కానర్. మీ కెమెరాతో జబ్బుపడిన ఆకు ఫోటో తీయండి లేదా పంటను ఎంచుకోండి.",
        hi: "फसल रोग स्कैनर। कैमरे से बीमार पत्ते का फोटो लें या नमूना चुनें।",
        ta: "பயிர் நோய் ஸ்கேனர். பாதிக்கப்பட்ட இலையை படம் பிடிக்கவும்.",
        kn: "ಬೆಳೆ ರೋಗ ಸ್ಕ್ಯಾನರ್. ರೋಗಪೀಡಿತ ಎಲೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ.",
        en: "Crop Disease Scanner. Point your camera at a sick leaf or select a sample."
      };
      speakText(promptMap[lang] || promptMap.en, lang);
    }
  }
}

/* =============================================
   FARMER EASY VOICE & VISUAL MODE TOGGLE
   ============================================= */
function toggleFarmerEasyMode() {
  isFarmerEasyMode = !isFarmerEasyMode;
  localStorage.setItem('raaitu_easy_mode', isFarmerEasyMode ? 'true' : 'false');
  document.body.classList.toggle('farmer-easy-mode', isFarmerEasyMode);

  const btn = document.getElementById('easyModeToggleBtn');
  if (btn) btn.classList.toggle('active', isFarmerEasyMode);

  const lang = (window.i18n && window.i18n.currentLang) || 'en';
  if (isFarmerEasyMode) {
    showToast(window.i18n.t('easyModeEnabled') || "Farmer Easy Voice Mode Enabled!", "success");
    const voiceMsg = {
      te: "రైతు సులభ ఆడియో మోడ్ ఆన్ చేయబడింది. మీకు ఏ సమాచారం కావాలన్నా స్క్రీన్‌పై తాకండి లేదా మైక్ బటన్ నొక్కి మాట్లాడండి.",
      hi: "किसान सरल मोड सक्रिय किया गया। अब स्क्रीन पर मुख्य जानकारी बोलकर सुनाई जाएगी।",
      ta: "எளிய உழவர் முறை இயக்கப்பட்டது. அனைத்து தகவல்களும் குரல் வழியாக கேட்கலாம்.",
      kn: "ರೈತ ಸುಲಭ ಮೋಡ್ ಆನ್ ಆಗಿದೆ. ಪ್ರತಿಯೊಂದು ಮಾಹಿತಿ ಧ್ವನಿಯ ಮೂಲಕ ಕೇಳಿಸುತ್ತದೆ.",
      en: "Farmer Easy Voice Mode Activated. Audio will automatically read out key farm advisories."
    };
    speakText(voiceMsg[lang] || voiceMsg.en, lang);
  } else {
    showToast(window.i18n.t('easyModeDisabled') || "Farmer Easy Mode Deactivated.", "warning");
  }
}

/* =============================================
   MULTI-LANGUAGE CONTROLLER (5 Indian Languages)
   ============================================= */
function changeLanguage(newLang) {
  window.i18n.setLanguage(newLang);

  // Sync dropdown values across top navigation and AI voice modal
  const langSelect = document.getElementById('langSelect');
  if (langSelect) langSelect.value = newLang;
  const aiVoiceLangSelect = document.getElementById('aiVoiceLangSelect');
  if (aiVoiceLangSelect) aiVoiceLangSelect.value = newLang;

  // Refresh live weather text & pest alerts in the new language
  loadWeatherData(currentDistrict);
  loadPestAlerts();

  // Re-render disease scan result in updated language
  if (lastScanResult) {
    renderScanResult(lastScanResult);
  }

  // Re-render soil recommendations in updated language
  const fertList = document.getElementById('fertRecList');
  if (fertList && window._lastSoilAnalysis) {
    const isTe = newLang === 'te';
    const isHi = newLang === 'hi';
    let recs = window._lastSoilAnalysis.recommendationsEn;
    if (isTe) recs = window._lastSoilAnalysis.recommendationsTe;
    fertList.innerHTML = recs.map(r => `<li>${r}</li>`).join('');
  }

  // Refresh AI welcome message in chat drawer
  const aiWelcomeEl = document.querySelector('#aiChatMessages .chat-bubble.ai p');
  if (aiWelcomeEl) {
    aiWelcomeEl.textContent = window.i18n.t('aiWelcomeMsg') || "Hello Farmer! I am your AI Agronomist.";
  }

  // Re-render Farmer Profile in updated language
  if (currentUserProfile) {
    renderUserProfile();
  }

  // Re-render Mandi prices in updated language
  const mandiGrid = document.getElementById('mandiCardsGrid');
  if (mandiGrid) {
    const crop = document.getElementById('mandiCropFilterSelect')?.value || 'all';
    const yard = document.getElementById('mandiYardFilterSelect')?.value || 'all';
    renderMandiMarket(crop, yard);
  }
}

function toggleLanguage() {
  const langKeys = Object.keys(window.i18n.LANGUAGES || { en: 1, te: 1, hi: 1, ta: 1, kn: 1 });
  const currentIndex = langKeys.indexOf(window.i18n.currentLang);
  const nextLang = langKeys[(currentIndex + 1) % langKeys.length];
  changeLanguage(nextLang);
}

/* =============================================
   LIVE SATELLITE WEATHER MODULE
   ============================================= */
async function loadWeatherData(district) {
  currentDistrict = district;
  const isTe = window.i18n.currentLang === 'te';

  // Show live status badge
  const tickerBadge = document.querySelector('.ticker-badge');
  if (tickerBadge) {
    tickerBadge.innerHTML = `<span style="display:inline-block; width:8px; height:8px; background:#22c55e; border-radius:50%; margin-right:4px; animation: pulse 1.5s infinite;"></span> ${isTe ? 'ప్రత్యక్ష ఉపగ్రహ డేటా' : 'LIVE SATELLITE DATA'}`;
  }

  const data = await window.ApiService.getWeather(district);

  // Update Current Weather UI
  safeSetText('wxTemp', `${data.temp}°C`);
  safeSetText('wxCondition', data.condition);
  safeSetText('wxDistrict', `${data.district}, ${data.state}`);
  safeSetText('wxHumidity', `${data.humidity}%`);
  safeSetText('wxWind', `${data.wind} km/h`);
  safeSetText('wxRain', `${data.rainProb}%`);

  // Advisory Summary
  const advSummary = isTe
    ? (data.advisory.te.split('.')[0] + '.')
    : (data.advisory.en.split('.')[0] + '.');
  safeSetText('wxAdviceSummary', advSummary);
  safeSetText('wxAdvisoryText', isTe ? data.advisory.te : data.advisory.en);

  // Quick Ticker Bar
  safeSetText('tickerTemp', `${data.temp}°C — ${data.district}`);
  safeSetText('tickerHumidity', isTe ? `తేమ: ${data.humidity}%` : `Humidity: ${data.humidity}%`);
  safeSetText('tickerRain', isTe ? `వర్ష సూచన: ${data.rainProb}%` : `Rain Prob: ${data.rainProb}%`);

  // Update Dynamic Weather Photo
  const wxBg = document.getElementById('wxHeroBg');
  if (wxBg) {
    const condition = data.condition.toLowerCase();
    if (condition.includes('rain') || condition.includes('వర్షం') || condition.includes('జల్లులు')) {
      wxBg.src = 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1200&q=80';
    } else if (condition.includes('cloud') || condition.includes('మేఘావృతం') || condition.includes('overcast')) {
      wxBg.src = 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80';
    } else if (data.temp >= 35) {
      wxBg.src = 'https://images.unsplash.com/photo-1504608524841-42584120d693?auto=format&fit=crop&w=1200&q=80';
    } else {
      wxBg.src = 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=1200&q=80';
    }
  }

  // 5-Day Forecast Grid
  const forecastContainer = document.getElementById('forecastContainer');
  if (forecastContainer && data.forecast) {
    forecastContainer.innerHTML = data.forecast.map(item => `
      <div class="forecast-card">
        <h4 style="color: var(--primary-dark); font-size: 0.9rem; font-weight:700;">${item.day}</h4>
        <div style="font-size: 1.45rem; font-weight: 800; color: var(--primary-green); margin: 6px 0;">${item.temp}</div>
        <p style="font-size: 0.78rem; color: var(--text-muted);">🌧️ ${item.rain}</p>
        <p style="font-size: 0.78rem; font-weight: 700; color: var(--primary-dark); margin-top: 4px;">${item.status}</p>
      </div>
    `).join('');
  }
}

function handleDistrictChange(val) {
  loadWeatherData(val);
}

/* =============================================
   DISEASE SCANNER — PRESET & CROP SELECTOR
   ============================================= */
function handlePresetClick(chipEl, presetKey) {
  selectedPresetKey = presetKey;
  selectedFile = null;

  // Unselect other preset chips
  document.querySelectorAll('.preset-chip').forEach(chip => chip.classList.remove('active'));

  if (chipEl) {
    chipEl.classList.add('active');
  }

  // Update crop select dropdown to match
  const db = window.CROP_DISEASE_DATABASE;
  if (db && db[presetKey]) {
    const cropSelector = document.getElementById('scannerCropSelect');
    if (cropSelector) cropSelector.value = db[presetKey].cropKey || 'Tomato';
  }

  // Hide file preview box
  const previewBox = document.getElementById('imagePreviewBox');
  if (previewBox) previewBox.style.display = 'none';

  runDiseaseScan();
}

function handleScannerCropChange(cropVal) {
  selectedCropFilter = cropVal;
  const mappedKey = window.CROP_NAME_TO_PRESET[cropVal] || 'tomato_blight';
  selectedPresetKey = mappedKey;

  // Highlight corresponding chip if visible
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.key === mappedKey);
  });

  runDiseaseScan();
}

/* =============================================
   FILE UPLOAD & CAMERA CAPTURE HANDLER
   ============================================= */
function handleFileSelect(evt) {
  const file = evt.target.files[0];
  if (!file) return;

  selectedFile = file;
  selectedPresetKey = null;

  const reader = new FileReader();
  reader.onload = function(e) {
    const preview = document.getElementById('uploadedPreview');
    const nameEl  = document.getElementById('fileNameText');
    const box     = document.getElementById('imagePreviewBox');
    if (preview) preview.src = e.target.result;
    if (nameEl)  nameEl.textContent = `📷 ${file.name} (${Math.round(file.size / 1024)} KB)`;
    if (box)     box.style.display = 'block';
  };
  reader.readAsDataURL(file);

  // Unselect preset chips
  document.querySelectorAll('.preset-chip').forEach(chip => chip.classList.remove('active'));

  // Run AI pixel analysis
  runDiseaseScan();
}

/* =============================================
   DISEASE SCAN — MAIN EXECUTION
   ============================================= */
async function runDiseaseScan() {
  const loader        = document.getElementById('scanLoader');
  const reportContent = document.getElementById('reportContent');

  if (loader)        loader.style.display = 'block';
  if (reportContent) reportContent.style.opacity = '0.25';

  const cropDropdown = document.getElementById('scannerCropSelect');
  const cropHint = cropDropdown ? cropDropdown.value : selectedCropFilter;

  const detection = await window.ApiService.detectDisease(selectedPresetKey, selectedFile, cropHint);
  lastScanResult = detection;

  if (loader)        loader.style.display = 'none';
  if (reportContent) reportContent.style.opacity = '1';

  renderScanResult(detection);
}

function getLocalizedDiseaseField(detection, fieldPrefix) {
  if (!detection) return '';
  const lang = (window.i18n && window.i18n.currentLang) || 'en';
  const langCap = lang.charAt(0).toUpperCase() + lang.slice(1);
  return detection[fieldPrefix + langCap] || detection[fieldPrefix + 'Te'] || detection[fieldPrefix + 'En'] || '';
}

function getLocalizedSymptoms(detection) {
  if (!detection) return [];
  const lang = (window.i18n && window.i18n.currentLang) || 'en';
  const langCap = lang.charAt(0).toUpperCase() + lang.slice(1);
  return detection['symptoms' + langCap] || detection['symptomsTe'] || detection['symptomsEn'] || [];
}

function renderScanResult(detection) {
  if (!detection) return;
  const lang = (window.i18n && window.i18n.currentLang) || 'en';

  safeSetText('resCropName', detection.crop);
  safeSetText('resDiseaseName', getLocalizedDiseaseField(detection, 'disease'));
  safeSetText('resConfidence', `${detection.confidence}%`);

  const badge = document.getElementById('severityBadge');
  if (badge) {
    const sevMap = {
      te: { High: 'తీవ్రమైన ప్రమాదం', Medium: 'మధ్యస్థ ప్రమాదం', None: 'ఆరోగ్యకరం' },
      hi: { High: 'उच्च जोखिम (गंभीर)', Medium: 'मध्यम जोखिम', None: 'स्वस्थ' },
      ta: { High: 'அதிக ஆபத்து', Medium: 'நடுத்தர ஆபத்து', None: 'ஆரோக்கியமானது' },
      kn: { High: 'ಹೆಚ್ಚಿನ ಅಪಾಯ', Medium: 'ಮಧ್ಯಮ ಅಪಾಯ', None: 'ಆರೋಗ್ಯಕರ' },
      en: { High: 'High Severity', Medium: 'Medium Severity', None: 'Healthy (No Risk)' }
    };
    const langDict = sevMap[lang] || sevMap.en;
    badge.textContent = langDict[detection.severity] || `${detection.severity} Severity`;
    badge.className = `severity-badge ${detection.severity}`;
  }

  // Analyzed Leaf Damage Area
  const damageRow = document.getElementById('resDamageRow');
  const damageVal = document.getElementById('resDamageVal');
  if (damageRow && damageVal) {
    if (detection.analyzedSurfaceDamage) {
      damageRow.style.display = 'block';
      damageVal.textContent = detection.analyzedSurfaceDamage;
    } else {
      damageRow.style.display = 'none';
    }
  }

  // Update Comparison Images (Your Photo vs Official Reference Photo)
  const refImg = document.getElementById('resRefImg');
  const farmerImg = document.getElementById('resFarmerImg');

  const refUrl = detection.referenceImage || "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=600&q=80";
  if (refImg) refImg.src = refUrl;

  if (farmerImg) {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = e => { 
        farmerImg.src = e.target.result;
        drawLesionOverlay();
      };
      reader.readAsDataURL(selectedFile);

      // Auto-sync crop dropdown to detected crop
      if (detection.cropKey) {
        const cropDropdown = document.getElementById('scannerCropSelect');
        if (cropDropdown) cropDropdown.value = detection.cropKey;
      }
    } else {
      farmerImg.src = refUrl;
      drawLesionOverlay();
    }
  }

  // Symptoms List
  const symptomsList = document.getElementById('resSymptomsList');
  if (symptomsList) {
    const symptoms = getLocalizedSymptoms(detection);
    symptomsList.innerHTML = (symptoms || []).map(s => `<li>${s}</li>`).join('');
  }

  safeSetText('resOrganicRemedy', getLocalizedDiseaseField(detection, 'organicRemedy'));
  safeSetText('resChemicalRemedy', getLocalizedDiseaseField(detection, 'chemicalRemedy'));
}

/* =============================================
   VISUAL CROP LIBRARY & CATEGORY FILTER
   Full support for all Fruits, Vegetables, Flowers, Grains, Cash Crops
   ============================================= */
function filterCropLib(category, buttonEl) {
  // Update active button
  document.querySelectorAll('.crop-cat-btn').forEach(btn => btn.classList.remove('active'));
  if (buttonEl) buttonEl.classList.add('active');

  const items = document.querySelectorAll('#cropLibGrid .crop-card-item');
  items.forEach(item => {
    if (category === 'all' || item.dataset.category === category) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });

  if (isFarmerEasyMode) {
    const lang = (window.i18n && window.i18n.currentLang) || 'en';
    const catSpeechMap = {
      all: { te: "అన్ని పంటల జాబితా", hi: "सभी फसलों की सूची", en: "Showing all crops" },
      vegetable: { te: "కూరగాయల పంటలు: టమాటా, బంగాళాదుంప, మిర్చి, వంకాయ, బెండకాయ, ఉల్లిపాయ", hi: "सब्जियों की फसलें: टमाटर, आलू, मिर्च, बैंगन, भिंडी, प्याज", en: "Showing Vegetables: Tomato, Potato, Chilli, Brinjal, Okra, Onion" },
      fruit: { te: "పండ్ల తోటలు: మామిడి, అరటి, బొప్పాయి, దానిమ్మ, నిమ్మ, కొబ్బరి", hi: "फलों के बाग: आम, केला, पपीता, अनार, नींबू, नारियल", en: "Showing Fruits: Mango, Banana, Papaya, Pomegranate, Citrus, Coconut" },
      flower: { te: "పూల తోటలు: బంతిపూలు, గులాబీ", hi: "फूलों की खेती: गेंदा, गुलाब", en: "Showing Flowers: Marigold, Rose" },
      grain: { te: "ధాన్యాలు & పప్పులు: వరి, మొక్కజొన్న, వేరుశనగ", hi: "अनाज व दालें: धान, मक्का, मूंगफली", en: "Showing Grains & Pulses: Rice, Maize, Groundnut" },
      cash: { te: "వాణిజ్య & సుగంధ పంటలు: పత్తి, చెరకు, పసుపు, అల్లం", hi: "नकदी फसलें: कपास, गन्ना, हल्दी, अदरक", en: "Showing Cash Crops: Cotton, Sugarcane, Turmeric" }
    };
    const speechText = (catSpeechMap[category] && (catSpeechMap[category][lang] || catSpeechMap[category].en)) || "Filtering crops";
    speakText(speechText, lang);
  }
}

function selectCropFromLib(cropName) {
  const cropToPreset = window.CROP_NAME_TO_PRESET || {
    'Tomato': 'tomato_blight',
    'Potato': 'potato_blight',
    'Chilli': 'chilli_thrips',
    'Brinjal': 'brinjal_borer',
    'Okra': 'okra_yellow_vein',
    'Onion': 'onion_purple_blotch',
    'Rice': 'rice_blast',
    'Cotton': 'cotton_bacterial',
    'Groundnut': 'groundnut_tikka',
    'Maize': 'maize_armyworm',
    'Banana': 'banana_sigatoka',
    'Mango': 'mango_anthracnose',
    'Papaya': 'papaya_ringspot',
    'Pomegranate': 'pomegranate_bacterial',
    'Citrus': 'citrus_canker',
    'Marigold': 'marigold_leaf_spot',
    'Rose': 'rose_black_spot',
    'Sugarcane': 'sugarcane_red_rot',
    'Turmeric': 'turmeric_rhizome_rot',
    'Coconut': 'coconut_bud_rot'
  };

  const targetPreset = cropToPreset[cropName] || 'tomato_blight';
  selectedPresetKey = targetPreset;
  selectedFile = null;
  selectedCropFilter = cropName;

  showTab('disease-detection');

  // Sync scanner crop selector dropdown
  const cropSelect = document.getElementById('scannerCropSelect');
  if (cropSelect) cropSelect.value = cropName;

  // Highlight active preset chip
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.key === targetPreset);
  });

  runDiseaseScan();
}

/* =============================================
   IRRIGATION CALCULATOR
   ============================================= */
async function handleIrrigationSubmit(evt) {
  evt.preventDefault();
  const crop        = document.getElementById('irrCrop').value;
  const soilType    = document.getElementById('irrSoil').value;
  const growthStage = document.getElementById('irrStage').value;
  const acres       = document.getElementById('irrAcres').value;

  const submitBtn = evt.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:3px;margin:0;"></span> Calculating...';
  }

  const res = await window.ApiService.calculateIrrigation({ crop, soilType, growthStage, acres });

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-calculator"></i> <span>Calculate Water Needed</span>';
  }

  safeSetText('resWaterVal', `${res.totalWaterLiters.toLocaleString()} L`);
  safeSetText('resPumpVal',  `${res.pumpRuntimeHours} Hrs`);
  safeSetText('resDripScheduleText', res.dripSchedule);

  // Visual Tractor Tanker Metric for Low-Literacy Farmers
  const tankersCount = (res.totalWaterLiters / 5000).toFixed(1);
  safeSetText('resTankerVal', `${tankersCount} Tractor Tankers (${res.totalWaterLiters.toLocaleString()} L)`);

  const resultCard = document.getElementById('irrigationResultCard');
  if (resultCard) {
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (isFarmerEasyMode) {
    setTimeout(listenToIrrigation, 250);
  }
}

/* =============================================
   SOIL HEALTH ANALYSIS
   ============================================= */
function applySoilPreset(clickedEl, n, p, k, ph) {
  safeSetValue('soilN', n);
  safeSetValue('soilP', p);
  safeSetValue('soilK', k);
  safeSetValue('soilPH', ph);

  document.querySelectorAll('.soil-card-item').forEach(card => card.classList.remove('active'));
  if (clickedEl) clickedEl.classList.add('active');

  handleSoilSubmit(new Event('submit'));
}

async function handleSoilSubmit(evt) {
  if (evt && evt.preventDefault) evt.preventDefault();

  const nitrogen   = document.getElementById('soilN').value;
  const phosphorus = document.getElementById('soilP').value;
  const potassium  = document.getElementById('soilK').value;
  const ph         = document.getElementById('soilPH').value;

  const analysis = await window.ApiService.analyzeSoil({ nitrogen, phosphorus, potassium, ph });
  window._lastSoilAnalysis = analysis;

  const isTe = window.i18n.currentLang === 'te';

  if (window.ChartsManager) {
    window.ChartsManager.updateSoilNPKChart(
      parseFloat(nitrogen), parseFloat(phosphorus), parseFloat(potassium)
    );
  }

  const recList = document.getElementById('fertRecList');
  if (recList) {
    const recs = isTe ? analysis.recommendationsTe : analysis.recommendationsEn;
    recList.innerHTML = recs.map(r => `<li>${r}</li>`).join('');
  }

  // Dynamic Visual Fertilizer Bags Counter for Low-Literacy Farmers
  const N_num = parseFloat(nitrogen) || 180;
  const P_num = parseFloat(phosphorus) || 18;
  const K_num = parseFloat(potassium) || 140;

  const ureaBags = Math.max(0.5, (Math.max(0, 240 - N_num) * 0.45 / 45) + 0.8).toFixed(1);
  const dapBags  = Math.max(0.4, (Math.max(0, 30 - P_num) * 0.8 / 50) + 0.6).toFixed(1);
  const potBags  = Math.max(0.3, (Math.max(0, 200 - K_num) * 0.5 / 50) + 0.4).toFixed(1);

  const bagsContainer = document.getElementById('fertBagsVisualContainer');
  if (bagsContainer) {
    bagsContainer.innerHTML = `
      <div class="fert-bag-item" style="background:white; border:1.5px solid #ca8a04; border-radius:8px; padding:8px 12px; text-align:center; flex:1; min-width:90px;">
        <span style="font-size:1.6rem;">🎒</span>
        <div style="font-size:0.95rem; font-weight:800; color:#854d0e;">${ureaBags} Bags</div>
        <small style="color:#a16207; font-weight:700;">Urea (యూరియా)</small>
      </div>
      <div class="fert-bag-item" style="background:white; border:1.5px solid #2563eb; border-radius:8px; padding:8px 12px; text-align:center; flex:1; min-width:90px;">
        <span style="font-size:1.6rem;">🎒</span>
        <div style="font-size:0.95rem; font-weight:800; color:#1e40af;">${dapBags} Bags</div>
        <small style="color:#3b82f6; font-weight:700;">DAP (డి.ఎ.పి)</small>
      </div>
      <div class="fert-bag-item" style="background:white; border:1.5px solid #dc2626; border-radius:8px; padding:8px 12px; text-align:center; flex:1; min-width:90px;">
        <span style="font-size:1.6rem;">🎒</span>
        <div style="font-size:0.95rem; font-weight:800; color:#991b1b;">${potBags} Bags</div>
        <small style="color:#ef4444; font-weight:700;">Potash (పొటాష్)</small>
      </div>
    `;
  }

  const resultCard = document.getElementById('soilResultCard');
  if (resultCard) {
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (isFarmerEasyMode) {
    setTimeout(listenToSoil, 250);
  }
}

/* =============================================
   PEST ALERTS FEED WITH REAL IMAGES & AUDIO
   ============================================= */
async function loadPestAlerts() {
  const container = document.getElementById('alertsListContainer');
  if (!container) return;

  const alerts = [
    {
      id: 1,
      crop: "Chilli / Pepper (మిర్చి)",
      pestEn: "Black Thrips (Thrips parvispinus) Outbreak",
      pestTe: "నల్ల తామర పురుగు (బ్లాక్ థ్రిప్స్) ఉధృతి",
      severity: "High",
      district: "Guntur & Prakasam",
      date: "2026-08-28",
      image: "https://images.unsplash.com/photo-1563201515-adbe35c669c5?auto=format&fit=crop&w=600&q=80",
      advisoryEn: "Install sticky blue traps @ 25 per acre. Spray Spinetoram 11.7 SC @ 1.0 ml/L or Broflanilide @ 0.1 ml/L.",
      advisoryTe: "ఎకరానికి 25 నీలిరంగు జిగురు అట్టలు ఏర్పాటు చేయండి. స్పైనెటోరామ్ 1.0 మి.లీ పిచికారీ చేయండి."
    },
    {
      id: 2,
      crop: "Paddy / Rice (వరి)",
      pestEn: "Brown Plant Hopper (BPH) Warning",
      pestTe: "సుడి దోమ (బి.పి.హెచ్) హెచ్చరిక",
      severity: "Medium",
      district: "Krishna & West Godavari",
      date: "2026-08-27",
      image: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=600&q=80",
      advisoryEn: "Drain standing water from paddy fields for 3 days. Spray Triflumezopyrim 10% SC @ 0.5 ml/L directed at stem base.",
      advisoryTe: "పొలంలోని నీటిని 3 రోజులు బయటకు పంపండి. మొక్కల మొదళ్ల వద్ద ట్రైఫ్లూమెజోపైరిమ్ 0.5 మి.లీ పిచికారీ చేయండి."
    },
    {
      id: 3,
      crop: "Cotton (పత్తి)",
      pestEn: "Pink Bollworm Larvae Risk",
      pestTe: "గులాబీ రంగు రంధ్రాలు చేసే పురుగు హెచ్చరిక",
      severity: "High",
      district: "Warangal & Khammam",
      date: "2026-08-26",
      image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
      advisoryEn: "Install Pheromone traps @ 5 per acre. Spray Profenofos 50 EC @ 2.0 ml/L or Emamectin Benzoate @ 0.5 g/L.",
      advisoryTe: "ఎకరానికి 5 లింగ ఆకర్షణ బుట్టలు ఏర్పాటు చేయండి. ప్రొఫెనోఫాస్ 2.0 మి.లీ లేదా ఎమామెక్టిన్ 0.5 గ్రాములు పిచికారీ చేయండి."
    }
  ];

  const isTe = window.i18n.currentLang === 'te';

  container.innerHTML = alerts.map(a => {
    const voiceText = (isTe ? `${a.pestTe}. ${a.advisoryTe}` : `${a.pestEn}. ${a.advisoryEn}`)
      .replace(/'/g, '&#39;').replace(/"/g, '&quot;');

    return `
      <div class="alert-card-with-img ${a.severity}" role="article">
        <img src="${a.image}" alt="${a.pestEn}" class="alert-img-header" loading="lazy">
        <div class="alert-body-content">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
            <h3 style="color: var(--primary-dark); font-size: 1.1rem; font-weight:800;">${isTe ? a.pestTe : a.pestEn}</h3>
            <span class="severity-badge ${a.severity}">${a.severity} Risk</span>
          </div>
          <p style="font-size:0.85rem; color: var(--text-muted); margin-bottom: 10px;">
            📍 <strong>District:</strong> ${a.district} &nbsp;|&nbsp; 🌱 <strong>Crop:</strong> ${a.crop}
          </p>
          <div class="remedy-box organic" style="margin-bottom: 10px;">
            <p style="font-size:0.92rem;">${isTe ? a.advisoryTe : a.advisoryEn}</p>
          </div>
          <button class="btn-listen" onclick="speakTextSafe('${voiceText}')">
            🔊 ${isTe ? 'సలహా వినండి' : 'Listen Advisory'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/* =============================================
   VOICE ADVISORY & TEXT-TO-SPEECH (TTS)
   Supports 5 Indian Languages (TE, EN, HI, TA, KN)
   ============================================= */
let cachedVoices = [];

function loadSpeechVoices() {
  if (!('speechSynthesis' in window)) return;
  cachedVoices = window.speechSynthesis.getVoices() || [];
}

if ('speechSynthesis' in window) {
  loadSpeechVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadSpeechVoices();
  };
}

function getBestVoiceForLang(lang) {
  if (!cachedVoices || cachedVoices.length === 0) {
    loadSpeechVoices();
  }
  const l = (lang || 'en').toLowerCase();
  
  const localeMap = {
    te: ['te-in', 'te', 'telugu', 'mohan'],
    hi: ['hi-in', 'hi', 'hindi', 'swara', 'madhur', 'hemant', 'kalpana', 'google हिन्दी'],
    ta: ['ta-in', 'ta', 'tamil', 'valluvar', 'google தமிழ்'],
    kn: ['kn-in', 'kn', 'kannada', 'gagan', 'sapna', 'google ಕನ್ನಡ'],
    en: ['en-in', 'en-gb', 'en-us', 'ravi', 'heera', 'neerja', 'english']
  };

  const matchKeys = localeMap[l] || ['en-in', 'en'];

  // 1. Match exact locale or voice name containing keywords
  for (const voice of cachedVoices) {
    const vLang = (voice.lang || '').toLowerCase();
    const vName = (voice.name || '').toLowerCase();
    for (const key of matchKeys) {
      if (vLang === key || vLang.replace('_', '-').startsWith(key) || vName.includes(key)) {
        return voice;
      }
    }
  }

  // 2. Fallback to any voice starting with the primary 2-letter language code
  const langPrefix = l.slice(0, 2);
  const fallback = cachedVoices.find(v => (v.lang || '').toLowerCase().startsWith(langPrefix));
  if (fallback) return fallback;

  // 3. Fallback to default or English
  return cachedVoices.find(v => (v.lang || '').toLowerCase().startsWith('en')) || cachedVoices[0] || null;
}

function playVoiceAlert() {
  const lang = window.i18n.currentLang || 'en';
  const alertsMap = {
    te: 'రైతు సోదరులకు ముఖ్యమైన ప్రత్యక్ష వాతావరణ హెచ్చరిక. గుంటూరు జిల్లాలో మిర్చి తోటలకు నల్ల తామర పురుగు ఉధృతి అధికంగా ఉంది. పొలంలో నీలిరంగు అట్టలను ఏర్పాటు చేయండి.',
    hi: 'किसान भाइयों के लिए महत्वपूर्ण मौसम और कीट चेतावनी। मिर्च की फसल में थ्रिप्स का प्रकोप देखा गया है। खेत में नीले चिपचिपे ट्रैप लगाएं।',
    ta: 'விவசாயிகளுக்கு முக்கியமான வானிலை எச்சரிக்கை. மிளகாய் பயிரில் கருப்பு இலைப்பேன் தாக்குதல் அதிகம் உள்ளது. வயலில் நீல நிற ஒட்டும் பொறிகளை அமைக்கவும்.',
    kn: 'ರೈತ ಬಾಂಧವರಿಗೆ ಪ್ರಮುಖ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ. ಮೆಣಸಿನಕಾಯಿ ಬೆಳೆಯಲ್ಲಿ ಕಪ್ಪು ಥ್ರಿಪ್ಸ್ ಹಾವಳಿ ಹೆಚ್ಚಾಗಿದೆ. ಹೊಲದಲ್ಲಿ ನೀಲಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ.',
    en: 'Important agricultural weather warning. High risk of Black Thrips in Chilli crops. Install blue sticky traps immediately.'
  };

  const text = alertsMap[lang] || alertsMap['en'];
  speakText(text, lang);
}

function speakTextSafe(htmlText) {
  const el = document.createElement('div');
  el.innerHTML = htmlText;
  speakText(el.textContent || el.innerText || htmlText);
}

function speakText(text, langOverride = null, onEndCallback = null) {
  if (!text) return;
  if (!('speechSynthesis' in window)) {
    console.warn("SpeechSynthesis not available in this browser.");
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Cancel any existing speech

    const activeLang = langOverride || (window.i18n && window.i18n.currentLang) || 'en';
    const voiceLocaleMap = {
      te: 'te-IN',
      hi: 'hi-IN',
      ta: 'ta-IN',
      kn: 'kn-IN',
      en: 'en-IN'
    };

    const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = voiceLocaleMap[activeLang] || 'en-IN';
    utterance.rate = 0.90; // Natural pacing for Indian rural dialects
    utterance.pitch = 1.0;

    const matchedVoice = getBestVoiceForLang(activeLang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    if (onEndCallback) {
      utterance.onend = onEndCallback;
      utterance.onerror = onEndCallback;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error("SpeechSynthesis speak error:", err);
  }
}

function listenToReport() {
  if (!lastScanResult) return;
  const lang = (window.i18n && window.i18n.currentLang) || 'en';
  const disease = getLocalizedDiseaseField(lastScanResult, 'disease');
  const organic = getLocalizedDiseaseField(lastScanResult, 'organicRemedy');
  const chemical = getLocalizedDiseaseField(lastScanResult, 'chemicalRemedy');
  
  const text = `${disease}. ${organic} ${chemical}`;
  speakText(text, lang);
}

function listenToWeather() {
  const advText = document.getElementById('wxAdvisoryText');
  if (advText) speakText(advText.textContent, window.i18n.currentLang);
}

function listenToIrrigation() {
  const schedule = document.getElementById('resDripScheduleText');
  const water = document.getElementById('resWaterVal');
  if (schedule && water) {
    speakText(`Total water needed: ${water.textContent}. Schedule: ${schedule.textContent}`, window.i18n.currentLang);
  }
}

function listenToSoil() {
  const fertList = document.getElementById('fertRecList');
  if (fertList) speakText(fertList.textContent, window.i18n.currentLang);
}

/* =============================================
   KNOWLEDGE BASE SEARCH FILTER
   ============================================= */
function filterKnowledgeBase() {
  const query = (document.getElementById('kbSearchInput').value || '').toLowerCase().trim();
  const cards = document.querySelectorAll('.kb-card');
  let matchCount = 0;

  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    const matches = !query || text.includes(query);
    card.style.display = matches ? 'block' : 'none';
    if (matches) matchCount++;
  });

  const emptyMsg = document.getElementById('kbEmptyMsg');
  if (emptyMsg) emptyMsg.style.display = matchCount === 0 ? 'block' : 'none';
}

function filterKbCategory(category, btnElement) {
  document.querySelectorAll('.kb-chip').forEach(c => c.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  const cards = document.querySelectorAll('.kb-card');
  cards.forEach(card => {
    const cat = card.getAttribute('data-category');
    if (category === 'all' || cat === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

/* =============================================
   AI VOICE ASSISTANT & AGRONOMIST BOT
   Multi-Language Speech-to-Text & Text-to-Speech
   ============================================= */
let speechRecognitionInstance = null;
let isSpeechRecording = false;

function openVoiceAssistant() {
  const modal = document.getElementById('aiVoiceModal');
  if (modal) {
    modal.style.display = 'flex';
    const input = document.getElementById('aiQueryInput');
    if (input) setTimeout(() => input.focus(), 150);
  }
}

function closeVoiceAssistant() {
  const modal = document.getElementById('aiVoiceModal');
  if (modal) modal.style.display = 'none';
  if (isSpeechRecording) stopSpeechRecording();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

function toggleSpeechRecording() {
  if (isSpeechRecording) {
    stopSpeechRecording();
  } else {
    startSpeechRecording();
  }
}

function startSpeechRecording() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const statusLabel = document.getElementById('micStatusLabel');
  const micBtn = document.getElementById('micMainBtn');
  const visualizer = document.getElementById('micVisualizer');
  const lang = (window.i18n && window.i18n.currentLang) || 'en';

  const voiceLocaleMap = {
    te: 'te-IN',
    hi: 'hi-IN',
    ta: 'ta-IN',
    kn: 'kn-IN',
    en: 'en-IN'
  };

  if (!SpeechRecognition) {
    const errorMsgs = {
      te: "మీ బ్రౌజర్ వాయిస్ రికగ్నిషన్‌కు మద్దతు ఇవ్వడం లేదు. దయచేసి టైప్ చేయండి.",
      hi: "आपका ब्राउज़र वॉइस पहचान का समर्थन नहीं करता है। कृपया टाइप करें।",
      ta: "உங்கள் உலாவி குரல் அங்கீகாரத்தை ஆதரிக்கவில்லை. தயவுசெய்து தட்டச்சு செய்யவும்.",
      kn: "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ಟೈಪ್ ಮಾಡಿ.",
      en: "Speech Recognition is not supported by your browser. Please type your query."
    };
    alert(errorMsgs[lang] || errorMsgs['en']);
    return;
  }

  try {
    speechRecognitionInstance = new SpeechRecognition();
    speechRecognitionInstance.lang = voiceLocaleMap[lang] || 'en-IN';
    speechRecognitionInstance.continuous = false;
    speechRecognitionInstance.interimResults = true; // Live interim text feedback!

    speechRecognitionInstance.onstart = function() {
      isSpeechRecording = true;
      if (micBtn) micBtn.classList.add('listening');
      if (visualizer) visualizer.style.display = 'flex';
      if (statusLabel) {
        statusLabel.textContent = window.i18n.t('micPromptListening') || "🔴 Listening... Speak now in your language...";
        statusLabel.style.color = "var(--danger-red)";
      }
    };

    speechRecognitionInstance.onresult = function(event) {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (interimTranscript && statusLabel) {
        statusLabel.textContent = `🎙️ "${interimTranscript}"`;
        statusLabel.style.color = "var(--primary-dark)";
      }

      if (finalTranscript && finalTranscript.trim()) {
        stopSpeechRecording();
        appendUserChatBubble(finalTranscript);
        processAIQuery(finalTranscript);
      }
    };

    speechRecognitionInstance.onerror = function(event) {
      console.warn("Speech recognition event error:", event.error);
      stopSpeechRecording();
      if (statusLabel) {
        statusLabel.textContent = "⚠️ Could not capture audio. Please tap mic again or type your question.";
        statusLabel.style.color = "var(--warning-amber)";
      }
    };

    speechRecognitionInstance.onend = function() {
      stopSpeechRecording();
    };

    speechRecognitionInstance.start();

  } catch (err) {
    console.error("Speech recognition startup error:", err);
    stopSpeechRecording();
  }
}

function stopSpeechRecording() {
  isSpeechRecording = false;
  const micBtn = document.getElementById('micMainBtn');
  const visualizer = document.getElementById('micVisualizer');
  const statusLabel = document.getElementById('micStatusLabel');

  if (micBtn) micBtn.classList.remove('listening');
  if (visualizer) visualizer.style.display = 'none';
  if (statusLabel) {
    statusLabel.textContent = window.i18n.t('micPromptTap') || "🎙️ Tap microphone and speak your farming question";
    statusLabel.style.color = "var(--text-dark)";
  }

  if (speechRecognitionInstance) {
    try { speechRecognitionInstance.stop(); } catch (_) {}
    speechRecognitionInstance = null;
  }
}

function handleChatSubmit(evt) {
  if (evt && evt.preventDefault) evt.preventDefault();
  const input = document.getElementById('aiQueryInput');
  if (!input) return;

  const query = input.value.trim();
  if (!query) return;

  input.value = '';
  appendUserChatBubble(query);
  processAIQuery(query);
}

function handleVoiceChipClick(chipKeyOrQuery) {
  const lang = (window.i18n && window.i18n.currentLang) || 'en';
  
  const chipQueryMap = {
    chipThrips: {
      te: "మిర్చి నల్ల తామర పురుగు నివారణ ఏమిటి?",
      hi: "मिर्च में काले थ्रिप्स की रोकथाम कैसे करें?",
      ta: "மிளகாய் கருப்பு இலைப்பேன் கட்டுப்பாடு முறை என்ன?",
      kn: "ಮೆಣಸಿನಕಾಯಿ ಕಪ್ಪು ಥ್ರಿಪ್ಸ್ ನಿಯಂತ್ರಣ ಹೇಗೆ?",
      en: "How to manage chilli black thrips?"
    },
    chipTomato: {
      te: "టమాటా లేట్ బ్లైట్ ఆకు మాడు నివారణ చర్యలు ఏమిటి?",
      hi: "टमाटर पछेती झुलसा रोग की रोकथाम कैसे करें?",
      ta: "தக்காளி இலை கருகல் நோய் தடுப்பது எப்படி?",
      kn: "ಟೊಮೆಟೊ ಕರಕಲು ರೋಗ ನಿಯಂತ್ರಣ ಹೇಗೆ?",
      en: "How to treat tomato late blight?"
    },
    chipCotton: {
      te: "పత్తిలో గులాబీ రంగు పురుగు నివారణ మందులు ఏమిటి?",
      hi: "कपास में गुलाबी सुंडी नियंत्रण कैसे करें?",
      ta: "பருத்தி காய்ப்புழு தடுப்பு முறை என்ன?",
      kn: "ಹತ್ತಿ ಗುಲಾಬಿ ಕಾಯಿಕೊರಕ ನಿಯಂತ್ರಣ ಹೇಗೆ?",
      en: "How to manage cotton pink bollworm?"
    },
    chipGroundnut: {
      te: "వేరుశనగ తిక్కా ఆకుమచ్చ తెగులు నివారణ ఎలా?",
      hi: "मूंगफली टिक्का रोग नियंत्रण कैसे करें?",
      ta: "நிலக்கடலை டிக்கா நோய் தடுப்பது எப்படி?",
      kn: "ನೆಲಗಡಲೆ ತಿಕ್ಕಾ ರೋಗ ನಿಯಂತ್ರಣ ಹೇಗೆ?",
      en: "How to control groundnut tikka leaf spot?"
    },
    chipPaddy: {
      te: "వరి అగ్గి తెగులు మరియు సుడి దోమ నివారణ ఏమిటి?",
      hi: "धान ब्लास्ट रोग व बीपीएच कीट नियंत्रण कैसे करें?",
      ta: "நெல் குலை நோய் மற்றும் புகையான் கட்டுப்பாடு எப்படி?",
      kn: "ಭತ್ತದ ಬ್ಲಾಸ್ಟ್ ರೋಗ ನಿಯಂತ್ರಣ ಹೇಗೆ?",
      en: "How to manage paddy blast and BPH?"
    },
    chipWeather: {
      te: "నేటి వాతావరణంలో మందులు పిచికారీ చేయవచ్చా?",
      hi: "क्या आज कीटनाशक का छिड़काव किया जा सकता है?",
      ta: "இன்றைய வானிலையில் மருந்து தெளிக்கலாமா?",
      kn: "ಇಂದಿನ ಹವಾಮಾನದಲ್ಲಿ ಸಿಂಪಡಣೆ ಮಾಡಬಹುದೇ?",
      en: "Can I spray pesticides in today's weather?"
    },
    chipFertilizer: {
      te: "పత్తి పంటకు ఎరువుల మోతాదు మరియు యూరియా సమయం ఏమిటి?",
      hi: "कपास की फसल में खाद व यूरिया की सही मात्रा क्या है?",
      ta: "பருத்தி பயிருக்கு உர அளவு என்ன?",
      kn: "ಹತ್ತಿ ಬೆಳೆಗೆ ಗೊಬ್ಬರದ ಪ್ರಮಾಣ ಎಷ್ಟು?",
      en: "What is the recommended fertilizer dosage for cotton?"
    },
    chipSoil: {
      te: "భూసార పరీక్ష ఎలా చేయించాలి మరియు నేల ఆరోగ్యం ఎలా పెంచాలి?",
      hi: "मिट्टी परीक्षण कैसे कराएं और मृदा स्वास्थ्य कैसे सुधारें?",
      ta: "மண் பரிசோதனை மற்றும் NPK மேலாண்மை எப்படி?",
      kn: "ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮತ್ತು ಆರೋಗ್ಯ ನಿರ್ವಹಣೆ ಹೇಗೆ?",
      en: "How to test soil health and manage NPK balance?"
    },
    chipRythu: {
      te: "రైతు భరోసా మరియు పి.ఎం-కిసాన్ పథకం వివరాలు ఏమిటి?",
      hi: "पीएम-किसान और सरकारी कृषि योजनाओं की जानकारी दें",
      ta: "பி.எம்-கிசான் மற்றும் அரசு விவசாய திட்ட விவரங்கள் என்ன?",
      kn: "ಪಿ.ಎಂ-ಕಿಸಾನ್ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ವಿವರ ಕೊಡಿ",
      en: "What are the benefits under PM-KISAN and Rythu Bharosa?"
    },
    chipOrganic: {
      te: "జీవామృతం తయారీ విధానం మరియు ప్రకృతి వ్యవసాయం ఎలా చేయాలి?",
      hi: "जीवामृत बनाने की विधि और जैविक खेती कैसे करें?",
      ta: "ஜீவாமிர்தம் தயாரிக்கும் முறை என்ன?",
      kn: "ಜೀವಾಮೃತ ತಯಾರಿಸುವ ವಿಧಾನ ಹೇಗೆ?",
      en: "How to prepare Jeevamrutham for organic farming?"
    }
  };

  let queryText = chipKeyOrQuery;
  if (chipQueryMap[chipKeyOrQuery]) {
    queryText = chipQueryMap[chipKeyOrQuery][lang] || chipQueryMap[chipKeyOrQuery]['en'];
  } else if (window.i18n && window.i18n.t(chipKeyOrQuery)) {
    queryText = window.i18n.t(chipKeyOrQuery);
  }

  appendUserChatBubble(queryText);
  processAIQuery(queryText);
}

function appendUserChatBubble(text) {
  const container = document.getElementById('aiChatMessages');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble user';
  bubble.innerHTML = `
    <div class="chat-bubble-header">
      <span>👨‍🌾 Farmer</span>
      <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
    <p>${escapeHtml(text)}</p>
  `;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

async function processAIQuery(query) {
  const container = document.getElementById('aiChatMessages');
  if (!container) return;

  const lang = window.i18n.currentLang || 'en';

  // Add Typing Indicator
  const typingBubble = document.createElement('div');
  typingBubble.className = 'chat-bubble ai';
  typingBubble.id = 'aiTypingIndicator';
  typingBubble.innerHTML = `
    <div class="chat-bubble-header">
      <span>🤖 AI Agronomist</span>
    </div>
    <p><em>🌾 Thinking & Analyzing in ${window.i18n.LANGUAGES[lang] ? window.i18n.LANGUAGES[lang].native : 'your language'}...</em></p>
  `;
  container.appendChild(typingBubble);
  container.scrollTop = container.scrollHeight;

  // Call Natural Language AI Agronomist Engine
  const response = await window.ApiService.askAgriAI(query, lang);

  // Remove typing indicator
  const typingEl = document.getElementById('aiTypingIndicator');
  if (typingEl) typingEl.remove();

  let responseText = response.textEn;
  if (lang === 'te') responseText = response.textTe || response.textEn;
  else if (lang === 'hi') responseText = response.textHi || response.textEn;
  else if (lang === 'ta') responseText = response.textTa || response.textEn;
  else if (lang === 'kn') responseText = response.textKn || response.textEn;

  const speechText = response.speechText || responseText;

  // Append AI Answer Bubble
  const aiBubble = document.createElement('div');
  aiBubble.className = 'chat-bubble ai';
  aiBubble.innerHTML = `
    <div class="chat-bubble-header">
      <span>🤖 AI Agronomist • ${escapeHtml(response.topic)}</span>
      <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
    <p>${escapeHtml(responseText)}</p>
    <button class="chat-speak-btn">
      🔊 <span>${window.i18n.t('listen') || 'Listen Aloud'}</span>
    </button>
  `;
  const speakBtn = aiBubble.querySelector('.chat-speak-btn');
  if (speakBtn) {
    speakBtn.addEventListener('click', () => speakText(speechText, lang));
  }
  container.appendChild(aiBubble);
  container.scrollTop = container.scrollHeight;

  // Auto-speak response in user's selected language
  speakText(speechText, lang);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* =============================================
   UTILITY HELPERS
   ============================================= */
function safeSetText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function safeSetValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

/* =============================================
   FARMER USER PROFILE CONTROLLER (EXECUTIVE GRADE)
   ============================================= */
async function loadUserProfile() {
  if (window.ApiService && typeof window.ApiService.getUserProfile === 'function') {
    currentUserProfile = await window.ApiService.getUserProfile();
  } else {
    currentUserProfile = JSON.parse(JSON.stringify(window.ApiService.DEMO_PROFILES.ramesh));
  }
  renderUserProfile();
  syncProfileToTools();
}

function renderUserProfile() {
  if (!currentUserProfile) return;
  const isTe = window.i18n && window.i18n.currentLang === 'te';
  const name = isTe && currentUserProfile.nameTe ? currentUserProfile.nameTe : currentUserProfile.name;

  // Header Profile Pill
  safeSetText('hdrProfileName', name);
  const distCap = currentUserProfile.district ? currentUserProfile.district.charAt(0).toUpperCase() + currentUserProfile.district.slice(1) : 'Guntur';
  safeSetText('hdrProfileLoc', distCap);
  const hdrAvatar = document.getElementById('hdrProfileAvatar');
  if (hdrAvatar && currentUserProfile.avatar) hdrAvatar.src = currentUserProfile.avatar;

  // Profile Hero
  safeSetText('profName', name);
  safeSetText('profKisanIdBadge', `ID: ${currentUserProfile.id || currentUserProfile.kisanCardNo || 'RS-AP-2026-8891'}`);
  safeSetText('profTrustScoreVal', currentUserProfile.trustScore || 865);
  safeSetText('profTrustRating', currentUserProfile.trustRating || 'Grade A Verified');

  const compPercent = currentUserProfile.profileCompletePercent || 96;
  safeSetText('profCompletionVal', `${compPercent}%`);
  const compFill = document.getElementById('profCompletionFill');
  if (compFill) compFill.style.width = `${compPercent}%`;

  const profAvatar = document.getElementById('profAvatar');
  if (profAvatar && currentUserProfile.avatar) profAvatar.src = currentUserProfile.avatar;
  
  const village = currentUserProfile.village || 'Village';
  const mandal = currentUserProfile.mandal || 'Mandal';
  const state = currentUserProfile.state || 'Andhra Pradesh';
  const pincode = currentUserProfile.pincode || '';
  safeSetText('profLocationText', `${village}, ${mandal}, ${distCap} (${state}) ${pincode ? '- ' + pincode : ''}`);

  // Crops list in hero
  const cropsListEl = document.getElementById('profCropsList');
  if (cropsListEl && currentUserProfile.primaryCrops) {
    cropsListEl.innerHTML = currentUserProfile.primaryCrops.map(c => `<span class="crop-tag">🌱 ${escapeHtml(c)}</span>`).join('');
  }

  // Key Stats Strip (6 Metrics)
  safeSetText('profTotalLand', `${currentUserProfile.totalLand || 3.5} Acres`);
  const irrAcres = currentUserProfile.irrigatedAcres || 2.5;
  const rainAcres = currentUserProfile.rainfedAcres || 1.0;
  safeSetText('profLandSub', `${irrAcres} Ac Drip • ${rainAcres} Ac Rainfed`);

  const plotsCount = (currentUserProfile.activePlots && currentUserProfile.activePlots.length) || 0;
  safeSetText('profPlotsCount', `${plotsCount} Plot${plotsCount === 1 ? '' : 's'}`);
  safeSetText('profScansDone', `${currentUserProfile.scansCount || 14} Scans`);
  
  const savedL = currentUserProfile.waterSavedLiters ? currentUserProfile.waterSavedLiters.toLocaleString() : '184,500';
  safeSetText('profWaterSaved', `${savedL} L`);

  const subsidies = currentUserProfile.dbtTotalAmount ? `₹${currentUserProfile.dbtTotalAmount.toLocaleString()}` : '₹19,500';
  safeSetText('profSubsidiesClaimed', subsidies);
  safeSetText('profSoilHealthVal', currentUserProfile.soilHealthRating ? currentUserProfile.soilHealthRating.split(' ')[0] : '88 / 100');

  // Personal Info Dossier
  safeSetText('profDetailName', name);
  safeSetText('profDetailPhone', currentUserProfile.phone || '+91 98765 43210');
  safeSetText('profDetailEmail', currentUserProfile.email || 'farmer@raaituseva.in');
  safeSetText('profDetailState', currentUserProfile.state || 'Andhra Pradesh');
  safeSetText('profDetailDistrict', distCap);
  safeSetText('profDetailMandal', mandal);
  safeSetText('profDetailVillage', village);
  safeSetText('profDetailPincode', pincode || '522304');
  safeSetText('profDetailAadhaar', currentUserProfile.aadhaarHash || 'XXXX-XXXX-9482 (e-KYC Verified)');
  safeSetText('profDetailSurvey', currentUserProfile.surveyNo || 'Survey No. 442/1B & 442/2A');
  safeSetText('profDetailPatta', currentUserProfile.pattaNo || 'AP-PP-2024-88912');
  safeSetText('profDetailKisanNo', currentUserProfile.kisanCardNo || 'AP-GNT-2024-99120');
  safeSetText('profDetailPmKisan', currentUserProfile.pmKisanId || 'PMK-88392019');
  safeSetText('profDetailRythu', currentUserProfile.rythuBharosaId || 'RB-2026-44019');

  // Farm Holdings
  safeSetText('profDetailAcres', `${currentUserProfile.totalLand || 3.5} Acres (${irrAcres} Ac Irrigated)`);
  const soilMap = {
    loamy: "Black Loamy Soil (నల్లరేగడి నేల)",
    sandy: "Sandy Soil (ఇసుక నేల)",
    clay: "Red Clay Soil (ఎర్ర నేల)"
  };
  safeSetText('profDetailSoil', soilMap[currentUserProfile.soilType] || currentUserProfile.soilType || 'Loamy Soil');
  safeSetText('profDetailIrr', currentUserProfile.irrigationSource || 'Precision Drip & Borewell (3.5 HP Solar Pump)');
  safeSetText('profDetailPump', `${currentUserProfile.pumpHp || 3.5} HP (${Math.round((currentUserProfile.pumpHp || 3.5) * 1000)} L/hr)`);
  safeSetText('profDetailCropsText', (currentUserProfile.primaryCrops || ['Cotton', 'Chilli', 'Tomato']).join(', '));

  // 3D Smart Kisan ID Card
  safeSetText('kcardName', name.toUpperCase());
  safeSetText('kcardId', currentUserProfile.id || currentUserProfile.kisanCardNo || 'RS-AP-2026-8891');
  safeSetText('kcardDistrict', `${distCap}, ${state}`);
  safeSetText('kcardLand', `${currentUserProfile.totalLand || 3.5} Acres (${currentUserProfile.soilType || 'Loamy'} Soil)`);
  safeSetText('kcardPhone', currentUserProfile.phone || '+91 98765 43210');
  safeSetText('kcardPatta', currentUserProfile.pattaNo || 'AP-PP-2024-88912');
  const kcardPhoto = document.getElementById('kcardPhoto');
  if (kcardPhoto && currentUserProfile.avatar) kcardPhoto.src = currentUserProfile.avatar;

  // Render Sub-tab Lists
  renderPlotsList();
  renderSchemesList();
  renderScanHistoryList();
  renderEconomicsPassbook();

  // Update demo preset button active state
  document.querySelectorAll('.preset-farmer-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activePresetKey = currentUserProfile.presetId || 'ramesh';
  const activeBtn = document.getElementById(`demoBtn-${activePresetKey}`);
  if (activeBtn) activeBtn.classList.add('active');
}

function renderPlotsList() {
  const container = document.getElementById('plotsContainer');
  if (!container) return;

  const plots = currentUserProfile.activePlots || [];
  if (plots.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); font-weight: 600;">No active plots recorded. Click "Add New Crop Plot" to create one.</p>`;
    return;
  }

  const cropEmojis = {
    Cotton: '☁️',
    Chilli: '🌶️',
    Tomato: '🍅',
    Paddy: '🌾',
    Rice: '🌾',
    Maize: '🌽',
    Groundnut: '🥜',
    Banana: '🍌'
  };

  container.innerHTML = plots.map(p => {
    const emoji = cropEmojis[p.crop] || '🌱';
    const stageLabel = p.stageLabel || (p.stage === 'flowering' ? 'Flowering & Fruiting' : (p.stage === 'initial' ? 'Seedling' : 'Growing Stage'));
    const variety = p.variety || `${p.crop} Hybrid`;
    const moisture = p.moisturePercent || 68;
    const yieldEst = p.yieldEstimateQuintals || (p.acres * 10);
    const health = p.health || 90;

    return `
      <div class="plot-card" id="card-${escapeHtml(p.id)}">
        <div class="plot-header">
          <div>
            <div class="plot-title">${emoji} ${escapeHtml(p.name)}</div>
            <small style="color: var(--primary-dark); font-weight: 700;">${escapeHtml(variety)} • ${p.acres} Acres</small>
          </div>
          <button class="plot-delete-btn" onclick="handleDeletePlot('${escapeHtml(p.id)}')" title="Delete Plot" aria-label="Delete Plot">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
        
        <div class="plot-meta-strip">
          <span class="plot-pill">🌿 ${escapeHtml(stageLabel)}</span>
          <span class="plot-pill">💧 Moisture: ${moisture}%</span>
          <span class="plot-pill">⚖️ Est. Yield: ${yieldEst} Qtl</span>
        </div>

        <div class="plot-health-bar-box">
          <div class="plot-health-label">
            <span>Crop Health Index</span>
            <span style="color: #15803d; font-weight: 800;">${health}% (Optimal)</span>
          </div>
          <div class="plot-health-track">
            <div class="plot-health-fill" style="width: ${health}%;"></div>
          </div>
        </div>

        <div class="plot-actions-row">
          <button class="btn btn-sm btn-outline" onclick="showTab('disease-detection')">
            <i class="fa-solid fa-camera"></i> Quick Scan
          </button>
          <button class="btn btn-sm btn-outline" onclick="showTab('irrigation')">
            <i class="fa-solid fa-droplet"></i> Log Irrigation
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderSchemesList() {
  const container = document.getElementById('schemesContainer');
  if (!container) return;

  const schemes = currentUserProfile.schemes || [];
  if (schemes.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); font-weight: 600;">No government scheme records found.</p>`;
    return;
  }

  container.innerHTML = schemes.map(s => `
    <div class="scheme-card">
      <div class="scheme-info">
        <div class="scheme-title">🏛️ ${escapeHtml(s.name)}</div>
        <div class="scheme-benefit">💰 Sanctioned: <strong>${escapeHtml(s.benefit || s.amount || '')}</strong></div>
        <div class="scheme-utr">
          <span>UTR / Ref: <code>${escapeHtml(s.utrNo || 'UTR-DBT-2026-99214')}</code></span>
          <span>• Date: ${escapeHtml(s.date || 'Recent')}</span>
        </div>
      </div>
      <div>
        <span class="scheme-status-pill ${s.badge || 'success'}">
          <i class="fa-solid fa-circle-check"></i> ${escapeHtml(s.status)}
        </span>
      </div>
    </div>
  `).join('');
}

function renderScanHistoryList() {
  const container = document.getElementById('scanHistoryContainer');
  if (!container) return;

  const history = currentUserProfile.scanHistory || [];
  if (history.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); font-weight: 600;">No previous crop scans found.</p>`;
    return;
  }

  const lang = (window.i18n && window.i18n.currentLang) || 'en';

  container.innerHTML = history.map((h, idx) => {
    let audioText = h.action || h.issue;
    if (lang === 'te' && h.audioTe) audioText = h.audioTe;
    else if (lang === 'hi' && h.audioHi) audioText = h.audioHi;
    else if (h.audioEn) audioText = h.audioEn;

    return `
      <div class="scan-record-item">
        <div class="scan-record-details">
          <div class="scan-record-crop">
            🌱 <strong>${escapeHtml(h.crop)}</strong>: <span style="color: var(--danger-red); font-weight: 700;">${escapeHtml(h.issue)}</span>
          </div>
          <div class="scan-record-action">⚡ Action: ${escapeHtml(h.action || 'Remedy applied')}</div>
          <div class="scan-record-date">📅 Diagnosed: ${escapeHtml(h.date || 'Recent')}</div>
        </div>
        <div class="scan-record-actions">
          <span class="severity-badge ${h.severity === 'None' || h.severity === 'Optimal' ? 'Optimal' : h.severity}">${h.severity || 'High'}</span>
          <button class="btn btn-sm btn-action btn-scan-listen" data-idx="${idx}" title="Listen Audio Advisory">
            🔊 Listen
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.btn-scan-listen').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      const h = history[idx];
      if (h) {
        let text = h.action || h.issue;
        if (lang === 'te' && h.audioTe) text = h.audioTe;
        else if (lang === 'hi' && h.audioHi) text = h.audioHi;
        else if (h.audioEn) text = h.audioEn;
        speakText(text, lang);
      }
    });
  });
}

function renderEconomicsPassbook() {
  const container = document.getElementById('economicsContainer');
  if (!container) return;

  const p = currentUserProfile || {};
  const grossRev = p.grossRevenueEst || "₹4,25,000 / Season";
  const costSavings = p.costSavingsAI || "₹38,500 Saved on Inputs & Drip";
  const carbonScore = p.carbonCreditScore || 92;
  const organicStatus = p.organicCertStatus || "85% Ready for PKVY Certification";

  container.innerHTML = `
    <div class="econ-summary-cards">
      <div class="econ-card">
        <div class="econ-icon">📈</div>
        <div class="econ-data">
          <div class="econ-val">${escapeHtml(grossRev)}</div>
          <div class="econ-lbl">Estimated Crop Gross Revenue</div>
          <small class="econ-sub">Based on current MSP & Mandi prices</small>
        </div>
      </div>
      <div class="econ-card highlight">
        <div class="econ-icon">💰</div>
        <div class="econ-data">
          <div class="econ-val" style="color: var(--accent-green);">${escapeHtml(costSavings)}</div>
          <div class="econ-lbl">AI Input & Water Cost Savings</div>
          <small class="econ-sub">Via precision drip & smart fertilizer timing</small>
        </div>
      </div>
      <div class="econ-card">
        <div class="econ-icon">🌱</div>
        <div class="econ-data">
          <div class="econ-val">${carbonScore} / 100</div>
          <div class="econ-lbl">Green Carbon Credit Score</div>
          <small class="econ-sub">Eligible for Sustainable Farm Subsidies</small>
        </div>
      </div>
      <div class="econ-card">
        <div class="econ-icon">📜</div>
        <div class="econ-data">
          <div class="econ-val" style="color: #0284c7;">${escapeHtml(organicStatus)}</div>
          <div class="econ-lbl">Organic Farming Readiness</div>
          <small class="econ-sub">Paramparagat Krishi Vikas Yojana (PKVY)</small>
        </div>
      </div>
    </div>
  `;
}

function showProfileSubTab(subTabId) {
  document.querySelectorAll('.prof-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.prof-subtab-content').forEach(c => c.classList.remove('active'));

  const tabBtn = document.getElementById(`profTab-${subTabId}`);
  if (tabBtn) tabBtn.classList.add('active');

  const content = document.getElementById(`profSubTab-${subTabId}`);
  if (content) content.classList.add('active');
}

async function switchDemoProfile(presetKey) {
  if (window.ApiService && typeof window.ApiService.loadPresetProfile === 'function') {
    currentUserProfile = await window.ApiService.loadPresetProfile(presetKey);
  }
  renderUserProfile();
  syncProfileToTools();
}

function openEditProfileModal() {
  if (!currentUserProfile) return;
  safeSetValue('editName', currentUserProfile.name || '');
  safeSetValue('editPhone', currentUserProfile.phone || '');
  safeSetValue('editEmail', currentUserProfile.email || '');
  safeSetValue('editDistrict', currentUserProfile.district || 'guntur');
  safeSetValue('editMandal', currentUserProfile.mandal || '');
  safeSetValue('editVillage', currentUserProfile.village || '');
  safeSetValue('editPincode', currentUserProfile.pincode || '');
  safeSetValue('editLand', currentUserProfile.totalLand || 3.5);
  safeSetValue('editSoil', currentUserProfile.soilType || 'loamy');
  safeSetValue('editPump', currentUserProfile.pumpHp || 3.5);
  safeSetValue('editCrops', (currentUserProfile.primaryCrops || ['Cotton', 'Chilli']).join(', '));
  safeSetValue('editAvatar', currentUserProfile.avatar || '');

  const modal = document.getElementById('profileEditModal');
  if (modal) modal.style.display = 'flex';
}

function closeEditProfileModal() {
  const modal = document.getElementById('profileEditModal');
  if (modal) modal.style.display = 'none';
}

async function handleProfileSaveSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('editName').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const district = document.getElementById('editDistrict').value;
  const mandal = document.getElementById('editMandal').value.trim();
  const village = document.getElementById('editVillage').value.trim();
  const pincode = document.getElementById('editPincode').value.trim();
  const totalLand = parseFloat(document.getElementById('editLand').value) || 3.5;
  const soilType = document.getElementById('editSoil').value;
  const pumpHp = parseFloat(document.getElementById('editPump').value) || 3.5;
  const cropsRaw = document.getElementById('editCrops').value.trim();
  const avatar = document.getElementById('editAvatar').value.trim();

  const primaryCrops = cropsRaw ? cropsRaw.split(',').map(s => s.trim()).filter(Boolean) : ['Cotton', 'Chilli'];

  const updates = {
    name,
    phone,
    email,
    district,
    mandal,
    village,
    pincode,
    totalLand,
    soilType,
    pumpHp,
    primaryCrops,
    avatar: avatar || currentUserProfile.avatar
  };

  if (window.ApiService && typeof window.ApiService.saveUserProfile === 'function') {
    currentUserProfile = await window.ApiService.saveUserProfile(updates);
  } else {
    currentUserProfile = { ...currentUserProfile, ...updates };
  }

  renderUserProfile();
  syncProfileToTools();
  closeEditProfileModal();
}

function openAddPlotModal() {
  const modal = document.getElementById('addPlotModal');
  if (modal) modal.style.display = 'flex';
}

function closeAddPlotModal() {
  const modal = document.getElementById('addPlotModal');
  if (modal) modal.style.display = 'none';
}

async function handleAddPlotSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('newPlotName').value.trim();
  const crop = document.getElementById('newPlotCrop').value;
  const acres = parseFloat(document.getElementById('newPlotAcres').value) || 1.0;
  const stage = document.getElementById('newPlotStage').value;
  const health = parseInt(document.getElementById('newPlotHealth').value) || 90;

  if (window.ApiService && typeof window.ApiService.addPlot === 'function') {
    currentUserProfile = await window.ApiService.addPlot({ name, crop, acres, stage, health });
  } else {
    if (!currentUserProfile.activePlots) currentUserProfile.activePlots = [];
    currentUserProfile.activePlots.push({
      id: `plot-${Date.now()}`,
      name, crop, acres, stage,
      stageLabel: stage === 'flowering' ? 'Flowering & Fruiting' : (stage === 'initial' ? 'Seedling' : 'Growing Stage'),
      health
    });
  }

  renderUserProfile();
  closeAddPlotModal();
}

async function handleDeletePlot(plotId) {
  if (confirm("Are you sure you want to remove this crop plot?")) {
    if (window.ApiService && typeof window.ApiService.deletePlot === 'function') {
      currentUserProfile = await window.ApiService.deletePlot(plotId);
    } else {
      currentUserProfile.activePlots = currentUserProfile.activePlots.filter(p => p.id !== plotId);
    }
    renderUserProfile();
  }
}

function printFarmerIdCard() {
  window.print();
}

function exportFarmPassbook() {
  window.print();
}

function syncProfileToTools() {
  if (!currentUserProfile) return;

  // 1. Sync District to Weather
  if (currentUserProfile.district) {
    currentDistrict = currentUserProfile.district;
    const districtSelect = document.getElementById('districtSelect');
    if (districtSelect) districtSelect.value = currentUserProfile.district;
    loadWeatherData(currentDistrict);
  }

  // 2. Sync Acres to Irrigation Calculator
  if (currentUserProfile.totalLand) {
    safeSetValue('irrAcres', currentUserProfile.totalLand);
  }

  // 3. Sync Soil Type to Irrigation & Soil Advisor
  if (currentUserProfile.soilType) {
    safeSetValue('irrSoil', currentUserProfile.soilType);
  }

  // 4. Sync Crop to Irrigation Calculator
  if (currentUserProfile.primaryCrops && currentUserProfile.primaryCrops.length > 0) {
    const firstCrop = currentUserProfile.primaryCrops[0].toLowerCase();
    const irrCropSelect = document.getElementById('irrCrop');
    if (irrCropSelect) {
      for (let i = 0; i < irrCropSelect.options.length; i++) {
        if (irrCropSelect.options[i].value.toLowerCase() === firstCrop) {
          irrCropSelect.selectedIndex = i;
          break;
        }
      }
    }
  }
}

/* =============================================
   LIVE WEBCAM SCANNER MODULE
   ============================================= */
let activeCameraStream = null;
let currentFacingMode = 'environment';

async function openCameraModal() {
  const modal = document.getElementById('cameraScannerModal');
  const video = document.getElementById('cameraVideoFeed');
  if (!modal || !video) return;

  modal.style.display = 'flex';

  try {
    if (activeCameraStream) {
      activeCameraStream.getTracks().forEach(t => t.stop());
    }

    const constraints = {
      video: {
        facingMode: currentFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    activeCameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = activeCameraStream;
    video.play();
  } catch (err) {
    console.warn("Camera access denied or unavailable:", err);
    showToast("Camera access unavailable on this device. Using photo upload fallback.", "warning");
    closeCameraModal();
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.click();
  }
}

function closeCameraModal() {
  const modal = document.getElementById('cameraScannerModal');
  const video = document.getElementById('cameraVideoFeed');
  if (modal) modal.style.display = 'none';

  if (activeCameraStream) {
    activeCameraStream.getTracks().forEach(track => track.stop());
    activeCameraStream = null;
  }
  if (video) video.srcObject = null;
}

function switchCameraFacing() {
  currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
  openCameraModal();
}

function captureCameraSnapshot() {
  const video = document.getElementById('cameraVideoFeed');
  if (!video) return;

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(blob => {
    selectedFile = new File([blob], `live_leaf_scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
    selectedPresetKey = null;

    const preview = document.getElementById('uploadedPreview');
    const nameEl = document.getElementById('fileNameText');
    const box = document.getElementById('imagePreviewBox');

    if (preview) preview.src = canvas.toDataURL('image/jpeg');
    if (nameEl) nameEl.textContent = `📷 Live Camera Snapshot (${Math.round(selectedFile.size / 1024)} KB)`;
    if (box) box.style.display = 'block';

    document.querySelectorAll('.preset-chip').forEach(chip => chip.classList.remove('active'));

    closeCameraModal();
    showToast("📸 Photo captured! Analyzing crop health with AI...", "success");
    runDiseaseScan();
  }, 'image/jpeg', 0.92);
}

/* =============================================
   CANVAS LESION VISUALIZER OVERLAY
   ============================================= */
function drawLesionOverlay() {
  const farmerImg = document.getElementById('resFarmerImg');
  const canvas = document.getElementById('lesionOverlayCanvas');
  if (!farmerImg || !canvas) return;

  setTimeout(() => {
    const ctx = canvas.getContext('2d');
    canvas.width = farmerImg.clientWidth || 300;
    canvas.height = farmerImg.clientHeight || 200;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (lastScanResult && lastScanResult.severity !== 'None') {
      // Draw simulated AI lesion bounding box & heat zone
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';

      const w = canvas.width * 0.45;
      const h = canvas.height * 0.45;
      const x = canvas.width * 0.28;
      const y = canvas.height * 0.28;

      ctx.strokeRect(x, y, w, h);
      ctx.fillRect(x, y, w, h);

      // AI Confidence Tag
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x, Math.max(0, y - 22), 125, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`AI Lesion (${lastScanResult.confidence}%)`, x + 6, Math.max(14, y - 8));
    }
  }, 100);
}

/* =============================================
   WHATSAPP PRESCRIPTION & PRINT SLIP
   ============================================= */
function sharePrescriptionOnWhatsApp() {
  if (!lastScanResult) {
    showToast("Please run a crop scan first!", "warning");
    return;
  }

  const lang = (window.i18n && window.i18n.currentLang) || 'en';
  const disease = getLocalizedDiseaseField(lastScanResult, 'disease');
  const organic = getLocalizedDiseaseField(lastScanResult, 'organicRemedy');
  const chemical = getLocalizedDiseaseField(lastScanResult, 'chemicalRemedy');
  const crop = lastScanResult.crop;
  const farmerName = currentUserProfile ? currentUserProfile.name : "RaaituSeva Farmer";
  const date = new Date().toLocaleDateString('en-IN');

  const text = `🌾 *RaaituSeva AI Crop Health Advisory* 🌾\n` +
    `👨‍🌾 *Farmer:* ${farmerName}\n` +
    `📅 *Date:* ${date}\n` +
    `🌱 *Crop:* ${crop}\n` +
    `🔬 *Diagnosed Issue:* ${disease}\n` +
    `⚠️ *Severity:* ${lastScanResult.severity}\n\n` +
    `🌿 *Natural / Organic Remedy:*\n${organic}\n\n` +
    `🧪 *Chemical Dosage:*\n${chemical}\n\n` +
    `☎ *Kisan Helpline:* 1551 (Toll Free)\n` +
    `🌐 *Generated via RaaituSeva AI Platform*`;

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
  showToast(window.i18n.t('toastPrescriptionShared') || "WhatsApp advisory ready!", "success");
}

function openPrescriptionModal() {
  if (!lastScanResult) {
    showToast("Please scan a crop leaf first!", "warning");
    return;
  }
  const modal = document.getElementById('prescriptionModal');
  if (!modal) return;

  const lang = (window.i18n && window.i18n.currentLang) || 'en';
  safeSetText('prescFarmerName', currentUserProfile ? currentUserProfile.name : 'Ramesh Reddy');
  safeSetText('prescFarmerPhone', currentUserProfile ? currentUserProfile.phone : '+91 98765 43210');
  safeSetText('prescFarmerLoc', currentUserProfile ? `${currentUserProfile.districtName || currentUserProfile.district}, AP` : 'Guntur, AP');
  safeSetText('prescDateText', new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
  safeSetText('prescCropName', lastScanResult.crop);
  safeSetText('prescDiseaseName', getLocalizedDiseaseField(lastScanResult, 'disease'));
  safeSetText('prescSeverityText', `${lastScanResult.severity} Severity (${lastScanResult.confidence}% AI Confidence)`);
  safeSetText('prescOrganicText', getLocalizedDiseaseField(lastScanResult, 'organicRemedy'));
  safeSetText('prescChemicalText', getLocalizedDiseaseField(lastScanResult, 'chemicalRemedy'));

  modal.style.display = 'flex';
}

function closePrescriptionModal() {
  const modal = document.getElementById('prescriptionModal');
  if (modal) modal.style.display = 'none';
}

function printPrescriptionSlip() {
  window.print();
}

/* =============================================
   LIVE MANDI / APMC MARKET PRICES CONTROLLER
   ============================================= */
async function renderMandiMarket(cropFilter = 'all', yardFilter = 'all') {
  const container = document.getElementById('mandiCardsGrid');
  if (!container || !window.ApiService) return;

  const data = await window.ApiService.getMandiMarketData(cropFilter, yardFilter);
  const lang = (window.i18n && window.i18n.currentLang) || 'en';
  const isTe = lang === 'te';
  const isHi = lang === 'hi';
  const isTa = lang === 'ta';
  const isKn = lang === 'kn';

  container.innerHTML = data.map(item => {
    let cropName = item.crop;
    let yardName = item.yard;
    let adviceText = item.aiAdvice;
    let reason = item.aiAdviceReason;

    if (isTe) {
      cropName = item.cropTe || item.crop;
      yardName = item.yardTe || item.yard;
      adviceText = item.aiAdviceTe || item.aiAdvice;
      reason = item.aiAdviceReasonTe || item.aiAdviceReason;
    } else if (isHi) {
      cropName = item.cropHi || item.crop;
      yardName = item.yardHi || item.yard;
      adviceText = item.aiAdviceHi || item.aiAdvice;
      reason = item.aiAdviceReasonHi || item.aiAdviceReason;
    } else if (isTa) {
      cropName = item.cropTa || item.crop;
      yardName = item.yardTa || item.yard;
      adviceText = item.aiAdviceTa || item.aiAdvice;
      reason = item.aiAdviceReason;
    } else if (isKn) {
      cropName = item.cropKn || item.crop;
      yardName = item.yardKn || item.yard;
      adviceText = item.aiAdviceKn || item.aiAdvice;
      reason = item.aiAdviceReason;
    }

    const mspDiff = item.pricePerQuintal - item.mspPrice;
    const isAboveMsp = mspDiff >= 0;
    const isHold = item.aiAdvice === 'HOLD';

    return `
      <div class="mandi-card ${isHold ? 'hold' : 'sell'}">
        <div class="mandi-card-header">
          <div>
            <h3 class="mandi-crop-title">${cropName}</h3>
            <span class="mandi-yard-tag"><i class="fa-solid fa-location-dot"></i> ${yardName}</span>
          </div>
          <span class="mandi-advice-badge ${isHold ? 'hold' : 'sell'}">
            ${isHold ? '🔒 ' + adviceText : '⚡ ' + adviceText}
          </span>
        </div>

        <div class="mandi-price-row">
          <div>
            <span class="mandi-price-lbl">${window.i18n.t('mandiPricePerQ') || "Today's Price"}</span>
            <div class="mandi-price-val">₹${item.pricePerQuintal.toLocaleString()} <small>/ Qtl</small></div>
          </div>
          <div class="mandi-trend-box ${item.trend}">
            <span class="mandi-trend-tag">${item.trend === 'up' ? '▲' : '▼'} ${item.change24h}</span>
          </div>
        </div>

        <div class="mandi-meta-grid">
          <div class="mandi-meta-item">
            <span class="mm-lbl">${window.i18n.t('mandiMsp') || "Govt MSP"}:</span>
            <span class="mm-val">₹${item.mspPrice.toLocaleString()}</span>
          </div>
          <div class="mandi-meta-item">
            <span class="mm-lbl">MSP Spread:</span>
            <span class="mm-val ${isAboveMsp ? 'green' : 'red'}">${isAboveMsp ? '+₹' + mspDiff.toLocaleString() + ' (Above MSP)' : '-₹' + Math.abs(mspDiff)}</span>
          </div>
          <div class="mandi-meta-item">
            <span class="mm-lbl">${window.i18n.t('mandiArrival') || "Arrivals"}:</span>
            <span class="mm-val">${item.arrivalQty}</span>
          </div>
          <div class="mandi-meta-item">
            <span class="mm-lbl">Updated:</span>
            <span class="mm-val">${item.updatedTime}</span>
          </div>
        </div>

        <div class="mandi-ai-reason">
          <p><i class="fa-solid fa-brain" style="color: var(--primary-green);"></i> <strong>AI Insight:</strong> ${reason}</p>
        </div>
      </div>
    `;
  }).join('');
}

function handleMandiFilterChange() {
  const crop = document.getElementById('mandiCropFilterSelect')?.value || 'all';
  const yard = document.getElementById('mandiYardFilterSelect')?.value || 'all';
  renderMandiMarket(crop, yard);
}

/* =============================================
   TOAST NOTIFICATION ENGINE
   ============================================= */
function showToast(message, type = 'success', duration = 3200) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-pill ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : (type === 'warning' ? '⚠️' : 'ℹ️')}</span>
    <span class="toast-text">${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* =============================================
   FARMER EMERGENCY SOS HELPLINE (1551)
   ============================================= */
function openEmergencyModal() {
  const modal = document.getElementById('emergencyModal');
  if (modal) modal.style.display = 'flex';
}

function closeEmergencyModal() {
  const modal = document.getElementById('emergencyModal');
  if (modal) modal.style.display = 'none';
}



