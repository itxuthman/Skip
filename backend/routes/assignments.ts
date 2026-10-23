/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { db } from '../db.ts';
import { Assignment } from '../../src/types/index.ts';

const router = Router();

router.get('/', (req, res) => {
  const { schoolId = 'sch-001', classId } = req.query;
  let list = db.assignments.filter((a) => a.schoolId === schoolId);
  if (classId) list = list.filter((a) => a.classId === classId);
  res.json(list);
});

router.post('/', (req, res) => {
  const { schoolId = 'sch-001', title, description, classId, subjectId, teacherName, dueDate } = req.body;
  if (!title || !classId || !subjectId) {
    return res.status(400).json({ error: 'Title, class, and subject are required' });
  }

  const academicClass = db.classes.find((c) => c.id === classId);
  const subject = db.subjects.find((s) => s.id === subjectId);

  const assignment: Assignment = {
    id: `asn-${Date.now()}`,
    schoolId,
    title,
    description: description || '',
    classId,
    className: academicClass?.name || 'Class',
    subjectId,
    subjectName: subject?.name || 'Subject',
    teacherName: teacherName || 'Subject Teacher',
    dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString().split('T')[0],
    totalSubmissions: 0,
  };

  db.assignments.unshift(assignment);
  res.status(201).json(assignment);
});

export default router;
