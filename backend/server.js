import express from "express";
import helmet from "helmet";
import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import path from "node:path";

const app = express();
const PORT = Number(process.env.PORT || 8080);
const MAX_BODY = "2mb";
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = Number(process.env.MAX_REQUESTS_PER_MINUTE || 30);

const syllabusPath = path.join(process.cwd(), "backend", "syllabus", "class6_ncert_2026_27.json");
const yogaSourcesPath = path.join(process.cwd(), "backend", "syllabus", "yoga_sources_2026_27.json");
let class6Syllabus = null;
let yogaSources = null;
try {
  class6Syllabus = JSON.parse(fs.readFileSync(syllabusPath, "utf8"));
} catch (error) {
  console.warn("Class 6 syllabus knowledge base unavailable:", error?.message || error);
}
try {
  yogaSources = JSON.parse(fs.readFileSync(yogaSourcesPath, "utf8"));
} catch (error) {
  console.warn("Yoga source registry unavailable:", error?.message || error);
}

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

function normalizeText(value) {
  return value.toLowerCase().normalize("NFKC").replace(/[–—]/g, "-").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function getSyllabusContext(message) {
  if (!class6Syllabus) return null;
  const normalized = normalizeText(message);
  const matches = [];

  for (const subject of class6Syllabus.subjects) {
    const aliases = [subject.subject, subject.book, ...(subject.aliases || [])];
    const matchedAlias = aliases.find(alias => {
      const a = normalizeText(alias);
      return a && (normalized.includes(a) || a.split(" ").filter(Boolean).every(word => normalized.includes(word)));
    });

    const chapters = [
      ...(subject.chapters || []),
      ...((subject.units || []).flatMap(unit => unit.chapters || []))
    ];
    const matchedChapter = chapters.find(chapter => {
      const c = normalizeText(chapter);
      return c && normalized.includes(c);
    });

    if (matchedAlias || matchedChapter) {
      matches.push({
        subject: subject.subject,
        book: subject.book,
        matchedAlias: matchedAlias || null,
        matchedChapter: matchedChapter || null,
        chapters,
        units: subject.units || []
      });
    }
  }

  return matches.length ? {
    academicSession: class6Syllabus.academicSession,
    board: class6Syllabus.board,
    class: class6Syllabus.class,
    matches
  } : null;
}

function formatSyllabusContext(context) {
  if (!context) return "";
  return `\n\nCURRICULUM CONTEXT — Use this as the authoritative Class 6 NCERT 2026-27 reference for syllabus-identification questions. Do not invent chapter names. If the child used a misspelling, silently map it to the matched official book name.\n${JSON.stringify(context)}`;
}

function looksLikeYoga(message) {
  return /yoga|yogasana|asmita|khelo india|yoga bharat|yogasanabharat|national yoga olympiad|kvs yoga|yoga competition|yogasana league/i.test(message);
}

function formatYogaContext() {
  if (!yogaSources) return "";
  return "\\n\\nOFFICIAL YOGA SOURCES: " + JSON.stringify(yogaSources.sources);
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

    const syllabusContext = getSyllabusContext(message);\n    const yogaQuery = looksLikeYoga(message);
    const shouldSearch = Boolean(useWebSearch) || looksLikeCurrentAffairs(message) || yogaQuery;
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
        systemInstruction: pandaSystemInstruction(role) + formatSyllabusContext(syllabusContext) + formatYogaContext(),
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
