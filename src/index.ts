import express from 'express';
import { pool } from './db';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

app.get("/api/ping", (_req, res) => res.send("pong"));

app.use('/api/auth', authRoutes);

// Test endpoint: query current timestamp
app.get('/api/db-time', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW() as now');
    res.json({ now: rows[0].now });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/hello', (_req, res) => {
  res.json({ message: '👋 Hello again!' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
