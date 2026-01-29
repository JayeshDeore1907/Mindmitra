// ==================== MINDMITRA SERVER ====================
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import routes from './routes.js';

// ES Module setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// API routes
app.use('/api', routes);

// Serve admin
app.get('/admin', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'admin.html'));
});

// Health check
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Start server
app.listen(PORT, () => {
  console.log('\n═══════════════════════════════════════');
  console.log('🧠 MindMitra Server Running');
  console.log('═══════════════════════════════════════');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`👨‍🏫 Admin: http://localhost:${PORT}/admin`);
  console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD}`);
  console.log(`🤖 Gemini: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log('═══════════════════════════════════════\n');
});
