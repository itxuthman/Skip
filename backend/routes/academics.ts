/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { db } from '../db.ts';
import { AcademicClass, Subject } from '../../src/types/index.ts';

const router = Router();

router.get('/classes', (req, res) => {
  const { schoolId = 'sch-001' } = req.query;
  res.json(db.classes.filter((c) => c.schoolId === schoolId));
});

router.post('/classes', (req, res) => {
  const { schoolId = 'sch-001', name, level, arms = ['Gold', 'Diamond'] } = req.body;
  if (!name) return res.status(400).json({ error: 'Class name is required' });

  const newClass: AcademicClass = {
    id: `cls-${Date.now()}`,
    schoolId,
    name,
    level: level || 'JUNIOR_SECONDARY',
    arms: arms.map((armName: string, idx: number) => ({
      id: `arm-${Date.now()}-${idx}`,
      name: typeof armName === 'string' ? armName : 'Arm ' + (idx + 1),
    })),
    subjects: ['sub-math', 'sub-eng', 'sub-civic'],
  };

  db.classes.push(newClass);
  res.status(201).json(newClass);
});

router.get('/subjects', (req, res) => {
  const { schoolId = 'sch-001' } = req.query;
  res.json(db.subjects.filter((s) => s.schoolId === schoolId));
});

router.post('/subjects', (req, res) => {
  const { schoolId = 'sch-001', name, code, category } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Subject name and code are required' });

  const newSubject: Subject = {
    id: `sub-${Date.now()}`,
    schoolId,
    name,
    code,
    category: category || 'General',
  };

  db.subjects.push(newSubject);
  res.status(201).json(newSubject);
});

export default router;
