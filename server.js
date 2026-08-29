const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for memory upload handling
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Database Mock Data
const weatherData = {
  guntur: {
    district: "Guntur",
    state: "Andhra Pradesh",
    temp: 31,
    humidity: 78,
    wind: 14,
    rainProb: 65,
    uvIndex: 7,
    condition: "Partly Cloudy with Scattered Showers",
    forecast: [
      { day: "Today", temp: "31°C", rain: "65%", status: "Light Rain" },
      { day: "Tomorrow", temp: "32°C", rain: "30%", status: "Partly Cloudy" },
      { day: "Day 3", temp: "34°C", rain: "10%", status: "Sunny" },
      { day: "Day 4", temp: "33°C", rain: "20%", status: "Clear" },
      { day: "Day 5", temp: "30°C", rain: "80%", status: "Heavy Rain Alert" }
    ],
    advisory: {
      en: "High humidity levels detected (78%). Postpone pesticide spraying until tomorrow morning to avoid runoff. Excellent window for fertilizer application after rain stops.",
      te: "అధిక ఆర్ద్రత (78%) నమోదైంది. పురుగుమందుల పిచికారీని రేపు ఉదయానికి వాయిదా వేయండి. వర్షం తగ్గిన తర్వాత ఎరువులు వేయడానికి అనుకూల వాతావరణం."
    }
  },
  vijayawada: {
    district: "Vijayawada (Krishna)",
    state: "Andhra Pradesh",
    temp: 33,
    humidity: 72,
    wind: 12,
    rainProb: 40,
    uvIndex: 8,
    condition: "Warm & Humid",
    forecast: [
      { day: "Today", temp: "33°C", rain: "40%", status: "Cloudy" },
      { day: "Tomorrow", temp: "35°C", rain: "15%", status: "Sunny" },
      { day: "Day 3", temp: "35°C", rain: "10%", status: "Sunny" },
      { day: "Day 4", temp: "32°C", rain: "50%", status: "Thunderstorm" },
      { day: "Day 5", temp: "31°C", rain: "40%", status: "Light Showers" }
    ],
    advisory: {
      en: "Suitable weather for paddy field drainage control. Monitor crop for brown plant hopper activity due to humid warmth.",
      te: "వరి పొలాల్లో నీటి పారుదల నిర్వహణకు అనుకూల వాతావరణం. ఉష్ణోగ్రత మరియు తేమ కారణంగా సుడి దోమ ఉధృతిని గమనించండి."
    }
  },
  warangal: {
    district: "Warangal",
    state: "Telangana",
    temp: 29,
    humidity: 82,
    wind: 16,
    rainProb: 75,
    uvIndex: 5,
    condition: "Moderate Rain Expected",
    forecast: [
      { day: "Today", temp: "29°C", rain: "75%", status: "Moderate Rain" },
      { day: "Tomorrow", temp: "28°C", rain: "60%", status: "Overcast" },
      { day: "Day 3", temp: "30°C", rain: "25%", status: "Partly Cloudy" },
      { day: "Day 4", temp: "32°C", rain: "10%", status: "Sunny" },
      { day: "Day 5", temp: "33°C", rain: "15%", status: "Clear" }
    ],
    advisory: {
      en: "Moderate rainfall expected today. Ensure proper water drainage channels in Cotton and Chilli fields to avoid root rot.",
      te: "ఈరోజు ఓ మోస్తరు వర్ష సూచన ఉంది. పత్తి మరియు మిర్చి తోటల్లో వేరు కుళ్ళు తెగులు రాకుండా నీరు నిల్వ ఉండకుండా కాలువలు తీయండి."
    }
  },
  anantapur: {
    district: "Anantapur",
    state: "Andhra Pradesh",
    temp: 36,
    humidity: 45,
    wind: 20,
    rainProb: 15,
    uvIndex: 9,
    condition: "Hot & Dry",
    forecast: [
      { day: "Today", temp: "36°C", rain: "15%", status: "Hot & Dry" },
      { day: "Tomorrow", temp: "37°C", rain: "10%", status: "Very Hot" },
      { day: "Day 3", temp: "36°C", rain: "20%", status: "Partly Cloudy" },
      { day: "Day 4", temp: "34°C", rain: "35%", status: "Windy" },
      { day: "Day 5", temp: "35°C", rain: "10%", status: "Sunny" }
    ],
    advisory: {
      en: "High evaporation rates. Execute drip irrigation during early morning hours (5 AM - 8 AM) to save up to 40% water in Groundnut crops.",
      te: "అధిక ఆవిరి శాతం ఉంది. వేరుశనగ పంటకు నీటి వృధాను తగ్గించడానికి ఉదయం 5 నుండి 8 గంటల మధ్య బిందు సేద్యం నిర్వహించండి."
    }
  },
  visakhapatnam: {
    district: "Visakhapatnam",
    state: "Andhra Pradesh",
    temp: 30,
    humidity: 85,
    wind: 18,
    rainProb: 50,
    uvIndex: 6,
    condition: "Coastal Humid Breezes",
    forecast: [
      { day: "Today", temp: "30°C", rain: "50%", status: "Coastal Rain" },
      { day: "Tomorrow", temp: "31°C", rain: "40%", status: "Humid" },
      { day: "Day 3", temp: "32°C", rain: "30%", status: "Partly Cloudy" },
      { day: "Day 4", temp: "31°C", rain: "20%", status: "Breezy" },
      { day: "Day 5", temp: "30°C", rain: "60%", status: "Rain" }
    ],
    advisory: {
      en: "Coastal humidity elevated. Recommended preventative spray of Copper Oxychloride for sugarcane and fruit orchards.",
      te: "తీరప్రాంత తేమ ఎక్కువ. చెరకు మరియు పండ్ల తోటలకు కాపర్ ఆక్సిక్లోరైడ్ నివారణ పిచికారీ సిఫార్సు చేయబడింది."
    }
  }
};

// Preset Disease Detection Database
const diseaseDatabase = {
  tomato_blight: {
    crop: "Tomato (టమాటా)",
    diseaseEn: "Tomato Late Blight (Phytophthora infestans)",
    diseaseTe: "టమాటా లేట్ బ్లైట్ తెగులు",
    severity: "High",
    confidence: 96.4,
    symptomsEn: [
      "Dark water-soaked spots on lower leaves",
      "White fungal mold growing under leaves in moist weather",
      "Rapid wilting and leaf browning"
    ],
    symptomsTe: [
      "ఆకుల అడుగు భాగంలో నల్లటి నీటి మచ్చలు",
      "తేమతో కూడిన వాతావరణంలో ఆకుల కింద తెల్లటి బూజు",
      "ఆకులు వేగంగా ఎండిపోవడం"
    ],
    organicRemedyEn: "Spray Neem Oil (5ml/liter of water) or Trichoderma viride solution every 7 days. Remove affected lower leaves.",
    organicRemedyTe: "వేప నూనె (లీటరు నీటికి 5 మి.లీ) లేదా ట్రైకోడెర్మా విరిడే ద్రావణాన్ని ప్రతి 7 రోజులకు పిచికారీ చేయండి. సోకిన ఆకులను తీసివేసి కాల్చండి.",
    chemicalRemedyEn: "Spray Mancozeb 75% WP @ 2.5 g/L or Ridomil Gold @ 2 g/L during early infection stage.",
    chemicalRemedyTe: "మాంకోజెబ్ 75% WP లీటరు నీటికి 2.5 గ్రాములు లేదా రిడోమిల్ గోల్డ్ 2 గ్రాములు కలిపి పిచికారీ చేయండి."
  },
  rice_blast: {
    crop: "Paddy / Rice (వరి)",
    diseaseEn: "Rice Leaf Blast (Magnaporthe oryzae)",
    diseaseTe: "వరి అగ్గి తెగులు (బ్లాస్ట్)",
    severity: "High",
    confidence: 94.8,
    symptomsEn: [
      "Spindle-shaped spots with ash-grey centers on leaves",
      "Brown margins around lesions",
      "Stunted crop growth and seedling death"
    ],
    symptomsTe: [
      "ఆకులపై కంటి ఆకారంలో బూడిద రంగు మచ్చలు",
      "మచ్చల చుట్టూ గోధుమ రంగు సరిహద్దులు",
      "పంట ఎదుగుదల లోపించడం"
    ],
    organicRemedyEn: "Apply Pseudomonas fluorescens @ 10g/L spray. Avoid excess Nitrogen application.",
    organicRemedyTe: "సూడోమోనాస్ ఫ్లోరోసెన్స్ 10 గ్రాములు లీటరు నీటికి కలిపి పిచికారీ చేయండి. నత్రజని ఎరువుల వాడకాన్ని తగ్గించండి.",
    chemicalRemedyEn: "Spray Tricyclazole 75% WP @ 0.6 g/L or Isoprothiolane 40% EC @ 1.5 ml/L.",
    chemicalRemedyTe: "ట్రైసైక్లజోల్ 75% WP లీటరు నీటికి 0.6 గ్రాములు లేదా ఐసోప్రోథియోలేన్ 1.5 మి.లీ పిచికారీ చేయండి."
  },
  cotton_bacterial: {
    crop: "Cotton (పత్తి)",
    diseaseEn: "Bacterial Blight / Angular Leaf Spot",
    diseaseTe: "పత్తి కోణీయ మచ్చ / బాక్టీరియల్ బ్లైట్ తెగులు",
    severity: "Medium",
    confidence: 92.1,
    symptomsEn: [
      "Angular water-soaked lesions bounded by leaf veins",
      "Blackening of leaf petioles and young bolls",
      "Defoliation in severe cases"
    ],
    symptomsTe: [
      "ఆకు ఈనెలకు లోబడి ఉన్న నీటి మచ్చలు",
      "తోడెలు మరియు పత్తి కాయలు నల్లబడటం",
      "ఆకులు రాలిపోవడం"
    ],
    organicRemedyEn: "Soak seeds in Streptocycline solution before planting. Spray Copper Hydroxide + Neem extract.",
    organicRemedyTe: "విత్తనాలను స్ట్రెప్టోసైక్లిన్ ద్రావణంలో నానబెట్టండి. కాపర్ హైడ్రాక్సైడ్ + వేప కషాయం పిచికారీ చేయండి.",
    chemicalRemedyEn: "Spray Copper Oxychloride 3g/L + Streptocycline 0.1g/L of water twice at 12-day interval.",
    chemicalRemedyTe: "కాపర్ ఆక్సిక్లోరైడ్ 3 గ్రాములు + స్ట్రెప్టోసైక్లిన్ 0.1 గ్రాము లీటరు నీటికి కలిపి 12 రోజుల వ్యవధిలో రెండుసార్లు పిచికారీ చేయండి."
  },
  healthy_leaf: {
    crop: "General Crop (ఆరోగ్యకరమైన పంట)",
    diseaseEn: "Healthy Crop - No Disease Detected",
    diseaseTe: "ఆరోగ్యకరమైన పంట - ఎలాంటి తెగులు లేదు",
    severity: "None",
    confidence: 98.9,
    symptomsEn: ["Lush green leaves", "No fungal spots or pest damage", "Strong structural stem growth"],
    symptomsTe: ["పచ్చటి పసిమిగల ఆకులు", "మచ్చలు లేదా పురుగు కాటు లేకపోవడం", "బలమైన మొక్క నిర్మాణం"],
    organicRemedyEn: "Maintain current organic compost mulching and regular watering cycle.",
    organicRemedyTe: "ప్రస్తుత సేంద్రీయ ఎరువుల నిర్వహణ మరియు క్రమబద్ధమైన నీటి యాజమాన్యం కొనసాగించండి.",
    chemicalRemedyEn: "No chemical sprays required. Preventative neem spray recommended after rain.",
    chemicalRemedyTe: "రసాయనిక మందులు అవసరం లేదు. వర్షం తర్వాత ముందుజాగ్రత్తగా వేప నూనె పిచికారీ చేయవచ్చు."
  }
};

// --- API ROUTES ---

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: "OK", app: "Smart Farming Assistant API", version: "1.0.0" });
});

// Weather API
app.get('/api/weather', (req, res) => {
  const district = (req.query.district || 'guntur').toLowerCase();
  const data = weatherData[district] || weatherData['guntur'];
  res.json({ success: true, data });
});

// Disease Detection API (Upload or preset key)
app.post('/api/disease-detect', upload.single('cropImage'), (req, res) => {
  const preset = req.body.presetKey;
  let result;
  
  if (preset && diseaseDatabase[preset]) {
    result = diseaseDatabase[preset];
  } else {
    // Random selection/mock model inference if custom image uploaded
    const keys = Object.keys(diseaseDatabase);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    result = diseaseDatabase[randomKey];
  }
  
  setTimeout(() => {
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      detection: result
    });
  }, 1000); // Realistic 1-second simulated delay
});

// Smart Irrigation Calculator API
app.post('/api/irrigation-recommend', (req, res) => {
  const { crop, soilType, growthStage, acres } = req.body;
  const area = parseFloat(acres) || 1;

  // Base water multiplier (Liters / acre / day)
  const cropWaterMap = {
    paddy: { base: 12000, dripSupport: true },
    cotton: { base: 6500, dripSupport: true },
    chilli: { base: 5500, dripSupport: true },
    maize: { base: 7000, dripSupport: true },
    groundnut: { base: 4800, dripSupport: true },
    tomato: { base: 5000, dripSupport: true }
  };

  const soilFactorMap = {
    sandy: 1.25,  // High percolation
    loamy: 1.0,   // Optimal
    clay: 0.85    // High retention
  };

  const stageFactorMap = {
    initial: 0.6,
    vegetative: 1.0,
    flowering: 1.3, // Peak requirement
    harvesting: 0.5
  };

  const selectedCrop = cropWaterMap[crop] || cropWaterMap['paddy'];
  const soilMult = soilFactorMap[soilType] || 1.0;
  const stageMult = stageFactorMap[growthStage] || 1.0;

  const totalWaterLiters = Math.round(selectedCrop.base * area * soilMult * stageMult);
  const pumpRuntimeHours = (totalWaterLiters / 3500).toFixed(1); // Assuming 3500 L/hr pump capacity
  const dripSchedule = `${Math.round(totalWaterLiters / 2)} Liters at 6:00 AM & ${Math.round(totalWaterLiters / 2)} Liters at 5:30 PM`;
  const waterSavedPercent = 35; // Drip vs Flood savings

  res.json({
    success: true,
    recommendation: {
      crop,
      soilType,
      growthStage,
      acres: area,
      totalWaterLiters,
      pumpRuntimeHours,
      dripSchedule,
      waterSavedPercent,
      tipsEn: [
        "Use soil moisture sensors or stick test before starting pump",
        "Irrigate during early morning or late evening to cut evapotranspiration",
        "Maintain organic leaf mulch around root zones to hold moisture 48h longer"
      ],
      tipsTe: [
        "మోటారు ఆన్ చేసే ముందు ఆరు అంగుళాల లోతులో మట్టి తేమను పరిశీలించండి",
        "ఆవిరి వృధాను నివారించడానికి ఉదయం లేదా సాయంత్రం వేళల్లో నీటి పారుదల చేయండి",
        "మొక్కల మొదళ్ల వద్ద ఎండుటాకుల ఆచ్ఛాదన (ముల్చింగ్) చేసి తేమను నిలపండి"
      ]
    }
  });
});

// Soil Health Analysis API
app.post('/api/soil-analysis', (req, res) => {
  const { nitrogen, phosphorus, potassium, ph } = req.body;
  const N = parseFloat(nitrogen) || 0;
  const P = parseFloat(phosphorus) || 0;
  const K = parseFloat(potassium) || 0;
  const pHVal = parseFloat(ph) || 7.0;

  // Ideal target ranges (kg/ha)
  // N: 280-560, P: 10-25, K: 110-280, pH: 6.5-7.5
  let nStatus = N < 280 ? "Deficient" : (N > 560 ? "Excess" : "Optimal");
  let pStatus = P < 10 ? "Deficient" : (P > 25 ? "Excess" : "Optimal");
  let kStatus = K < 110 ? "Deficient" : (K > 280 ? "Excess" : "Optimal");

  let phStatus = "Neutral";
  if (pHVal < 6.5) phStatus = "Acidic";
  if (pHVal > 7.5) phStatus = "Alkaline";

  // Calculate Fertilizer Recommendations per acre
  let fertilizerListEn = [];
  let fertilizerListTe = [];

  if (nStatus === "Deficient") {
    fertilizerListEn.push("Urea: Apply 45-50 kg/acre in split doses at vegetative & flowering stage");
    fertilizerListTe.push("యూరియా: ఎకరానికి 45-50 కిలోలు పైపాటుగా రెండు విడతల్లో వేయండి");
  }
  if (pStatus === "Deficient") {
    fertilizerListEn.push("DAP (Single Super Phosphate): Apply 50 kg/acre as basal dose during land preparation");
    fertilizerListTe.push("డి.ఎ.పి (DAP): దుక్కిలో ఎకరానికి 50 కిలోలు ఆఖరి దుక్కిలో చల్లండి");
  }
  if (kStatus === "Deficient") {
    fertilizerListEn.push("MOP (Muriate of Potash): Apply 25-30 kg/acre for berry/grain weight enhancement");
    fertilizerListTe.push("పొటాష్ (MOP): గింజ/కాయ నాణ్యత పెరగడానికి ఎకరానికి 25-30 కిలోలు వేయండి");
  }

  if (phStatus === "Acidic") {
    fertilizerListEn.push("Agricultural Lime: Apply 100 kg/acre to treat soil acidity");
    fertilizerListTe.push("సున్నం (Lime): మట్టి ఆమ్లత్వాన్ని తగ్గించడానికి ఎకరానికి 100 కిలోలు చల్లండి");
  } else if (phStatus === "Alkaline") {
    fertilizerListEn.push("Gypsum / Organic Compost: Apply 150 kg Gypsum/acre or 2 tons Neem Farmyard Manure");
    fertilizerListTe.push("జిప్సం / వేప పిండి: క్షారత్వాన్ని సవరించడానికి ఎకరానికి 150 కిలోల జిప్సం వేయండి");
  }

  if (fertilizerListEn.length === 0) {
    fertilizerListEn.push("Soil nutrient balance is EXCELLENT! Continue regular organic vermicompost maintenance.");
    fertilizerListTe.push("నేల పోషకాలు అత్యుత్తమ సమతుల్యతలో ఉన్నాయి! సేంద్రీయ వర్మీకంపోస్ట్ వాడకం కొనసాగించండి.");
  }

  res.json({
    success: true,
    analysis: {
      N: { value: N, status: nStatus, target: "280 - 560 kg/ha" },
      P: { value: P, status: pStatus, target: "10 - 25 kg/ha" },
      K: { value: K, status: kStatus, target: "110 - 280 kg/ha" },
      pH: { value: pHVal, status: phStatus, target: "6.5 - 7.5" },
      recommendationsEn: fertilizerListEn,
      recommendationsTe: fertilizerListTe
    }
  });
});

// Pest & Disease Alerts API
app.get('/api/pest-alerts', (req, res) => {
  res.json({
    success: true,
    alerts: [
      {
        id: 1,
        crop: "Chilli / Pepper (మిర్చి)",
        pestEn: "Black Thrips (Thrips parvispinus) Outbreak",
        pestTe: "నల్ల తామర పురుగు (బ్లాక్ థ్రిప్స్) ఉధృతి",
        severity: "High",
        district: "Guntur & Prakasam",
        date: "2026-08-28",
        advisoryEn: "Sticky blue trap installation @ 20/acre recommended. Spray Spinetoram 11.7 SC @ 1 ml/L or Fipronil 5 SC @ 2 ml/L.",
        advisoryTe: "ఎకరానికి 20 నీలిరంగు జిగురు అట్టలు ఏర్పాటు చేయండి. స్పైనెటోరామ్ 1 మి.లీ లేదా ఫిప్రోనిల్ 2 మి.లీ పిచికారీ చేయండి."
      },
      {
        id: 2,
        crop: "Paddy / Rice (వరి)",
        pestEn: "Brown Plant Hopper (BPH) Warning",
        pestTe: "సుడి దోమ (బి.పి.హెచ్) హెచ్చరిక",
        severity: "Medium",
        district: "Krishna & West Godavari",
        date: "2026-08-27",
        advisoryEn: "Drain stagnant water from paddy fields for 3 days. Spray Triflumezopyrim 10% SC @ 0.5 ml/L directed at stem base.",
        advisoryTe: "పొలంలోని నీటిని 3 రోజులు బయటకు పంపండి. మొక్కల మొదళ్ల వద్ద ట్రైఫ్లూమెజోపైరిమ్ 0.5 మి.లీ పిచికారీ చేయండి."
      },
      {
        id: 3,
        crop: "Cotton (పత్తి)",
        pestEn: "Pink Bollworm Larvae Risk",
        pestTe: "గులాబీ రంగు రంధ్రాలు చేసే పురుగు",
        severity: "High",
        district: "Warangal & Khammam",
        date: "2026-08-25",
        advisoryEn: "Install Pheromone traps @ 5/acre for monitoring. Destroy rosette flowers immediately.",
        advisoryTe: "గమనించడానికి ఎకరానికి 5 లింగ ఆకర్షణ బుట్టలు ఏర్పాటు చేయండి. గులాబీ పువ్వు ఆకృతిలో ఉన్న పువ్వులను ఏరి నాశనం చేయండి."
      }
    ]
  });
});

// Preset Farmer Profiles Database
const farmerProfilesDatabase = {
  ramesh: {
    id: "RS-AP-2026-8891",
    presetId: "ramesh",
    name: "Ramesh Reddy",
    nameTe: "రామేష్ రెడ్డి",
    phone: "+91 98765 43210",
    email: "ramesh.reddy.farmer@gmail.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    state: "Andhra Pradesh",
    district: "guntur",
    districtName: "Guntur (గుంటూరు)",
    mandal: "Tenali (తెనాలి)",
    village: "Kollipara (కొల్లిపర)",
    pincode: "522304",
    preferredLang: "te",
    kisanCardNo: "AP-GNT-2024-99120",
    pmKisanId: "PMK-88392019",
    rythuBharosaId: "RB-2026-44019",
    totalLand: 3.5,
    landUnit: "Acres",
    soilType: "loamy",
    primaryCrops: ["Cotton", "Chilli", "Tomato"],
    irrigationSource: "Drip Irrigation & Borewell",
    pumpHp: 3.5,
    joinedDate: "Jan 2024",
    scansCount: 14,
    waterSavedLiters: 184500,
    activePlots: [
      { id: "plot-1", name: "North Field (Plot 1)", crop: "Cotton", acres: 2.0, stage: "flowering", stageLabel: "Flowering & Fruiting", health: 94 },
      { id: "plot-2", name: "South Field (Plot 2)", crop: "Chilli", acres: 1.5, stage: "vegetative", stageLabel: "Growing Stage", health: 88 }
    ],
    schemes: [
      { name: "Rythu Bharosa 2026", benefit: "₹13,500 / year", status: "Active (Credited)", date: "15 Jan 2026", badge: "success" },
      { name: "PM-KISAN Samman Nidhi", benefit: "₹6,000 / year", status: "Active (16th Installment)", date: "28 Feb 2026", badge: "success" },
      { name: "AP Micro-Irrigation Drip Subsidy", benefit: "90% Subsidy Approved", status: "Installed & Verified", date: "10 Nov 2025", badge: "info" },
      { name: "PM Fasal Bima Yojana (Crop Insurance)", benefit: "Sum Insured ₹1,20,000", status: "Active Policy", date: "Kharif 2026", badge: "warning" }
    ],
    scanHistory: [
      { date: "2026-08-28", crop: "Tomato", issue: "Tomato Late Blight", severity: "High", action: "Mancozeb 75% WP sprayed" },
      { date: "2026-08-20", crop: "Chilli", issue: "Chilli Black Thrips", severity: "High", action: "Blue Sticky Traps installed" },
      { date: "2026-08-10", crop: "Cotton", issue: "Healthy Leaf", severity: "None", action: "Nutrient balance checked" }
    ]
  },
  lakshmi: {
    id: "RS-AP-2026-4412",
    presetId: "lakshmi",
    name: "Lakshmi Devi",
    nameTe: "లక్ష్మీ దేవి",
    phone: "+91 94401 23456",
    email: "lakshmi.devi.agri@gmail.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    state: "Andhra Pradesh",
    district: "vijayawada",
    districtName: "Krishna / Vijayawada (కృష్ణా)",
    mandal: "Gannavaram (గన్నవరం)",
    village: "Mustabad (ముస్తాబాద్)",
    pincode: "521101",
    preferredLang: "te",
    kisanCardNo: "AP-KRI-2023-55821",
    pmKisanId: "PMK-99014285",
    rythuBharosaId: "RB-2026-11890",
    totalLand: 2.0,
    landUnit: "Acres",
    soilType: "clay",
    primaryCrops: ["Paddy", "Tomato"],
    irrigationSource: "Krishna Canal & Borewell",
    pumpHp: 5.0,
    joinedDate: "Mar 2024",
    scansCount: 9,
    waterSavedLiters: 92000,
    activePlots: [
      { id: "plot-1", name: "Canal Side Field", crop: "Paddy", acres: 1.5, stage: "vegetative", stageLabel: "Growing Stage", health: 96 },
      { id: "plot-2", name: "Homestead Garden", crop: "Tomato", acres: 0.5, stage: "flowering", stageLabel: "Flowering & Fruiting", health: 90 }
    ],
    schemes: [
      { name: "Rythu Bharosa 2026", benefit: "₹13,500 / year", status: "Active (Credited)", date: "15 Jan 2026", badge: "success" },
      { name: "PM-KISAN Samman Nidhi", benefit: "₹6,000 / year", status: "Active (16th Installment)", date: "28 Feb 2026", badge: "success" },
      { name: "AP Free Crop Insurance Scheme", benefit: "100% Govt Premium", status: "Active (Paddy & Tomato)", date: "Kharif 2026", badge: "info" }
    ],
    scanHistory: [
      { date: "2026-08-25", crop: "Rice", issue: "Rice Leaf Blast", severity: "High", action: "Tricyclazole 75% WP applied" },
      { date: "2026-08-14", crop: "Tomato", issue: "Healthy Leaf", severity: "None", action: "Organic mulch maintained" }
    ]
  },
  srinivas: {
    id: "RS-TG-2026-7731",
    presetId: "srinivas",
    name: "Srinivas Rao",
    nameTe: "శ్రీనివాస రావు",
    phone: "+91 98490 87654",
    email: "srinivas.rao.warangal@gmail.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    state: "Telangana",
    district: "warangal",
    districtName: "Warangal (వరంగల్)",
    mandal: "Narsampet (నర్సంపేట)",
    village: "Chennaraopet (చెన్నారావుపేట)",
    pincode: "506132",
    preferredLang: "te",
    kisanCardNo: "TG-WGL-2024-33829",
    pmKisanId: "PMK-77401928",
    rythuBharosaId: "RB-TG-2026-7810",
    totalLand: 5.0,
    landUnit: "Acres",
    soilType: "loamy",
    primaryCrops: ["Maize", "Groundnut", "Cotton"],
    irrigationSource: "Deep Borewell & Drip",
    pumpHp: 7.5,
    joinedDate: "Feb 2023",
    scansCount: 22,
    waterSavedLiters: 310000,
    activePlots: [
      { id: "plot-1", name: "Main Farm Plot 1", crop: "Maize", acres: 2.5, stage: "vegetative", stageLabel: "Vegetative Stage", health: 91 },
      { id: "plot-2", name: "South Drip Plot", crop: "Groundnut", acres: 2.5, stage: "flowering", stageLabel: "Flowering Stage", health: 95 }
    ],
    schemes: [
      { name: "Rythu Bandhu / Bharosa (Telangana)", benefit: "₹15,000 / year", status: "Active (Credited)", date: "10 Jan 2026", badge: "success" },
      { name: "PM-KISAN Samman Nidhi", benefit: "₹6,000 / year", status: "Active (16th Installment)", date: "28 Feb 2026", badge: "success" },
      { name: "National Mission on Micro Irrigation", benefit: "80% Drip Subsidy", status: "Installed", date: "Aug 2024", badge: "info" }
    ],
    scanHistory: [
      { date: "2026-08-27", crop: "Maize", issue: "Fall Armyworm", severity: "High", action: "Emamectin benzoate spray" },
      { date: "2026-08-18", crop: "Groundnut", issue: "Tikka Leaf Spot", severity: "Medium", action: "Hexaconazole applied" }
    ]
  },
  anand: {
    id: "RS-AP-2026-9021",
    presetId: "anand",
    name: "Anand Kumar",
    nameTe: "ఆనంద్ కుమార్",
    phone: "+91 97012 34567",
    email: "anand.anantapur.farm@gmail.com",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80",
    state: "Andhra Pradesh",
    district: "anantapur",
    districtName: "Anantapur (అనంతపురం)",
    mandal: "Dharmavaram (ధర్మవరం)",
    village: "Battalapalle (బత్తలపల్లె)",
    pincode: "515661",
    preferredLang: "te",
    kisanCardNo: "AP-ATP-2024-11094",
    pmKisanId: "PMK-66381902",
    rythuBharosaId: "RB-2026-99014",
    totalLand: 4.0,
    landUnit: "Acres",
    soilType: "sandy",
    primaryCrops: ["Groundnut", "Banana"],
    irrigationSource: "Precision Solar Drip & Borewell",
    pumpHp: 5.0,
    joinedDate: "May 2024",
    scansCount: 18,
    waterSavedLiters: 265000,
    activePlots: [
      { id: "plot-1", name: "Drip Groundnut Sector", crop: "Groundnut", acres: 3.0, stage: "flowering", stageLabel: "Pegging / Flowering", health: 92 },
      { id: "plot-2", name: "Orchard Sector", crop: "Banana", acres: 1.0, stage: "vegetative", stageLabel: "Vegetative Stage", health: 89 }
    ],
    schemes: [
      { name: "Rythu Bharosa 2026", benefit: "₹13,500 / year", status: "Active (Credited)", date: "15 Jan 2026", badge: "success" },
      { name: "PM-KISAN Samman Nidhi", benefit: "₹6,000 / year", status: "Active (16th Installment)", date: "28 Feb 2026", badge: "success" },
      { name: "AP Solar Pump Subsidy Scheme", benefit: "70% Subsidy on 5HP Solar Motor", status: "Operational", date: "Jan 2025", badge: "info" }
    ],
    scanHistory: [
      { date: "2026-08-26", crop: "Groundnut", issue: "Tikka Leaf Spot", severity: "Medium", action: "Neem Oil 5ml/L preventative spray" },
      { date: "2026-08-12", crop: "Banana", issue: "Banana Sigatoka", severity: "Medium", action: "Propiconazole spray done" }
    ]
  }
};

let activeUserProfile = JSON.parse(JSON.stringify(farmerProfilesDatabase.ramesh));

// --- USER PROFILE API ROUTES ---

// GET current profile
app.get('/api/profile', (req, res) => {
  res.json({
    success: true,
    profile: activeUserProfile
  });
});

// GET all available presets
app.get('/api/profile/presets', (req, res) => {
  const presetsList = Object.keys(farmerProfilesDatabase).map(k => ({
    id: k,
    name: farmerProfilesDatabase[k].name,
    nameTe: farmerProfilesDatabase[k].nameTe,
    district: farmerProfilesDatabase[k].district,
    totalLand: farmerProfilesDatabase[k].totalLand,
    primaryCrops: farmerProfilesDatabase[k].primaryCrops,
    avatar: farmerProfilesDatabase[k].avatar
  }));
  res.json({ success: true, presets: presetsList });
});

// POST load a preset
app.post('/api/profile/preset/:id', (req, res) => {
  const presetId = req.params.id.toLowerCase();
  if (farmerProfilesDatabase[presetId]) {
    activeUserProfile = JSON.parse(JSON.stringify(farmerProfilesDatabase[presetId]));
    res.json({
      success: true,
      message: `Switched to preset profile: ${activeUserProfile.name}`,
      profile: activeUserProfile
    });
  } else {
    res.status(404).json({ success: false, message: "Preset profile not found" });
  }
});

// POST update profile
app.post('/api/profile', (req, res) => {
  const updates = req.body;
  if (!updates) {
    return res.status(400).json({ success: false, message: "No profile data provided" });
  }

  // Merge updates
  activeUserProfile = {
    ...activeUserProfile,
    ...updates,
    totalLand: parseFloat(updates.totalLand) || activeUserProfile.totalLand,
    pumpHp: parseFloat(updates.pumpHp) || activeUserProfile.pumpHp
  };

  res.json({
    success: true,
    message: "Farmer profile updated successfully",
    profile: activeUserProfile
  });
});

// POST add a new plot
app.post('/api/profile/plot', (req, res) => {
  const { name, crop, acres, stage, health } = req.body;
  if (!name || !crop) {
    return res.status(400).json({ success: false, message: "Plot name and crop required" });
  }

  const newPlot = {
    id: `plot-${Date.now()}`,
    name,
    crop,
    acres: parseFloat(acres) || 1.0,
    stage: stage || "vegetative",
    stageLabel: stage === "flowering" ? "Flowering & Fruiting" : (stage === "initial" ? "Seedling" : "Growing Stage"),
    health: parseInt(health) || 90
  };

  activeUserProfile.activePlots.push(newPlot);
  res.json({
    success: true,
    message: "Plot added successfully",
    plot: newPlot,
    plots: activeUserProfile.activePlots
  });
});

// DELETE a plot
app.delete('/api/profile/plot/:id', (req, res) => {
  const plotId = req.params.id;
  activeUserProfile.activePlots = activeUserProfile.activePlots.filter(p => p.id !== plotId);
  res.json({
    success: true,
    message: "Plot removed successfully",
    plots: activeUserProfile.activePlots
  });
});

// GET Mandi Market Rates
app.get('/api/mandi', (req, res) => {
  const { crop, yard } = req.query;
  const mandiData = [
    {
      id: "mandi-gnt-chilli",
      crop: "Teja Chilli",
      cropTe: "తేజ ఎండుమిర్చి",
      cropHi: "तेजा लाल मिर्च",
      cropTa: "தேஜா காய்ந்த மிளகாய்",
      cropKn: "ತೇಜಾ ಒಣಮೆಣಸಿನಕಾಯಿ",
      cropKey: "chilli",
      district: "guntur",
      yard: "Guntur Mirchi Yard (గుంటూరు)",
      yardTe: "గుంటూరు మార్కెట్ యార్డ్",
      yardHi: "गुंटूर मिर्च मंडी",
      pricePerQuintal: 19850,
      mspPrice: 14200,
      trend: "up",
      change24h: "+₹450 (+2.3%)",
      arrivalQty: "12,400 Bags",
      aiAdvice: "HOLD",
      aiAdviceTe: "నిల్వ ఉంచండి (HOLD)",
      aiAdviceHi: "रोक कर रखें (HOLD)",
      aiAdviceTa: "வைத்திருங்கள் (HOLD)",
      aiAdviceKn: "ಹಿಡಿದಿಟ್ಟುಕೊಳ್ಳಿ (HOLD)",
      aiAdviceReason: "Export demand surging from Southeast Asia. Expect ₹21,000+ within next 10 days.",
      aiAdviceReasonTe: "ఆగ్నేయాసియా దేశాల నుంచి ఎగుమతి డిమాండ్ పెరుగుతోంది. రాబోయే 10 రోజుల్లో క్వింటాలు ₹21,000 దాటే అవకాశం ఉంది.",
      aiAdviceReasonHi: "दक्षिण पूर्व एशिया से भारी निर्यात मांग। अगले 10 दिनों में भाव ₹21,000 पार होने की संभावना।",
      updatedTime: "Live 10:45 AM"
    },
    {
      id: "mandi-wgl-cotton",
      crop: "Cotton (Long Staple)",
      cropTe: "పత్తి (పొడుగు పింజ)",
      cropHi: "कपास (लंबा रेशा)",
      cropTa: "நீண்ட இழை பருத்தி",
      cropKn: "ಉದ್ದ ಎಳೆಯ ಹತ್ತಿ",
      cropKey: "cotton",
      district: "warangal",
      yard: "Warangal Cotton Market (వరంగల్)",
      yardTe: "వరంగల్ కాటన్ మార్కెట్",
      yardHi: "वारंगल कपास मंडी",
      pricePerQuintal: 7680,
      mspPrice: 7122,
      trend: "up",
      change24h: "+₹180 (+2.4%)",
      arrivalQty: "8,650 Quintals",
      aiAdvice: "SELL",
      aiAdviceTe: "ఇప్పుడే అమ్మండి (SELL)",
      aiAdviceHi: "अभी बेचें (SELL)",
      aiAdviceTa: "இப்போதே விற்கவும் (SELL)",
      aiAdviceKn: "ಈಗಲೇ ಮಾರಿ (SELL)",
      aiAdviceReason: "Current price is ₹558 above Govt MSP. Ginning mills actively procuring at premium rates.",
      aiAdviceReasonTe: "ప్రస్తుత ధర ప్రభుత్వ MSP కంటే ₹558 ఎక్కువ. జిన్నింగ్ మిల్లులు మంచి ధరకు కొనుగోలు చేస్తున్నాయి.",
      aiAdviceReasonHi: "वर्तमान भाव समर्थन मूल्य से ₹558 ऊपर है। जिनिंग मिलें प्रीमियम पर खरीद रही हैं।",
      updatedTime: "Live 11:15 AM"
    },
    {
      id: "mandi-vja-paddy",
      crop: "BPT 5204 (Sona Masoori)",
      cropTe: "సోనా మసూరి వరి (BPT 5204)",
      cropHi: "सोना मसूरी धान",
      cropTa: "சோனா மசூரி நெல்",
      cropKn: "ಸೋನಾ ಮಸೂರಿ ಭತ್ತ",
      cropKey: "rice",
      district: "vijayawada",
      yard: "Vijayawada Wholesale APMC (విజయవాడ)",
      yardTe: "విజయవాడ మార్కెట్ యార్డ్",
      yardHi: "विजयवाड़ा मंडी",
      pricePerQuintal: 2540,
      mspPrice: 2320,
      trend: "up",
      change24h: "+₹60 (+2.4%)",
      arrivalQty: "15,200 Quintals",
      aiAdvice: "HOLD",
      aiAdviceTe: "నిల్వ ఉంచండి (HOLD)",
      aiAdviceHi: "रोक कर रखें (HOLD)",
      aiAdviceTa: "வைத்திருங்கள் (HOLD)",
      aiAdviceKn: "ಹಿಡಿದಿಟ್ಟುಕೊಳ್ಳಿ (HOLD)",
      aiAdviceReason: "Festival & wedding season procurement starting next week. Prices projected to touch ₹2,680.",
      aiAdviceReasonTe: "పండుగలు మరియు పెళ్లిళ్ల సీజన్ డిమాండ్ కారణంగా వచ్చే వారం ధరలు ₹2,680కి చేరే అవకాశం ఉంది.",
      aiAdviceReasonHi: "आगामी शादी-त्योहार सीजन के चलते मांग बढ़ेगी। भाव ₹2,680 तक जाने का अनुमान।",
      updatedTime: "Live 09:30 AM"
    }
  ];

  let filtered = mandiData;
  if (crop && crop !== 'all') {
    filtered = filtered.filter(item => item.cropKey.toLowerCase() === crop.toLowerCase() || item.crop.toLowerCase().includes(crop.toLowerCase()));
  }
  if (yard && yard !== 'all') {
    filtered = filtered.filter(item => item.district.toLowerCase() === yard.toLowerCase() || item.yard.toLowerCase().includes(yard.toLowerCase()));
  }

  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🌾 Smart Farming Assistant Server Running!`);
  console.log(`🌐 Local Web App URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});

