import express from 'express';
import dotenv  from 'dotenv';
import cors from 'cors';
import authRoutes        from './routes/auth';
import projectRoutes     from './routes/projects';
import branchRoutes      from './routes/branches';
import versionRoutes     from './routes/versions';
import { authenticateJWT } from './middleware/auth';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors()); // don’t forget CORS!

// Public
app.use('/api/auth', authRoutes);

// Protected
app.use('/api/projects', authenticateJWT, projectRoutes);

// Nested under projects:
app.use(
  '/api/projects/:projectId/branches',
  authenticateJWT,
  branchRoutes
);

// Direct versions path:
app.use(
  '/api/branches/:branchId/versions',
  authenticateJWT,
  versionRoutes
);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server up on ${port}`));
