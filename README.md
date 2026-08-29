# 🌾 Smart Farming Assistant (RaaituSeva / రైతు సేవ)

A complete, modern, responsive Web Application designed for **College Hackathon Presentations**, empowering Indian farmers with AI-driven crop disease detection, weather sync, precision drip irrigation calculation, soil health NPK analysis, pest outbreak alerts, and full **Telugu (తెలుగు) & English** language support.

---

## ✨ Key Features & Demo Checklist

1. **🌐 Dual Language Support (English & Telugu)**
   - Single-click instant toggle button (`English` <-> `తెలుగు`) in header.
   - All page text, labels, chart legends, weather advisories, and disease remedies update dynamically.

2. **🌾 Home Page & Key Metrics**
   - Hero banner with quick action shortcuts.
   - Impact stats (35% water saved, 96% AI accuracy, 24/7 Helpline).

3. **📊 Farmer Operational Dashboard**
   - Live metrics summary cards (Crop Health Index, Soil Moisture %, Ambient Temp, Active Alerts).
   - **Interactive Chart.js Visualizations**:
     - 7-Day Soil Moisture & Temperature Trend Chart.
     - Weekly Rainfall Forecast Bar Chart.
     - Soil NPK Nutrient Balance Chart.
   - Interactive farm task checklist.

4. **🔬 AI Crop Disease Scanner**
   - Drag & Drop photo uploader + file picker.
   - **Quick Demo Preset Buttons**: Tomato Late Blight, Rice Leaf Blast, Cotton Bacterial Blight, Healthy Leaf.
   - Simulated AI scan animation.
   - Full diagnostic report: Severity level, confidence %, symptom breakdown, organic treatment, chemical remedies, printable PDF/report generator.

5. **⛅ Weather Sync & Spray Advisory**
   - District location selector (Guntur, Vijayawada, Warangal, Anantapur, Visakhapatnam).
   - Real-time weather cards & 5-day forecast.
   - Localized farming advisory (spraying windows, sowing advice).

6. **💧 Smart Irrigation Calculator**
   - Calculator based on crop type, soil type (sandy/loamy/clay), growth stage, and land area (acres).
   - Computes daily water requirement (Liters), 3.5 HP pump runtime (hours), drip irrigation timing schedule, and water savings score.

7. **🧪 Soil-Health Analysis & Fertilizer Advisor**
   - Input fields for NPK (Nitrogen, Phosphorus, Potassium in kg/ha) & Soil pH.
   - **Quick Preset Buttons**: Low Nitrogen Soil, Ideal Cotton Soil, High Alkaline Soil.
   - Fertilizer recommendations (Urea, DAP, MOP, Lime, Gypsum) per acre.

8. **🚨 Regional Pest & Disease Alerts**
   - Severity badges (High / Medium Risk) for regional outbreaks.
   - **🔊 Voice Alert Simulator**: Text-to-Speech audio reader in English and Telugu (`playVoiceAlert`).
   - Community outbreak report form.

9. **📚 Agricultural Knowledge Base & Schemes**
   - Government schemes guide (Rythu Bharosa, PM-KISAN, Micro-irrigation subsidies).
   - Kisan Call Center (1551) info.
   - Searchable Q&A knowledge base.

10. **👤 Farmer Digital Profile & Kisan Smart ID Card (New!)**
    - Personal farmer identity management with Aadhaar & Kisan verification status.
    - Farm land holdings & dominant soil / irrigation pump specifications.
    - **Interactive Sub-Plots Manager**: Track plot lifecycle, area, and crop health score with live Add/Delete capability.
    - **Digital Kisan Smart ID Card**: Holographic chip design, QR code verification badge, and printable/downloadable format.
    - **Government Benefits Passbook**: Real-time status tracking for Rythu Bharosa, PM-KISAN, and Micro-irrigation subsidies.
    - **4 Ready Demo Farmer Profiles**: Quick 1-click profiles (*Ramesh Reddy - Guntur*, *Lakshmi Devi - Krishna*, *Srinivas Rao - Warangal*, *Anand Kumar - Anantapur*).
    - **Bi-directional App Sync**: Profile changes automatically update the Weather district, Irrigation calculator defaults, and Soil analyzer.

---

## 🚀 How to Run Locally

### Option A: Using Node.js Backend Server (Recommended)
1. Open terminal in the project directory:
   ```bash
   cd "c:\Users\MATTA MAMATA\Desktop\HACKTHON 2.0"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   npm start
   ```
4. Open your browser and go to:
   ```
   http://localhost:3000
   ```

### Option B: Standalone Web Browser (No Server Needed!)
- Simply double-click `public/index.html` or open it directly in Google Chrome, Microsoft Edge, or Firefox.
- The built-in **Client-Side API Fallback Engine** (`public/js/api.js`) will seamlessly handle all calculations and disease scans without needing a backend server!

---

## 📁 File Structure

```
HACKTHON 2.0/
├── package.json               # Node.js configuration & dependencies
├── server.js                  # Node.js Express server & REST API endpoints
├── README.md                  # Project documentation & demo guide
└── public/
    ├── index.html             # Main Single Page App HTML template
    ├── css/
    │   └── styles.css         # Agriculture-themed responsive CSS styles
    └── js/
        ├── i18n.js            # English & Telugu translation dictionary
        ├── api.js             # API layer (Express API + standalone fallback)
        ├── charts.js          # Chart.js visualization engine
        └── app.js             # Application controller & event handlers
```

---

## 🏆 Hackathon Presentation Tip
When presenting to judges:
1. Click the **"తెలుగు"** button in the header to demonstrate regional language accessibility.
2. Go to **Disease Scanner** and click the **"Tomato Late Blight"** sample chip for instant diagnosis demo.
3. Show the **Irrigation Calculator** with 2.5 acres of Cotton to display Liters/day and pump runtime calculations.
4. Go to **Soil Health** and click **"Low Nitrogen Soil"** to show instant NPK chart updates and Urea dosage calculations.
5. Click **"🔊 Listen Audio Advisory (Voice)"** on the Pest Alerts page to demonstrate text-to-speech voice alerts.
