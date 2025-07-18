import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/hello', (_req, res) => {
  res.json({ message: '👋 Hello from your new backend!' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
