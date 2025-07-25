// src/routes/versions.ts
import { Router } from 'express';
import { pool }    from '../db';

const router = Router({ mergeParams: true });

/**
 * GET  /api/branches/:branchId/versions
 */
router.get('/', async (req, res) => {
  const branchId = Number(req.params.branchId);
  try {
    const { rows } = await pool.query(
      `SELECT id, commit_message, file_url, created_by, created_at
       FROM versions
       WHERE branch_id = $1
       ORDER BY created_at DESC`,
      [branchId]
    );
    res.json({ versions: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

/**
 * POST /api/branches/:branchId/versions
 */
router.post('/', async (req, res) => {
  const branchId = Number(req.params.branchId);
  const userId = req.user!.userId;
  const { commit_message, file_url } = req.body;
  if (!commit_message || !file_url) {
    return res.status(400).json({ error: 'Message & file URL required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO versions (branch_id, created_by, commit_message, file_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, commit_message, file_url, created_at`,
      [branchId, userId, commit_message, file_url]
    );
    res.status(201).json({ version: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create version' });
  }
});

export default router;
