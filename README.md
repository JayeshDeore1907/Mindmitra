# 🧠 MindMitra - AI Mental Health Companion

**Production-ready mental health chatbot for college students**

---

## ✨ Features

**For Students:**
- 💬 Free-flowing AI conversations (Gemini-powered)
- 📚 Exam prep tips & study guidance  
- 🧘 Mental wellness support & coping strategies
- 🚨 Automatic crisis detection with helplines
- 🌓 Light/Dark mode
- 📱 Mobile-responsive design
- 🔒 100% anonymous (no login, no data storage)

**For Administrators:**
- 📊 Real-time analytics dashboard
- 🎯 Risk level monitoring (Critical/High/Moderate/Low/Normal)
- 📈 Session statistics
- 🚨 Crisis alert tracking
- 🔐 Password-protected access

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ ([Download](https://nodejs.org))
- Gemini API key ([Get free key](https://makersuite.google.com/app/apikey))

### Installation

```bash
# 1. Extract files
cd mindmitra

# 2. Install dependencies
npm install

# 3. API key is already configured in .env
# (Your key: AIzaSyD7ISjOl7Qo3F_hbrUNzjESstGjelsfHZA)

# 4. Start server
npm start

# 5. Open browser
# Student: http://localhost:3000
# Admin: http://localhost:3000/admin
```

**Admin Password:** `mindmitra2025`

---

## 📁 Project Structure

```
mindmitra/
├── public/
│   ├── index.html       # Student chat interface
│   ├── admin.html       # Admin dashboard
│   ├── style.css        # Modern UI styles
│   └── app.js           # Frontend logic
├── server.js            # Express server
├── routes.js            # API endpoints + Gemini integration
├── analysis.js          # Mental health classification
├── package.json         # Dependencies
├── .env                 # Environment config (API key)
└── README.md            # This file
```

---

## 🔧 How It Works

### Architecture

```
Browser ←→ Express Server ←→ Gemini API
                ↓
        Mental Health Analysis
                ↓
        In-Memory Analytics
```

### Mental Health Classification

Messages are analyzed in background using keyword detection:

- **CRITICAL** → Suicide/self-harm keywords → Show helplines
- **HIGH** → Depression indicators → Suggest professional help  
- **MODERATE** → High stress/anxiety → Provide coping tips
- **LOW** → Mild stress → Supportive responses
- **NORMAL** → General chat → Friendly conversation

**Privacy:** Only risk level stored, NO raw messages saved.

---


## 💻 API Endpoints

### POST /api/chat
```json
Request:
{
  "message": "I'm stressed about exams",
  "sessionId": "session_123..."
}

Response:
{
  "success": true,
  "response": "That's totally valid! Exam stress is real...",
  "crisisDetected": false
}
```

### POST /api/admin/login
```json
Request: { "password": "mindmitra2025" }
Response: { "success": true }
```

### GET /api/admin/analytics
```json
Response:
{
  "analytics": {
    "totalSessions": 42,
    "activeSessions": 3,
    "riskCounts": {
      "CRITICAL": 1,
      "HIGH": 5,
      "MODERATE": 12,
      "LOW": 18,
      "NORMAL": 6
    },
    "recentSessions": [...]
  }
}
```

---

## 🛡️ Privacy & Ethics

**What We DON'T Store:**
- ❌ User names or identities
- ❌ Raw chat messages
- ❌ Personal information
- ❌ IP addresses

**What We DO Store (In-Memory):**
- ✅ Anonymous session IDs
- ✅ Risk level classifications
- ✅ Message counts
- ✅ Timestamps

**Ethical Guidelines:**
- Never diagnose mental health conditions
- Never prescribe medication
- Always suggest professional help when needed
- Provide verified helpline numbers
- Transparent about AI limitations

---

## 🆘 Crisis Resources

If you or someone you know is in crisis:

**KIRAN (Govt of India)**  
📞 1800-599-0019  
🕐 24/7

**Vandrevala Foundation**  
📞 1860-266-2345  
🕐 24/7

**iCall (TISS)**  
📞 9152987821  
🕐 Mon-Sat 8AM-10PM

---

## 🐛 Troubleshooting

**Server won't start:**
```bash
# Check Node version
node --version  # Should be 18+

# Reinstall dependencies
rm -rf node_modules
npm install
```

**Gemini API errors:**
```bash
# Verify API key in .env
cat .env

# Test API manually
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY"
```

**Port 3000 already in use:**
```bash
# Change port in .env
PORT=3001
```

---

## 📝 Development

```bash
# Start with auto-reload (Node 18+)
npm run dev

# Production
npm start
```

---

## 🎯 Future Enhancements

- [ ] Voice input/output
- [ ] Multi-language support (Tamil, Telugu, Bengali)
- [ ] Mood tracking over time
- [ ] Integration with college counseling systems
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced ML-based sentiment analysis

---

## 📄 License

MIT License - Free for educational and non-commercial use

---

## 🙏 Acknowledgments

- Mental health resources from NIMHANS
- Google Gemini for AI capabilities
- Indian mental health helplines for verified information

---

## 📞 Support

**For Issues:**  
Check troubleshooting section above

**For Questions:**  
Read REPORT.md for detailed documentation

---

**Made with 💚 for students by students**

*Empowering college students with accessible mental health support*
