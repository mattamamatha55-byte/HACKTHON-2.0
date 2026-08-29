/**
 * Smart Farming Assistant - Chart.js Manager
 * Renders interactive real-time dashboard and soil metrics graphs
 * Full 5-Language Support: English (en), Telugu (te), Hindi (hi), Tamil (ta), Kannada (kn)
 */

let moistureChartInstance = null;
let rainChartInstance = null;
let npkChartInstance = null;

const CHART_I18N = {
  days: {
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    te: ['సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని', 'ఆది'],
    hi: ['सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'],
    ta: ['திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி', 'ஞாயிறு'],
    kn: ['ಸೋಮ', 'ಮಂಗಳ', 'ಬುಧ', 'ಗುರು', 'ಶುಕ್ರ', 'ಶನಿ', 'ಭಾನು']
  },
  forecastDays: {
    en: ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'],
    te: ['నేడు', 'రేపు', '3వ రోజు', '4వ రోజు', '5వ రోజు'],
    hi: ['आज', 'कल', 'तीसरा दिन', 'चौथा दिन', 'पाँचवाँ दिन'],
    ta: ['இன்று', 'நாளை', 'நாள் 3', 'நாள் 4', 'நாள் 5'],
    kn: ['ಇಂದು', 'ನಾಳೆ', 'ದಿನ 3', 'ದಿನ 4', 'ದಿನ 5']
  },
  moistureLabel: {
    en: 'Soil Moisture (%)',
    te: 'నేల తేమ (%)',
    hi: 'मृदा नमी (%)',
    ta: 'மண் ஈரப்பதம் (%)',
    kn: 'ಮಣ್ಣಿನ ತೇವಾಂಶ (%)'
  },
  tempLabel: {
    en: 'Temperature (°C)',
    te: 'ఉష్ణోగ్రత (°C)',
    hi: 'तापमान (°C)',
    ta: 'வெப்பநிலை (°C)',
    kn: 'ತಾಪಮಾನ (°C)'
  },
  rainfallLabel: {
    en: 'Rainfall (mm)',
    te: 'వర్షపాతం (మి.మీ)',
    hi: 'वर्षा (मिमी)',
    ta: 'மழைப்பொழிவு (மிமீ)',
    kn: 'ಮಳೆ (ಮಿಮೀ)'
  },
  npkNutrients: {
    en: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
    te: ['నత్రజని (N)', 'భాస్వరం (P)', 'పొటాషియం (K)'],
    hi: ['नाइट्रोजन (N)', 'फास्फोरस (P)', 'पोटाश (K)'],
    ta: ['நைட்ரஜன் (N)', 'பாஸ்பரஸ் (P)', 'பொட்டாசியம் (K)'],
    kn: ['ಸಾರಜನಕ (N)', 'ರಂಜಕ (P)', 'ಪೊಟ್ಯಾಶ್ (K)']
  },
  measuredLabel: {
    en: 'Measured Soil Value (kg/ha)',
    te: 'ల్యాబ్ పఠనం (kg/ha)',
    hi: 'मापा गया मान (kg/ha)',
    ta: 'அளவிடப்பட்ட மதிப்பு (kg/ha)',
    kn: 'ಅಳತೆ ಮಾಡಿದ ಮೌಲ್ಯ (kg/ha)'
  },
  targetLabel: {
    en: 'Target Baseline (kg/ha)',
    te: 'ఆదర్శవంతమైన విలువ',
    hi: 'आदर्श मानक स्तर',
    ta: 'இலக்கு நிலை',
    kn: 'ಸೂಕ್ತ ಮಟ್ಟ'
  }
};

function getChartLang() {
  const lang = (window.i18n && window.i18n.currentLang) || 'te';
  return CHART_I18N.days[lang] ? lang : 'en';
}

function initDashboardCharts() {
  const lang = getChartLang();

  // 1. Soil Moisture & Temp Line Chart
  const ctxMoisture = document.getElementById('moistureChart');
  if (ctxMoisture && window.Chart) {
    if (moistureChartInstance) moistureChartInstance.destroy();
    
    moistureChartInstance = new Chart(ctxMoisture, {
      type: 'line',
      data: {
        labels: CHART_I18N.days[lang],
        datasets: [
          {
            label: CHART_I18N.moistureLabel[lang],
            data: [38, 40, 45, 42, 44, 41, 42],
            borderColor: '#2d6a4f',
            backgroundColor: 'rgba(45, 106, 79, 0.12)',
            tension: 0.4,
            fill: true,
            borderWidth: 3
          },
          {
            label: CHART_I18N.tempLabel[lang],
            data: [32, 33, 30, 31, 34, 32, 31],
            borderColor: '#d97706',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: { beginAtZero: false }
        }
      }
    });
  }

  // 2. Weekly Rainfall Forecast Bar Chart
  const ctxRain = document.getElementById('rainChart');
  if (ctxRain && window.Chart) {
    if (rainChartInstance) rainChartInstance.destroy();

    rainChartInstance = new Chart(ctxRain, {
      type: 'bar',
      data: {
        labels: CHART_I18N.forecastDays[lang],
        datasets: [{
          label: CHART_I18N.rainfallLabel[lang],
          data: [15, 8, 2, 0, 35],
          backgroundColor: [
            '#40916c',
            '#52b788',
            '#74c69d',
            '#95d5b2',
            '#dc2626'
          ],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  // 3. Soil NPK Nutrient Bar Chart
  updateSoilNPKChart(240, 18, 160);
}

function updateSoilNPKChart(N = 240, P = 18, K = 160) {
  const ctxNPK = document.getElementById('npkChart');
  if (!ctxNPK || !window.Chart) return;
  
  const lang = getChartLang();

  if (npkChartInstance) npkChartInstance.destroy();

  npkChartInstance = new Chart(ctxNPK, {
    type: 'bar',
    data: {
      labels: CHART_I18N.npkNutrients[lang],
      datasets: [
        {
          label: CHART_I18N.measuredLabel[lang],
          data: [N, P, K],
          backgroundColor: '#2d6a4f',
          borderRadius: 6
        },
        {
          label: CHART_I18N.targetLabel[lang],
          data: [350, 18, 200],
          backgroundColor: 'rgba(217, 119, 6, 0.45)',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Re-render chart text when language is toggled
window.onLanguageChanged = function() {
  initDashboardCharts();
};

window.ChartsManager = {
  initDashboardCharts,
  updateSoilNPKChart
};
