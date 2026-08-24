# Disaster Early Warning System (Aegis DEWS)

An AI-powered multi-hazard disaster early warning and civil defense command platform. Aegis DEWS integrates real-time multi-modal telemetry ingestion (seismic, oceanic DART buoys, hydrometric stations, Doppler atmospheric pressure, geotechnical tiltmeters), GIS shockwave propagation modeling, cascading risk forecasting, automated SCADA infrastructure interlocks, and multi-channel emergency broadcast generation (EAS / WEA / CAP).

---

## 🌟 Key Features

### 1. Live Multi-Modal Telemetry Grid
- **Multi-Sensor Ingestion**: Real-time telemetry streams monitoring seismic peak ground acceleration ($PGA$ in $\text{cm/s}^2$), subsea DART ocean pressure, hydrometric river flow ($m^3/s$), Doppler barometric pressure tendency ($\text{hPa/hr}$), borehole inclinometers, and thermal infrared hotspots.
- **Interactive Node Inspector**: Inspect live telemetry feeds, calibrated threshold limits (Normal, Warning Alert, Critical Breach), signal latency metrics, battery levels, and manually inject sensor anomalies.
- **Micro-Jitter & Live Sparklines**: Real-time time-series visualization across all sensor nodes.

### 2. Predictive AI Hazard & Cascading Impact Engine
- **Lead-Time Window Countdown**: Precision calculation of the remaining tactical window before primary $S$-wave or tsunami surge arrival at high-density metro centers.
- **Cascading Hazard Chain Modeling**: Predicts sequential multi-hazard dependencies (e.g., Subduction Megaquake $\rightarrow$ Secondary Liquefaction & Resonance $\rightarrow$ Coastal Tsunami Surge $\rightarrow$ Dam Spillway Breach).
- **AI Model Confidence & Bayesian Risk Assessment**: Evaluates exposure probability, population at risk, and geographic damage perimeter.

### 3. Interactive GIS Hazard Radar & Evacuation Map
- **Dynamic Wavefront Animation**: Vector cartographic projection rendering expanding $P$-wave (compression) and $S$-wave (destructive shear) propagation rings.
- **Critical GIS Layers**: Toggleable fault lines, risk buffer perimeters, tsunami inundation zones, and high-ground shelters.
- **Evacuation Corridors & Shelters**: Status of high-ground resiliency shelters (elevation MSL, current occupancy, triage amenities) and optimal escape corridors.

### 4. SCADA Infrastructure Automation Interlocks
- **Autonomous Emergency Actuations**: Instant triggers designed for the lead-time window:
  - *High-Speed Rail Line Alpha*: Automated emergency braking sequence ($EB\text{-}01$) to prevent derailment.
  - *Municipal Gas Distribution*: Actuation of sector isolation shutoff valves to prevent post-quake urban firestorms.
  - *Electrical Transmission Grid*: Autonomous substation islanding to mitigate transformer explosions.
  - *Major Highway Bridges*: Digital Variable Message Signs (VMS) stop alerts.

### 5. Multi-Channel Public Emergency Broadcast (EAS / WEA / CAP)
- **Wireless Emergency Alerts (WEA)**: Generates 90-character emergency SMS headlines and 360-character detailed civil action guidelines for 4G/5G cell broadcast.
- **Emergency Alert System (EAS)**: TV crawler bulletins and announcer scripts.
- **Multilingual Dissemination**: Automated translation into Spanish, French, and Japanese.
- **Acoustic Warning Sirens & Audio Synthesizer**: Web Audio API implementation generating EAS dual-tones ($853\text{ Hz} + 960\text{ Hz}$) and pulsed civil defense siren cadences.

### 6. Disaster Scenario Simulation & Stress Lab
- **Pre-Configured Scenarios**:
  - *M7.8 Subduction Megaquake & Tsunami*
  - *Category 5 Super Typhoon & Storm Surge*
  - *Torrential Cloudburst Dam Overspill*
  - *Pyroconvective Urban Wildfire Interface*
- **AI Synthetic Scenario Generator**: Dynamic Gemini-driven disaster synthesis with custom hazard categories and severity intensity scales.

### 7. AI Tactical Disaster Copilot
- Live incident command assistant grounded in current sensor grid readings, shelter capacities, and infrastructure statuses for tactical decision support.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion, Lucide React
- **Audio Engine**: Web Audio API (EAS dual-tone synthesis, sirens, and telemetry sonification)
- **Backend**: Node.js, Express, `tsx`
- **AI / LLM**: Google Gemini 3.7 Flash via `@google/genai` SDK
- **Bundler & Tooling**: Vite, esbuild

---

## 📁 Project Structure

```
├── .env.example                # Environment variables template
├── metadata.json               # Applet configuration & capabilities
├── package.json                # Project dependencies & scripts
├── server.ts                   # Express backend API & Gemini proxy
├── src/
│   ├── App.tsx                 # Main application dashboard & state orchestration
│   ├── main.tsx                # Client entry point
│   ├── index.css               # Global styles & Tailwind imports
│   ├── types.ts                # TypeScript interfaces & domain types
│   ├── data/
│   │   └── mockSensors.ts      # Sensor stations, shelters, corridors & preset scenarios
│   ├── utils/
│   │   └── audioAlert.ts       # Web Audio API EAS tone & siren synthesizers
│   └── components/
│       ├── Navbar.tsx                  # Header with threat level & lead-time ticker
│       ├── InteractiveDisasterMap.tsx  # GIS hazard radar & evacuation map
│       ├── LiveTelemetryGrid.tsx       # Real-time multi-modal sensor grid
│       ├── PredictiveAiPanel.tsx       # AI hazard forecast & cascading chain
│       ├── EmergencyActionPlan.tsx     # SCADA interlocks & shelter directory
│       ├── PublicAlertBroadcast.tsx    # Multi-channel EAS/WEA dispatcher
│       ├── ScenarioSimulator.tsx       # Disaster injection & stress lab
│       ├── AiTacticalAssistant.tsx     # AI Incident Command Copilot chat
│       └── SensorInspectorModal.tsx    # Detailed telemetry calibration modal
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- NPM or Yarn package manager
- Gemini API Key (obtain from [Google AI Studio](https://aistudio.google.com/))

### Installation

1. Clone or download the repository:
   ```bash
   git clone <repository-url>
   cd disaster-early-warning-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Set your `GEMINI_API_KEY` in the `.env` file:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   ```

### Running Locally

Start the development server (runs on port 3000):
```bash
npm run dev
```

Visit `http://localhost:3000` in your web browser.

### Production Build

Build both the client SPA and bundled server:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

---

## 🔒 Security & Best Practices

- All Gemini API calls are securely proxied through backend server endpoints (`/api/gemini/*`) to ensure API keys are never exposed to the client browser.
- Fallback heuristic models are implemented to guarantee autonomous failover if external network connectivity is degraded during simulated emergencies.

---

## 📄 License

This project is licensed under the Apache 2.0 License.
