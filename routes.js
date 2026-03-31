// ==================== API ROUTES ====================
import express from 'express';
import { analyzeMessage, getSystemPrompt } from './analysis.js';

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

  const endpoint =
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=AIzaSyD45mg8iBb_SSvINLGQzHOg0UtjBZuOvtQ"+
    apiKey;

  const systemPrompt = `You are MindMitra — a calm, friendly, practical college companion.

Talk like a real human.
No repeated greetings.
No blog-style answers.
Be short, direct, and natural.
Answer exactly what the user says.`;

  const body = {
    contents: [
      {
        role: "system",
        parts: [{ text: systemPrompt }]
      },
      {
        role: "user",
        parts: [{ text: userMessage }]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 300
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    // 🔍 HARD DEBUG (VERY IMPORTANT)
    console.log("RAW GEMINI RESPONSE:\n", JSON.stringify(data, null, 2));

    const parts = data?.candidates?.[0]?.content?.parts;

    if (!Array.isArray(parts)) {
      throw new Error("Invalid Gemini response structure");
    }

    const text = parts
      .map(p => p.text)
      .filter(Boolean)
      .join("\n")
      .trim();

    if (!text) {
      throw new Error("Empty Gemini text response");
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
    
    // Analyze message (NOT stored)
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
    
    // Track recent sessions (anonymized)
    const existingIndex = analytics.recentSessions.findIndex(s => s.sessionId === sessionId);
    if (existingIndex >= 0) {
      analytics.recentSessions[existingIndex] = {
        sessionId: sessionId.substring(0, 8) + '...',
        riskLevel: session.highestRisk,
        messageCount: session.messageCount,
        lastActive: session.lastActive
      };
    } else {
      analytics.recentSessions.unshift({
        sessionId: sessionId.substring(0, 8) + '...',
        riskLevel: session.highestRisk,
        messageCount: session.messageCount,
        lastActive: session.lastActive
      });
      
      // Keep only 20 recent
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
