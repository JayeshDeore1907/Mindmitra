// ==================== MENTAL HEALTH ANALYSIS ENGINE ====================
// Analyzes messages for risk indicators WITHOUT storing raw text

const KEYWORDS = {
  CRITICAL: {
    suicide: ['suicide', 'kill myself', 'end my life', 'want to die', 'better off dead', 
              'मर जाऊं', 'खत्म कर दूं', 'जीना नहीं', 'आत्महत्या'],
    selfHarm: ['hurt myself', 'cut myself', 'self harm', 'harm myself', 'cutting',
               'खुद को नुकसान', 'काट लूं'],
  },
  HIGH: {
    depression: ['depressed', 'depression', 'worthless', 'hopeless', 'helpless',
                 'डिप्रेशन', 'उदास', 'बेकार', 'निराश'],
    severe: ['can\'t go on', 'give up', 'no point', 'nothing matters',
             'हार गया', 'कोई उम्मीद नहीं'],
  },
  MODERATE: {
    stress: ['overwhelmed', 'can\'t handle', 'too much pressure', 'breaking down',
             'बहुत तनाव', 'दबाव', 'परेशान'],
    anxiety: ['panic', 'anxiety attack', 'terrified', 'can\'t breathe',
              'घबराहट', 'डर'],
  },
  LOW: {
    mild: ['stressed', 'worried', 'anxious', 'nervous', 'exam pressure',
           'तनाव', 'चिंता', 'परीक्षा'],
  }
};

export function analyzeMessage(text) {
  const lower = text.toLowerCase();
  
  // Check critical keywords
  for (const category in KEYWORDS.CRITICAL) {
    for (const keyword of KEYWORDS.CRITICAL[category]) {
      if (lower.includes(keyword)) {
        return {
          riskLevel: 'CRITICAL',
          category: category,
          crisisDetected: true,
          timestamp: new Date()
        };
      }
    }
  }
  
  // Check high risk
  for (const category in KEYWORDS.HIGH) {
    for (const keyword of KEYWORDS.HIGH[category]) {
      if (lower.includes(keyword)) {
        return {
          riskLevel: 'HIGH',
          category: category,
          crisisDetected: false,
          timestamp: new Date()
        };
      }
    }
  }
  
  // Check moderate risk
  for (const category in KEYWORDS.MODERATE) {
    for (const keyword of KEYWORDS.MODERATE[category]) {
      if (lower.includes(keyword)) {
        return {
          riskLevel: 'MODERATE',
          category: category,
          crisisDetected: false,
          timestamp: new Date()
        };
      }
    }
  }
  
  // Check low risk
  for (const category in KEYWORDS.LOW) {
    for (const keyword of KEYWORDS.LOW[category]) {
      if (lower.includes(keyword)) {
        return {
          riskLevel: 'LOW',
          category: category,
          crisisDetected: false,
          timestamp: new Date()
        };
      }
    }
  }
  
  return {
    riskLevel: 'NORMAL',
    category: 'general',
    crisisDetected: false,
    timestamp: new Date()
  };
}

export function getSystemPrompt(analysis) {
  let prompt = `You are MindMitra, a supportive AI friend for college students in India.

PERSONALITY: Warm, casual, Gen-Z friendly (like texting a friend)

RESPONSE RULES:
- Keep responses SHORT (1-3 lines max)
- Use simple, conversational language
- Match user's language (English/Hindi/Hinglish)
- Add emoji occasionally 💙
- Be supportive and validating
- NEVER diagnose mental health conditions
- NEVER prescribe medication

`;

  if (analysis.riskLevel === 'CRITICAL') {
    prompt += `\nURGENT: User shows CRISIS indicators. Respond with calm support and MUST suggest helplines.`;
  } else if (analysis.riskLevel === 'HIGH') {
    prompt += `\nUser shows depression signs. Be very empathetic and gently suggest professional help.`;
  } else if (analysis.riskLevel === 'MODERATE') {
    prompt += `\nUser is stressed. Provide quick coping tip or validation.`;
  }
  
  return prompt;
}
