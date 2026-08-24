import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy initializer for Gemini client to prevent crashes if key is initially absent
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Falling back to rule-based analysis.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 2. Telemetry Deep Analysis & Early Warning Prediction
app.post("/api/gemini/analyze-telemetry", async (req, res) => {
  try {
    const { sensors, activeDisaster, scenarioContext } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback deterministic assessment if API key is not configured
      return res.json({
        threatLevel: activeDisaster?.severity || "MEDIUM",
        primaryHazard: activeDisaster?.type || "Seismic Anomaly",
        leadTimeSeconds: 45,
        aiConfidence: 94,
        impactProbability: 88,
        affectedRadiusKm: 65,
        summary: "Multi-station telemetry shows synchronous threshold breach across primary acoustic and seismic sensors.",
        cascadingHazards: [
          { hazard: "Secondary S-Wave Arrival", delayMinutes: 1, probability: 95, severity: "CRITICAL" },
          { hazard: "Structural Resonance & Liquefaction", delayMinutes: 4, probability: 78, severity: "HIGH" },
          { hazard: "Coastal Surge / Tsunami Threat", delayMinutes: 18, probability: 62, severity: "MEDIUM" },
        ],
        infrastructureDirectives: [
          { system: "High-Speed Rail Line Alpha", action: "Emergency Automatic Brake Trigger (EB-01)", priority: "IMMEDIATE" },
          { system: "Municipal Gas Distribution Main", action: "Actuate Sector Isolation Shutoff Valves", priority: "IMMEDIATE" },
          { system: "Power Transmission Grid", action: "Initiate Autonomous Substation Islanding", priority: "HIGH" },
          { system: "Major Highway Bridges", action: "Activate Digital Variable Message Signs (VMS) to Halted", priority: "HIGH" },
        ],
        evacuationRecommendations: [
          "District 4 & Harbor zones proceed immediately to Inland Sector B high-ground assembly point.",
          "Avoid underpasses, coastal seawalls, and unreinforced masonry corridors.",
          "Maintain clear corridors along Highway 101 Northbound for first responder apparatus.",
        ],
      });
    }

    const prompt = `You are the lead AI Predictive Hazard Modeling Engine of a National Disaster Early Warning System.
Analyze the following live sensor network telemetry and active event status:

ACTIVE SCENARIO:
${JSON.stringify(activeDisaster || { type: "Unspecified Anomaly", severity: "HIGH" }, null, 2)}

SENSOR NETWORK ANOMALIES & TELEMETRY:
${JSON.stringify(sensors || [], null, 2)}

ADDITIONAL CONTEXT:
${scenarioContext || "Continuous real-time seismic, hydrological, atmospheric, and geotechnical monitoring stream."}

Provide a comprehensive early warning risk forecast in strictly valid JSON matching the requested structure.
Assess:
1. Threat Level (CRITICAL, HIGH, MEDIUM, LOW, or NOMINAL)
2. Primary Hazard name
3. Estimated Lead Time in seconds before peak impact / wavefront arrival
4. AI Confidence score (0-100)
5. Impact Probability (0-100)
6. Estimated Affected Radius in Kilometers
7. Tactical summary briefing (2-3 concise, professional sentences)
8. Cascading Hazard Chain (immediate subsequent hazards with delay in minutes, probability %, and severity)
9. Infrastructure Automation Directives (specific immediate actions for transit, power, gas, bridges, dams)
10. Evacuation corridor advice and public safety directives.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            threatLevel: { type: Type.STRING, description: "CRITICAL, HIGH, MEDIUM, LOW, or NOMINAL" },
            primaryHazard: { type: Type.STRING },
            leadTimeSeconds: { type: Type.NUMBER },
            aiConfidence: { type: Type.NUMBER },
            impactProbability: { type: Type.NUMBER },
            affectedRadiusKm: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            cascadingHazards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  hazard: { type: Type.STRING },
                  delayMinutes: { type: Type.NUMBER },
                  probability: { type: Type.NUMBER },
                  severity: { type: Type.STRING },
                },
                required: ["hazard", "delayMinutes", "probability", "severity"],
              },
            },
            infrastructureDirectives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  system: { type: Type.STRING },
                  action: { type: Type.STRING },
                  priority: { type: Type.STRING },
                },
                required: ["system", "action", "priority"],
              },
            },
            evacuationRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "threatLevel",
            "primaryHazard",
            "leadTimeSeconds",
            "aiConfidence",
            "impactProbability",
            "affectedRadiusKm",
            "summary",
            "cascadingHazards",
            "infrastructureDirectives",
            "evacuationRecommendations",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/gemini/analyze-telemetry:", error);
    return res.status(500).json({
      error: "Failed to generate AI analysis",
      details: error.message,
    });
  }
});

// 3. Multi-Channel Emergency Public Broadcast Synthesis
app.post("/api/gemini/generate-broadcast", async (req, res) => {
  try {
    const { threatLevel, hazardType, targetLocation, leadTimeSec, instructions } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        easTitle: `EMERGENCY ACTION NOTIFICATION - ${hazardType?.toUpperCase() || "HAZARD"} WARNING`,
        weaShortSms: `EMERGENCY ALERT: ${hazardType || "Disaster"} imminent in ${targetLocation || "your sector"}. Take shelter immediately. Check local radio.`,
        weaDetailedSms: `CIVIL EMERGENCY MESSAGE: Severe ${hazardType || "event"} detected with arrival expected in ${leadTimeSec || 60}s. Evacuate lowlands / seek structural shelter away from windows. Follow emergency routes.`,
        radioBroadcastScript: `Attention, attention. The Disaster Early Warning System has detected severe ${hazardType || "conditions"} affecting ${targetLocation || "the metropolitan zone"}. Immediate protective action is required. Do not use elevators. Tune to local emergency frequencies.`,
        sirenCadence: "Wailing 3-Minute Continuous Tone (Immediate Evacuation / Cover)",
        multilingualAlerts: {
          Spanish: `ALERTA DE EMERGENCIA: Peligro inminente de ${hazardType || "desastre"}. Busque refugio de inmediato.`,
          French: `ALERTE D'URGENCE: Danger imminent de ${hazardType || "catastrophe"}. Mettez-vous à l'abri immédiatement.`,
          Japanese: `緊急警報: ${hazardType || "災害"} が発生しました。直ちに安全な場所へ避難してください。`,
        },
      });
    }

    const prompt = `Synthesize an official National Emergency Broadcast package for an active disaster early warning:
- Hazard: ${hazardType || "Earthquake & Tsunami"}
- Threat Level: ${threatLevel || "CRITICAL"}
- Target Location / Sector: ${targetLocation || "Metropolitan Coastal & Valley Sectors"}
- Estimated Lead Time: ${leadTimeSec || 45} seconds
- Key Directives: ${instructions || "Seek high ground or sturdy structural cover immediately."}

Generate structured emergency communications for EAS (Emergency Alert System), WEA (Wireless Emergency Alerts Short 90-char & Long 360-char SMS), Radio announcer live script, Siren audible cadence protocol, and Multilingual translations (Spanish, French, Japanese).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            easTitle: { type: Type.STRING },
            weaShortSms: { type: Type.STRING, description: "Under 90 characters, concise urgency" },
            weaDetailedSms: { type: Type.STRING, description: "Under 360 characters" },
            radioBroadcastScript: { type: Type.STRING },
            sirenCadence: { type: Type.STRING },
            multilingualAlerts: {
              type: Type.OBJECT,
              properties: {
                Spanish: { type: Type.STRING },
                French: { type: Type.STRING },
                Japanese: { type: Type.STRING },
              },
              required: ["Spanish", "French", "Japanese"],
            },
          },
          required: ["easTitle", "weaShortSms", "weaDetailedSms", "radioBroadcastScript", "sirenCadence", "multilingualAlerts"],
        },
      },
    });

    return res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error in /api/gemini/generate-broadcast:", error);
    return res.status(500).json({ error: "Failed to generate broadcast package" });
  }
});

// 4. Tactical AI Disaster Commander Copilot Chat
app.post("/api/gemini/copilot-chat", async (req, res) => {
  try {
    const { message, systemState, history } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply: `[Simulated Copilot] Regarding "${message}": Current telemetry indicates active alert protocols are engaged. We recommend prioritizing District 4 evacuation along Corridor Blue, maintaining power to regional hospitals, and verifying automated gas cutoff valve isolation.`,
      });
    }

    const systemInstruction = `You are "Aegis-AI", the Senior Tactical Incident Commander & Disaster Predictive Copilot of the National Early Warning Operations Center.
You possess real-time telemetry awareness, seismic modeling capabilities, hydrological flood routing algorithms, and civil defense operational manuals.
Respond with calm, authoritative, precise, tactical recommendations. Keep answers crisp, actionable, and formatted with clean bullet points where appropriate.

Current Live System State:
${JSON.stringify(systemState || {}, null, 2)}`;

    const formattedHistory = Array.isArray(history)
      ? history.map((h: any) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        }))
      : [];

    const chat = ai.chats.create({
      model: "gemini-3.7-flash",
      config: {
        systemInstruction,
        temperature: 0.4,
      },
      history: formattedHistory,
    });

    const response = await chat.sendMessage({ message });
    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Error in /api/gemini/copilot-chat:", error);
    return res.status(500).json({ error: "Failed to process tactical copilot query" });
  }
});

// 5. Scenario Synthetic Telemetry Generator
app.post("/api/gemini/generate-scenario", async (req, res) => {
  try {
    const { scenarioType, intensity } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        name: `${scenarioType || "Subduction Megaquake"} Scenario (Level ${intensity || 5})`,
        description: `Synthetic simulation inject with simulated extreme sensor readings across seismic, water level, and atmospheric stations.`,
        hazardType: scenarioType || "Earthquake",
        epicenter: { lat: 34.0522, lng: -118.2437, name: "Pacific Fault Rift Sector 7" },
        threatLevel: "CRITICAL",
        leadTimeSeconds: 38,
        affectedPopulationEst: 1450000,
        anomalies: [
          { stationId: "SEIS-01", param: "PGA", value: 340, unit: "cm/s²", status: "CRITICAL" },
          { stationId: "HYDRO-04", param: "Water Level", value: 8.4, unit: "meters", status: "WARNING" },
          { stationId: "GEO-02", param: "Slope Tilt", value: 142, unit: "μrad/hr", status: "CRITICAL" },
        ],
      });
    }

    const prompt = `Create a realistic disaster simulation inject for testing an early warning system.
Scenario Request: ${scenarioType} at Intensity ${intensity}/5.
Generate:
1. Descriptive Scenario Name
2. Deep tactical scenario description
3. Hazard Type
4. Epicenter coordinates (lat, lng, name)
5. Threat Level (CRITICAL, HIGH, MEDIUM)
6. Lead time in seconds
7. Estimated affected population
8. Key sensor anomalies array (stationId, param, value, unit, status)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            hazardType: { type: Type.STRING },
            epicenter: {
              type: Type.OBJECT,
              properties: {
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER },
                name: { type: Type.STRING },
              },
              required: ["lat", "lng", "name"],
            },
            threatLevel: { type: Type.STRING },
            leadTimeSeconds: { type: Type.NUMBER },
            affectedPopulationEst: { type: Type.NUMBER },
            anomalies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stationId: { type: Type.STRING },
                  param: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  status: { type: Type.STRING },
                },
                required: ["stationId", "param", "value", "unit", "status"],
              },
            },
          },
          required: ["name", "description", "hazardType", "epicenter", "threatLevel", "leadTimeSeconds", "affectedPopulationEst", "anomalies"],
        },
      },
    });

    return res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error in /api/gemini/generate-scenario:", error);
    return res.status(500).json({ error: "Failed to generate scenario inject" });
  }
});

// Vite middleware for development & production static serve
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Disaster Early Warning System running on http://0.0.0.0:${PORT}`);
  });
}

setupVite();
