// src/routes/branches.ts
import { Router } from 'express';
import { pool }    from '../db';

const router = Router({ mergeParams: true }); // important for nested params

/**
 * GET  /api/projects/:projectId/branches
 * List branches for a project
 */
router.get('/', async (req, res) => {
  const projectId = Number(req.params.projectId);
  try {
    const { rows } = await pool.query(
      `SELECT id, name, created_by, created_at
       FROM branches
       WHERE project_id = $1
       ORDER BY created_at DESC`,
      [projectId]
    );
    res.json({ branches: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

/**
 * POST /api/projects/:projectId/branches
 * Create a new branch
 */
router.post('/', async (req, res) => {
  const projectId = Number(req.params.projectId);
  const userId = req.user!.userId;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO branches (project_id, name, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, created_at`,
      [projectId, name, userId]
    );
    res.status(201).json({ branch: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create branch' });
  }
});

export default router;
