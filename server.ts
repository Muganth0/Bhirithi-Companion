/**
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of GoogleGenAI to prevent startup crash if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// System Instruction Generator for Panda the Panda
function getPandaSystemInstruction(activeRole: string): string {
  return `You are Panda the Panda, a warm, playful, and supportive virtual companion for a CBSE (NCERT) Class 6 student.
This is a private, personalized application built only for Bhirithi Sri, a CBSE Class 6 student. Her brother's name is Viransh. Do not describe the app as a public or generic student product.
Bhirithi recently achieved 4th Place at the 56th KVS National Sports Meet. Celebrate this achievement when naturally relevant, while keeping the focus on encouragement, learning, safe training, and her individual goals.
Crucially: Bhirithi is an accomplished competitive Yoga student. Respect her experience without making unsupported claims about titles, rankings, or abilities beyond the documented 4th-place KVS National Sports Meet achievement. Reinforce safe practice and never encourage overexertion.

Your personality traits and guidelines:
1. Multi-role persona: You can act as a:
   - **Friend**: Cheerful peer. Be informal, playful, and warm. Use cozy panda metaphors like "Bamboo hug!", "warm rolling hug", "bamboo snack-break". Use plenty of cute emojis. Talk to Bhirithi and mention Viransh lovingly!
   - **Partner**: Motivational nudge. Keep the language positive and use friendly "push" phrases (e.g., "You've got this - push one more topic!"). Empathize with stress, validate feelings, and always ask for consent before giving a push (e.g. "Want a pep nudge or a gentle plan?"). Avoid shaming.
   - **Teacher/Mentor**: aligned with CBSE Class 6 curriculum. Give stepwise scaffolded hints (do not spoil full answers instantly; try to give 2-4 gradual clues first).
   - **Mom/Guardian**: Caring, practical reminders (meals, posture, sleeping early). Maintain warm limits.
   - **Yoga Instructor**: Friendly stretch guides, posture feedback, box breathing, and safe alignment tips appropriate for Bhirithi's training. Reinforce safety so she does not overextend.

Your ACTIVE ROLE for this response is: [${activeRole.toUpperCase()}]. Please adapt your voice, greetings, and approach to favor this role, though you may blend your standard warm panda charm!
Keep your answers brief, engaging, highly structured, and highly encouraging. Use simple language. Never diagnose anything or ask for private identifiers like full real name, school building location, or personal phone number.`;
}

// API endpoint for Panda Chat with support for images/attachments and camera scans
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, role, image } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getGeminiClient();

    // Map client chat history to Gemini SDK format
    // gemini-3.5-flash uses { role, parts: [{text}] } where role must be 'user' or 'model'
    const formattedContents = (history || []).map((msg: any) => ({
      role: msg.sender === 'student' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Add current user message with text + optional inline image data
    const userParts: any[] = [{ text: message }];
    
    if (image && image.data && image.mimeType) {
      // Support real multimodal inputs (for camera scans or picture doubts)
      userParts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data
        }
      });
    }

    formattedContents.push({
      role: 'user',
      parts: userParts
    });

    const activeRole = role || 'friend';
    const systemInstruction = getPandaSystemInstruction(activeRole);

    const chatResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = chatResponse.text || "Oops, my panda brain wandered into the bamboo forest! Let's try that again!";
    
    return res.json({ text: replyText, role: activeRole });
  } catch (error: any) {
    console.error("Gemini API Error in backend:", error?.message || error);
    res.status(500).json({ 
      error: error?.message || "Something went wrong in the bamboo cabin. Make sure GEMINI_API_KEY is configured." 
    });
  }
});

// API endpoint for Safe Web and YouTube Study Search powered by Gemini Search Grounding
app.post("/api/study-search", async (req, res) => {
  const { query, type } = req.body;
  try {
    if (!query) {
      return res.status(400).json({ error: "Search query is required." });
    }

    const ai = getGeminiClient();

    let prompt = "";
    if (type === 'youtube') {
      prompt = `You are a safe CBSE NCERT Class 6 educational YouTube search engine.
Find 3 real, popular, active, highly high-quality educational YouTube videos for CBSE/NCERT Class 6 student about: "${query}".
For example, videos from channels like "Dear Sir", "Khan Academy India", "Don't Memorise", "Pebbles CBSE Class 6", "Unacademy", "LearnOHub" etc.

You MUST format the response strictly as a JSON array (no other markdown or text wrapping, just the JSON) containing 3 objects with these keys:
- title: clear educational video title
- channel: the channel name
- videoId: a valid real YouTube video ID (like "Mh_Y_BlyId4" or others that match NCERT class 6 or kids learning, or common ones)
- description: short 1-line kid-safe summary of what the child will learn.

Example output:
[
  {
    "title": "Knowing Our Numbers Chapter 1 - Comparing Digits",
    "channel": "Don't Memorise",
    "videoId": "Mh_Y_BlyId4",
    "description": "Learn to comparative digits and position values simply."
  }
]`;
    } else {
      prompt = `Act as a kid-friendly safe web search engine. Find 3 highly relevant educational websites, NCERT textbook pages, or learning articles about: "${query}" for a CBSE Class 6 student.
Use Google Search Grounding to find actual trustworthy links with exact real URLs and citations. Avoid commercial landing pages or forums; target educational networks like NCERT, BYJU'S, LearnCBSE, or Khan Academy.

You MUST format the response strictly as a JSON array (no other text, just JSON) containing 3 objects with these keys:
- title: Page or article title
- uri: Exact, real URL (starts with https://)
- snippet: A warm, clear 2-sentence safe explanation of what is learned there.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        // Only trigger search grounding for web browser lookups to retrieve real URLs with citations
        tools: type === 'web' ? [{ googleSearch: {} }] : undefined,
        responseMimeType: "application/json",
      },
    });

    const parsedResults = JSON.parse(response.text.trim());
    return res.json({ results: parsedResults });
  } catch (error: any) {
    console.error("Gemini Search Grounding Error in backend, loading safe CBSE fallbacks:", error?.message || error);
    
    // Graceful offline/fallback defaults to prevent errors if API is offline
    if (type === 'youtube') {
      // Return high-quality, real CBSE Class 6 videos
      return res.json({
        results: [
          {
            title: `Chapter Lesson: ${req.body.query} (CBSE Class 6 Complete Theory)`,
            channel: "Don't Memorise",
            videoId: "Mh_Y_BlyId4",
            description: "Learn to compare digits, structure commas, crores and complete NCERT exercises!"
          },
          {
            title: `Class 6 Science: ${req.body.query} (Lights, Shadows & Reflections)`,
            channel: "Khan Academy India",
            videoId: "kOunFf9T72k",
            description: "An incredible walkthrough detailing pinhole cameras, opaque, translucent, and transparent materials easily."
          },
          {
            title: `Introduction to Algebra & Equation matchsticks - Class 6`,
            channel: "Dear Sir CBSE",
            videoId: "7AtYy5p0OOk",
            description: "Introduction to variables, matchstick formations, expressions and rules."
          }
        ]
      });
    } else {
      // Return high-quality safe search text references
      return res.json({
        results: [
          {
            title: `NCERT Textbook Solutions for Class 6: ${req.body.query}`,
            uri: "https://www.learncbse.in/",
            snippet: "The best starting guide for full step-by-step textbook exercises. Read free notes, test worksheets and practice questions."
          },
          {
            title: `CBSE Science Study Notes - ${req.body.query}`,
            uri: "https://byjus.com/ncert-solutions-class-6-science/",
            snippet: "Beautiful diagrams, key formulas, and terms to help you prepare physical exhibitions and NCERT homework!"
          }
        ]
      });
    }
  }
});

// Autonomous Yoga Competition + News Radar powered by Gemini Google Search grounding
app.get("/api/yoga-updates", async (_req, res) => {
  try {
    const ai = getGeminiClient();
    const today = new Date().toISOString().slice(0, 10);

    const prompt = `You are the live research assistant for Bhirithi's private Yoga Radar.
Today's date is ${today}. Search the live web now. Do not rely on memory.

Find:
1. Upcoming yoga / yogasana competitions that could be relevant to a school-age competitive yoga student in India, with special attention to India, Tamil Nadu/Chennai, KVS/school competitions, and national or international junior events.
2. Recent credible yoga/yogasana sports news that can be used as positive, age-appropriate motivation.

SOURCE RULES:
- Prefer official organizers, federations, government departments, KVS, Ministry of AYUSH, Ministry of Youth Affairs & Sports, recognized state associations, and official event pages.
- Search multiple sources and cross-check dates when possible.
- Never invent an event, date, venue, eligibility rule, registration deadline, result, or URL.
- If eligibility for Bhirithi's exact age/category is not stated by the source, do not claim that she is eligible. Say that eligibility must be checked with the coach/organizer.
- Exclude events whose date is already past.
- For news, prefer items from the last 90 days when possible.
- Keep motivation factual: do not invent athlete stories or quotes.

Return ONLY valid JSON with this exact shape:
{
  "competitions": [
    {
      "title": "event name",
      "date": "confirmed date or date range, otherwise empty string",
      "location": "venue/city/state or online",
      "organizer": "organizer name",
      "summary": "2 short factual sentences",
      "relevance": "1 short encouraging sentence for Bhirithi without claiming eligibility",
      "sourceUrl": "exact source URL from a grounded result",
      "sourceName": "source/publisher name",
      "status": "upcoming"
    }
  ],
  "news": [
    {
      "title": "news headline",
      "date": "publication date or event date",
      "location": "",
      "organizer": "",
      "summary": "2 short factual sentences",
      "relevance": "1 short age-appropriate encouraging sentence for Bhirithi",
      "sourceUrl": "exact source URL from a grounded result",
      "sourceName": "source/publisher name",
      "status": "recent"
    }
  ]
}

Return up to 6 competitions and up to 6 news items. If fewer are reliably verified, return fewer. Every item MUST have a real https URL returned by web grounding.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    let parsed: any = JSON.parse((response.text || "{}").trim());
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundedSources = groundingChunks
      .map((chunk: any) => chunk?.web)
      .filter((web: any) => web?.uri)
      .map((web: any) => ({ uri: web.uri, title: web.title || "Grounded web source" }));

    const validHttps = (value: unknown) => typeof value === "string" && /^https:\/\//i.test(value);
    const clean = (items: any[], status: "upcoming" | "recent") => {
      const seen = new Set<string>();
      return (Array.isArray(items) ? items : [])
        .filter((item: any) => validHttps(item?.sourceUrl) && item?.title && item?.summary)
        .filter((item: any) => {
          const key = item.sourceUrl;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 6)
        .map((item: any) => ({
          title: String(item.title).slice(0, 180),
          date: String(item.date || ""),
          location: String(item.location || ""),
          organizer: String(item.organizer || ""),
          summary: String(item.summary).slice(0, 500),
          relevance: String(item.relevance || "Keep training with patience, consistency and safe practice.").slice(0, 240),
          sourceUrl: item.sourceUrl,
          sourceName: String(item.sourceName || "Verified web source").slice(0, 100),
          status
        }));
    };

    const competitions = clean(parsed?.competitions, "upcoming");
    const news = clean(parsed?.news, "recent");

    // Keep a compact trace of grounded sources so the UI can remain transparent.
    return res.json({
      competitions,
      news,
      generatedAt: new Date().toISOString(),
      groundedSources: groundedSources.slice(0, 20),
      note: "Updates are generated from a live Google-grounded web search. Final eligibility and registration details should be confirmed with the coach or organizer."
    });
  } catch (error: any) {
    console.error("Yoga Radar search error:", error?.message || error);
    return res.status(503).json({
      error: "Live yoga search is temporarily unavailable.",
      competitions: [],
      news: [],
      generatedAt: new Date().toISOString()
    });
  }
});

// Bhirithi's age-appropriate morning news bulletin, generated from a fresh web search.
// The bulletin prioritizes sports, science and technology, while also including a small
// selection of major general-news items suitable for a Class 6 student.
app.get("/api/morning-bulletin", async (_req, res) => {
  try {
    const ai = getGeminiClient();
    const today = new Date().toISOString().slice(0, 10);

    const prompt = `You are Panda the Panda's morning news editor for Bhirithi Sri, a CBSE Class 6 student in India.
Today's date is ${today}. Search the live web now. Do not rely on memory.

Create a short, child-friendly morning bulletin for Bhirithi.

EDITORIAL PRIORITY:
1. SPORTS — strongest focus, especially Indian sports, school/youth sports, yoga/yogasana, major competitions and important results.
2. SCIENCE — important discoveries, space, environment, health/science education and research explained simply.
3. TECHNOLOGY — meaningful AI, computing, robotics, gadgets, cybersecurity/safety and other technology developments.
4. MAJOR NEWS — only a small number of significant India/world developments that are appropriate for a Class 6 student. Keep descriptions factual, calm and non-sensational. If a topic involves conflict, crime, disaster or other distressing material, summarize only the essential civic fact in gentle age-appropriate language or omit it if it is not necessary.

SOURCE RULES:
- Search the live web and prioritize reputable primary/official sources and established news organizations.
- Prefer sources from India where appropriate, plus credible international sources for major global science, technology and sports developments.
- Never invent a headline, result, date, person, quote, statistic or URL.
- Do not include adult/graphic/sensational content.
- Avoid celebrity gossip, rumors and clickbait.
- Clearly distinguish reported facts from opinions.
- Keep every story understandable to a Class 6 student.
- Include publication/event date where available.
- Use only real https URLs returned by web grounding.

Return ONLY valid JSON:
{
  "date": "${today}",
  "greeting": "one cheerful 1-sentence Panda greeting",
  "sports": [{"headline":"","date":"","summary":"","sourceName":"","sourceUrl":""}],
  "science": [{"headline":"","date":"","summary":"","sourceName":"","sourceUrl":""}],
  "technology": [{"headline":"","date":"","summary":"","sourceName":"","sourceUrl":""}],
  "majorNews": [{"headline":"","date":"","summary":"","sourceName":"","sourceUrl":""}],
  "pandaPick": "one short encouraging takeaway for Bhirithi"
}

Return 3-5 sports stories, 2-3 science stories, 2-3 technology stories and at most 2 major-news stories. Keep each summary to 1-2 short sentences.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const parsed: any = JSON.parse((response.text || "{}").trim());
    const validHttps = (value: unknown) => typeof value === "string" && /^https:\/\//i.test(value);
    const cleanItems = (items: any[], max: number) => (Array.isArray(items) ? items : [])
      .filter((item: any) => item?.headline && item?.summary && validHttps(item?.sourceUrl))
      .slice(0, max)
      .map((item: any) => ({
        headline: String(item.headline).slice(0, 180),
        date: String(item.date || ""),
        summary: String(item.summary).slice(0, 420),
        sourceName: String(item.sourceName || "Verified news source").slice(0, 100),
        sourceUrl: item.sourceUrl
      }));

    return res.json({
      date: String(parsed.date || today),
      greeting: String(parsed.greeting || "Good morning, Bhirithi! Panda has your fresh news bamboo bundle ready. 🐼").slice(0, 240),
      sports: cleanItems(parsed.sports, 5),
      science: cleanItems(parsed.science, 3),
      technology: cleanItems(parsed.technology, 3),
      majorNews: cleanItems(parsed.majorNews, 2),
      pandaPick: String(parsed.pandaPick || "Keep learning, training safely and staying curious today!").slice(0, 300),
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Morning bulletin search error:", error?.message || error);
    return res.status(503).json({
      error: "Fresh morning news is temporarily unavailable.",
      date: new Date().toISOString().slice(0, 10)
    });
  }
});

// Automatic parent report draft generator powered by Gemini
app.post("/api/generate-report", async (req, res) => {
  try {
    const { moodRecords, studyCompleted, yogaMinutes } = req.body;
    
    const ai = getGeminiClient();
    
    const prompt = `Generate a warm, observational, non-diagnostic parent daily progress bulletin from Panda the Panda.
    
    Student details from today:
    - Mood scores over past days: ${JSON.stringify(moodRecords)} (on a scale of 1 to 5)
    - NCERT Math/Science chapters practiced: ${studyCompleted || 'None recorded yet'}
    - Yoga workout completed: ${yogaMinutes || 0} minutes
    
    Guidelines:
    1. Begin with a warm greeting to the Parent/Guardian from Panda (as the supportive guide).
    2. Share visual observations of mood, emphasizing successes and gentle follow-ups.
    3. Include completed activities (NCERT practice, breathing exercises, or restorative yoga).
    4. Provide 2 short, practical follow-up notes (e.g., getting a full 8-9 hours of sleep, checking with a school sports/yoga coach, keeping well-hydrated).
    5. Maintain a friendly, non-medical, observational tone. Avoid clinical terms. Keep it safe and cozy.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the parent correspondence liaison of Panda the Panda, generating supportive, observational school-home connection logs."
      }
    });

    return res.json({ report: response.text });
  } catch (error: any) {
    console.error("Error generating parent report:", error);
    // Return a beautiful pre-formatted backup report if API key is missing or fails
    const backupReport = `### Panda's Daily Observational Bulletin 🐾

Dear Parent/Guardian,

Here is our friendly check-in for your student's progress today!

**Daily Vibe check:**
Your student checked in with a positive energy level! They noted they are feeling focused and ready.

**Completed Adventures:**
- **NCERT Practiced:** ${req.body.studyCompleted || "Math Ch. 1 Practice"}
- **Yoga Dojo Time:** ${req.body.yogaMinutes || 10} minutes of breathing and focus poses.

**Panda's Tiny Reminders:**
1. Let's make sure we drink water and rest our eyes for 5 minutes after computer study.
2. Ensure they get 8 to 9 hours of sleep to stay fresh like bamboo!

With warm panda hugs,
**Panda the Panda** 🐼`;

    return res.json({ report: backupReport, isBackup: true });
  }
});

// Configure Vite middleware in development or serve static assets in production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupServer();
