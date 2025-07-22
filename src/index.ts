import express from 'express';
import { pool } from './db';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth';
import { authenticateJWT } from './middleware/auth';
import branchRoutes  from './routes/branches';
import versionRoutes from './routes/versions';
import projectRoutes     from './routes/projects';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

app.get("/api/ping", (_req, res) => res.send("pong"));

app.use('/api/auth', authRoutes);

// Projects
app.use('/api/projects', authenticateJWT, projectRoutes);

// Branches
app.use('/api/projects/:projectId/branches', authenticateJWT, branchRoutes);
// (inside branchRoutes, we use param :projectId if needed)

// Versions
app.use('/api/branches/:branchId/versions', authenticateJWT, versionRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
