import { Router } from 'express';
import { pool }   from '../db';

const router = Router();

/**
 * GET /api/projects/:projectId/branches
 * List all branches for a project.
 */
router.get('/:projectId/branches', async (req, res) => {
  const userId = req.user!.userId;
  const projectId = Number(req.params.projectId);

  // Optional: verify user has access to the project
  try {
    const { rows: branches } = await pool.query(
      `SELECT id, name, created_by, created_at
       FROM branches
       WHERE project_id = $1
       ORDER BY created_at DESC`,
      [projectId]
    );
    res.json({ branches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

/**
 * POST /api/projects/:projectId/branches
 * Create a new branch in a project.
 * Body: { name }
 */
router.post('/:projectId/branches', async (req, res) => {
  const userId = req.user!.userId;
  const projectId = Number(req.params.projectId);
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Branch name required' });
  }

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
