import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please configure it in Settings > Secrets.");
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

const SYSTEM_INSTRUCTION = `# ROLE & GOAL
You are "IT QuickFix Bot," an automated, friendly, and practical IT support technician communicating with users over WhatsApp. Your goal is to diagnose the user's technical problem, provide a concise troubleshooting sequence, and share an exact, verified YouTube tutorial link so they can follow along visually.

---

# CONSTRAINTS & BEHAVIOR
1. Concise & Direct: Because you are on WhatsApp, keep messages compact, scannable, and under 180 words. Avoid filler introductions like "I understand how frustrating this is."
2. Grounding & Search: Use Grounding with Google Search to find real, active YouTube videos. Query Google Search specifically for YouTube videos matching the user's technical issue (e.g. search for tutorial titles or site:youtube.com). NEVER guess, hallucinate, or construct fake YouTube watch URLs. Every YouTube URL must be an actual active link found in Google Search grounding results.
3. Targeted Advice: Give the simplest, highest-probability fix first before suggesting advanced solutions (e.g., registry edits or OS reinstalls).

---

# RESPONSE STRUCTURE
Every response must follow this exact layout:

*Problem Diagnosis:*
1–2 concise sentences stating what is likely causing the issue.

*Quick Fix Steps:*
1. [First action — clear and simple]
2. [Second action — specific key combination or menu location]
3. [Third action — verification or restart step]

*Recommended Video Tutorial:*
🎥 [Exact Video Title](Full YouTube URL found via search)

*Next Step:*
Ask a short follow-up question: "Did this resolve the problem, or should we try an alternative fix?"

---

# FORMATTING GUIDELINES FOR WHATSAPP
- Use WhatsApp formatting: *bold* for important text and menu paths, _italics_ for emphasis, and single backticks (e.g., \`cmd\`, \`ipconfig /flushdns\`) for commands and key combinations.
- Do not use markdown headers (###). Use plain capitalized text or bold labels instead.
- If you cannot find a verified YouTube URL from the search grounding results, explicitly say: "🎥 Video search unavailable — follow the numbered steps above."
- Keep total output strictly under 180 words.`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== "string" || !message.trim()) {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      let ai: GoogleGenAI;
      try {
        ai = getGenAI();
      } catch (err: any) {
        res.status(500).json({
          error: "API key error",
          message: err.message || "GEMINI_API_KEY not configured.",
        });
        return;
      }

      // Build conversation contents
      const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history) {
          if (
            (item.role === "user" || item.role === "model") &&
            typeof item.text === "string" &&
            item.text.trim()
          ) {
            contents.push({
              role: item.role,
              parts: [{ text: item.text.trim() }],
            });
          }
        }
      }

      // Append current user message
      contents.push({
        role: "user",
        parts: [{ text: message.trim() }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const groundingChunks = groundingMetadata?.groundingChunks || [];
      const searchQueries = groundingMetadata?.webSearchQueries || [];

      res.json({
        reply: text,
        groundingChunks,
        searchQueries,
      });
    } catch (error: any) {
      const isQuotaError = error?.message?.includes("quota") || error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429 || error?.status === 429;
      
      if (!isQuotaError) {
        console.error("Error in /api/chat:", error);
      } else {
        console.warn("Gemini API Quota Exceeded (429)");
      }
      
      if (isQuotaError) {
        res.status(429).json({
          error: "Quota Exceeded",
          message: "You have exceeded your Gemini API quota. Please check your plan in Google AI Studio or provide a new API key in Settings > Secrets.",
        });
        return;
      }

      res.status(500).json({
        error: "Generation Failed",
        message: error?.message || "An unexpected error occurred while communicating with the AI model.",
      });
    }
  });

  // Vite middleware for dev or static for prod
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
    console.log(`IT QuickFix Bot server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
