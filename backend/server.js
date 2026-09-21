import express from "express";
import helmet from "helmet";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = Number(process.env.PORT || 8080);
const MAX_BODY = "2mb";
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = Number(process.env.MAX_REQUESTS_PER_MINUTE || 30);

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: MAX_BODY }));

const requestWindows = new Map();

function getClientKey(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.ip;
  return ip || "unknown";
}

app.use((req, res, next) => {
  const now = Date.now();
  const key = getClientKey(req);
  const current = requestWindows.get(key);

  if (!current || now - current.started >= WINDOW_MS) {
    requestWindows.set(key, { started: now, count: 1 });
    return next();
  }

  current.count += 1;
  if (current.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: "Too many requests. Please wait a moment and try again."
    });
  }

  return next();
});

function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured on the backend.");
  return new GoogleGenAI({ apiKey });
}

function pandaSystemInstruction(role = "friend") {
  return `You are Panda the Panda, a warm, playful and supportive virtual companion for Bhirithi, a CBSE Class 6 student.

Active role: ${role}.

Rules:
- Be child-safe, encouraging, concise and easy to understand.
- Help with CBSE/NCERT learning using explanations, examples and gradual hints.
- Never request private identifiers, passwords, financial details or precise location.
- For health, safety or emergencies, give cautious age-appropriate guidance and encourage contacting a trusted adult or appropriate professional.
- For current affairs/news, report verified facts neutrally. Do not persuade the student politically or tell the student how to vote or what political position to adopt.
- Do not invent facts, dates, links, people, quotes or statistics.
- Use a cheerful Panda personality and occasional 🐼 emojis without overdoing them.`;
}

function looksLikeCurrentAffairs(message) {
  return /current affairs|today('?s)? news|today news|latest news|latest current|prime news|top news|breaking news|news today|what happened today|recent news|headlines today/i.test(message);
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "bhirithi-gemini-backend",
    time: new Date().toISOString()
  });
});

app.post("/v1/chat", async (req, res) => {
  try {
    const { message, history = [], role = "friend", useWebSearch = false } = req.body || {};

    if (typeof message !== "string" || !message.trim() || message.length > 8000) {
      return res.status(400).json({ error: "Message is required and must be 8,000 characters or fewer." });
    }

    if (!Array.isArray(history) || history.length > 20) {
      return res.status(400).json({ error: "Chat history is too large." });
    }

    const shouldSearch = Boolean(useWebSearch) || looksLikeCurrentAffairs(message);
    const ai = getGemini();

    const contents = history
      .filter(item => item && typeof item.text === "string")
      .slice(-12)
      .map(item => ({
        role: item.sender === "student" ? "user" : "model",
        parts: [{ text: item.text.slice(0, 4000) }]
      }));

    contents.push({ role: "user", parts: [{ text: message }] });

    const prompt = shouldSearch
      ? `Answer the student's current-affairs/news question using live Google Search grounding. Search the web now and do not rely only on model memory.

Question: ${message}

Give a short Class 6-friendly answer. Clearly identify that the information is current as of today. Prefer primary sources and established news organizations. For political topics, describe the documented facts and competing positions neutrally without persuasion. Never invent a source.`
      : message;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
      contents: shouldSearch
        ? [{ role: "user", parts: [{ text: prompt }] }]
        : contents,
      config: {
        systemInstruction: pandaSystemInstruction(role),
        temperature: 0.7,
        tools: shouldSearch ? [{ googleSearch: {} }] : undefined
      }
    });

    const text = (response.text || "").trim();
    if (!text) {
      return res.status(502).json({ error: "Panda returned an empty reply." });
    }

    return res.json({
      text,
      role,
      grounded: shouldSearch,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Bhirithi backend error:", error?.message || error);
    return res.status(500).json({
      error: "Panda is temporarily unavailable. Please try again."
    });
  }
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Bhirithi Gemini backend listening on port ${PORT}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
