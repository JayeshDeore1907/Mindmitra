// ==================== API ROUTES ====================
import express from 'express';
import { analyzeMessage } from './analysis.js';

const router = express.Router();

// ==================== IN-MEMORY STORAGE ====================
const sessions = [];
const analytics = {
  totalSessions: 0,
  riskCounts: {
    CRITICAL: 0,
    HIGH: 0,
    MODERATE: 0,
    LOW: 0,
    NORMAL: 0
  },
  recentSessions: []
};

// ==================== GEMINI API ====================
async function callGemini(userMessage, analysis = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY");
    return "Server configuration error. Please try later.";
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const systemPrompt = `You are MindMitra — a calm, friendly, practical college companion.

Talk like a real human.
No repeated greetings.
No blog-style answers.
Be short, direct, and natural.
Answer exactly what the user says.`;

  // ✅ FIXED Gemini request format
  const body = {
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [
      {
        parts: [{ text: userMessage }]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 300
    }
  };

  try {
    console.log("Calling Gemini API...");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    // ✅ Handle HTTP errors
    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini HTTP Error:", errText);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    console.log("RAW GEMINI RESPONSE:\n", JSON.stringify(data, null, 2));

    // ✅ Handle empty response
    if (!data.candidates || data.candidates.length === 0) {
      console.error("No candidates returned:", data);
      return "I'm here to help. Can you rephrase that?";
    }

    const parts = data.candidates[0]?.content?.parts;

    if (!Array.isArray(parts)) {
      console.error("Invalid response structure:", data);
      return "Something went wrong. Please try again.";
    }

    const text = parts
      .map(p => p.text)
      .filter(Boolean)
      .join("\n")
      .trim();

    if (!text) {
      return "I didn't understand that clearly. Try again?";
    }

    return text;

  } catch (err) {
    console.error("Gemini Error:", err.message);
    return "Sorry, I couldn’t process that right now. Please try again.";
  }
}

// ==================== ROUTES ====================

// POST /api/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // Find or create session
    let session = sessions.find(s => s.id === sessionId);
    if (!session) {
      session = {
        id: sessionId,
        createdAt: new Date(),
        messageCount: 0,
        highestRisk: 'NORMAL'
      };
      sessions.push(session);
      analytics.totalSessions++;
    }

    // Analyze message
    const analysis = analyzeMessage(message);

    // Update analytics
    analytics.riskCounts[analysis.riskLevel]++;
    session.messageCount++;
    session.lastActive = new Date();

    // Update highest risk
    const riskPriority = ['CRITICAL', 'HIGH', 'MODERATE', 'LOW', 'NORMAL'];
    if (riskPriority.indexOf(analysis.riskLevel) < riskPriority.indexOf(session.highestRisk)) {
      session.highestRisk = analysis.riskLevel;
    }

    // Track recent sessions
    const existingIndex = analytics.recentSessions.findIndex(s => s.sessionId === sessionId);

    const sessionData = {
      sessionId: sessionId.substring(0, 8) + '...',
      riskLevel: session.highestRisk,
      messageCount: session.messageCount,
      lastActive: session.lastActive
    };

    if (existingIndex >= 0) {
      analytics.recentSessions[existingIndex] = sessionData;
    } else {
      analytics.recentSessions.unshift(sessionData);
      if (analytics.recentSessions.length > 20) {
        analytics.recentSessions.pop();
      }
    }

    // Get AI response
    const aiResponse = await callGemini(message, analysis);

    res.json({
      success: true,
      response: aiResponse,
      crisisDetected: analysis.crisisDetected
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
});

// POST /api/admin/login
router.post('/admin/login', (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// GET /api/admin/analytics
router.get('/admin/analytics', (req, res) => {
  res.json({
    success: true,
    analytics: {
      totalSessions: analytics.totalSessions,
      activeSessions: sessions.filter(s => {
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return s.lastActive > hourAgo;
      }).length,
      riskCounts: analytics.riskCounts,
      recentSessions: analytics.recentSessions
    }
  });
});

// GET /api/health
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    sessions: sessions.length
  });
});

export default router;
