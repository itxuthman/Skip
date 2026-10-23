/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { db } from '../db.ts';

const router = Router();

router.get('/users', (req, res) => {
  res.json(db.users);
});

router.post('/login', (req, res) => {
  const { email } = req.body;
  const user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase()) || db.users[1];
  res.json({ token: `jwt-token-${user.id}`, user });
});

export default router;
