import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Paths to JSON storage
const questionsFilePath = path.resolve(__dirname, 'data', 'questions.json');
const scoresFilePath = path.resolve(__dirname, 'data', 'scores.json');
const scenariosFilePath = path.resolve(__dirname, 'data', 'scenarios.json');

// Helper to safely read JSON
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

// Helper to write JSON
function writeJsonFile<T>(filePath: string, data: T): boolean {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// ================= API ENDPOINTS ================= //

// 1. GET /api/questions
app.get('/api/questions', (req, res) => {
  try {
    const { category, difficulty, limit } = req.query;
    let questions = readJsonFile<any[]>(questionsFilePath, []);

    if (category && category !== 'All') {
      questions = questions.filter(
        (q) => q.category?.toLowerCase() === String(category).toLowerCase()
      );
    }

    if (difficulty && difficulty !== 'All') {
      questions = questions.filter(
        (q) => q.difficulty?.toLowerCase() === String(difficulty).toLowerCase()
      );
    }

    if (limit) {
      const numLimit = parseInt(String(limit), 10);
      if (!isNaN(numLimit) && numLimit > 0) {
        questions = questions.slice(0, numLimit);
      }
    }

    // Return questions (including correctIndex for client or mask if desired)
    res.json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch questions' });
  }
});

// 2. POST /api/quiz/validate - Server-side Answer Validation
app.post('/api/quiz/validate', (req, res) => {
  try {
    const { questionId, selectedIndex } = req.body;

    if (!questionId || typeof selectedIndex !== 'number') {
      return res.status(400).json({ success: false, error: 'questionId and selectedIndex are required' });
    }

    const questions = readJsonFile<any[]>(questionsFilePath, []);
    const question = questions.find((q) => q.id === questionId);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    const isCorrect = question.correctIndex === selectedIndex;
    let points = 0;
    if (isCorrect) {
      if (question.difficulty === 'Beginner') points = 100;
      else if (question.difficulty === 'Intermediate') points = 150;
      else if (question.difficulty === 'Advanced') points = 200;
      else points = 100;
    }

    return res.json({
      success: true,
      questionId,
      isCorrect,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      concept: question.concept,
      examTip: question.examTip,
      points,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Validation failed' });
  }
});

// 3. GET /api/leaderboard - Retrieve rankings
app.get('/api/leaderboard', (_req, res) => {
  try {
    const scores = readJsonFile<any[]>(scoresFilePath, []);
    // Sort descending by score / XP
    const sorted = [...scores].sort((a, b) => (b.score || 0) - (a.score || 0));
    res.json({
      success: true,
      leaderboard: sorted,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
  }
});

// 4. POST /api/leaderboard - Save quiz scores
app.post('/api/leaderboard', (req, res) => {
  try {
    const { playerName, college, specialization, score, xp, level, accuracy, streak, badges } = req.body;

    if (!playerName || typeof score !== 'number') {
      return res.status(400).json({ success: false, error: 'Invalid score entry' });
    }

    const sanitizedName = String(playerName).trim().slice(0, 40) || 'Anonymous Aspirant';
    const sanitizedCollege = String(college || 'Top B-School').trim().slice(0, 50);
    const sanitizedSpec = String(specialization || 'General Management').trim().slice(0, 50);

    const scores = readJsonFile<any[]>(scoresFilePath, []);

    const newEntry = {
      id: 'sc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      playerName: sanitizedName,
      college: sanitizedCollege,
      specialization: sanitizedSpec,
      score: Math.max(0, Math.round(score)),
      xp: Math.max(0, Math.round(xp || score)),
      level: level || 'Management Trainee',
      accuracy: typeof accuracy === 'number' ? Math.min(100, Math.max(0, Math.round(accuracy))) : 100,
      streak: typeof streak === 'number' ? streak : 1,
      badges: Array.isArray(badges) ? badges.slice(0, 8) : ['Aspirant Badge'],
      date: new Date().toISOString().split('T')[0],
    };

    scores.push(newEntry);
    writeJsonFile(scoresFilePath, scores);

    // Sort to return player's rank
    const sorted = [...scores].sort((a, b) => (b.score || 0) - (a.score || 0));
    const rank = sorted.findIndex((s) => s.id === newEntry.id) + 1;

    res.json({
      success: true,
      entry: newEntry,
      rank,
      totalPlayers: sorted.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save score' });
  }
});

// 5. GET /api/scenarios/:gameId - Get game scenarios
app.get('/api/scenarios/:gameId', (req, res) => {
  try {
    const { gameId } = req.params;
    const scenarios = readJsonFile<Record<string, any>>(scenariosFilePath, {});
    const gameData = scenarios[gameId];

    if (!gameData) {
      return res.status(404).json({ success: false, error: `Game ${gameId} not found` });
    }

    res.json({
      success: true,
      gameId,
      data: gameData,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch scenario' });
  }
});

// 6. GET /api/stats - Platform Statistics
app.get('/api/stats', (_req, res) => {
  try {
    const questions = readJsonFile<any[]>(questionsFilePath, []);
    const scores = readJsonFile<any[]>(scoresFilePath, []);
    const scenarios = readJsonFile<Record<string, any>>(scenariosFilePath, {});

    const totalGames = 7;
    const totalQuestions = questions.length;
    const totalPlayers = scores.length;
    const avgScore = scores.length
      ? Math.round(scores.reduce((acc, curr) => acc + (curr.score || 0), 0) / scores.length)
      : 0;

    res.json({
      success: true,
      stats: {
        totalGames,
        totalQuestions,
        totalPlayers,
        avgScore,
        categoriesCount: 6,
        activeSimulations: Object.keys(scenarios).length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// 7. GET /api/daily-challenge - Daily question & bonus
app.get('/api/daily-challenge', (_req, res) => {
  try {
    const questions = readJsonFile<any[]>(questionsFilePath, []);
    if (!questions.length) {
      return res.status(404).json({ success: false, error: 'No questions available' });
    }
    // Select daily based on day of year
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    const dailyIndex = dayOfYear % questions.length;
    const challenge = questions[dailyIndex];

    res.json({
      success: true,
      challenge: {
        ...challenge,
        bonusXp: 250,
        streakBonus: '+1 Day',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch daily challenge' });
  }
});

// ================= VITE DEV OR PROD MIDDLEWARE ================= //
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MBA GameZone server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
