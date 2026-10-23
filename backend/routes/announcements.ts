/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { db } from '../db.ts';
import { Announcement } from '../../src/types/index.ts';

const router = Router();

router.get('/', (req, res) => {
  const { schoolId = 'sch-001' } = req.query;
  res.json(db.announcements.filter((a) => a.schoolId === schoolId));
});

router.post('/', (req, res) => {
  const { schoolId = 'sch-001', title, content, category, targetAudience, channels, authorName = 'Principal' } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const newAnn: Announcement = {
    id: `ann-${Date.now()}`,
    schoolId,
    title,
    content,
    category: category || 'General',
    targetAudience: targetAudience || 'ALL',
    createdAt: new Date().toISOString().split('T')[0],
    authorName,
    channels: channels || ['IN_APP'],
    smsStatus: channels?.includes('SMS') ? 'SENT' : undefined,
  };

  db.announcements.unshift(newAnn);
  db.addAuditLog(schoolId, authorName, 'PRINCIPAL', 'POST_ANNOUNCEMENT', `Broadcasted announcement: "${title}"`);
  res.status(201).json(newAnn);
});

export default router;
