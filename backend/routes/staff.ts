/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { db } from '../db.ts';
import { Staff } from '../../src/types/index.ts';

const router = Router();

router.get('/', (req, res) => {
  const { schoolId = 'sch-001' } = req.query;
  res.json(db.staff.filter((s) => s.schoolId === schoolId));
});

router.post('/', (req, res) => {
  const { schoolId = 'sch-001', firstName, lastName, email, phone, role, designation, qualification } = req.body;
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'First name, last name, and email are required' });
  }

  const school = db.schools.find((s) => s.id === schoolId) || db.schools[0];
  const staffId = `${school.code}/STF/${String(db.staff.length + 1).padStart(3, '0')}`;

  const newStaff: Staff = {
    id: `stf-${Date.now()}`,
    schoolId,
    staffId,
    firstName,
    lastName,
    email,
    phone: phone || '+234 800 000 0000',
    role: role || 'TEACHER',
    designation: designation || 'Subject Teacher',
    qualification: qualification || 'B.Sc (Ed)',
    employmentDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    avatarUrl: req.body.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    assignedSubjects: req.body.assignedSubjects || [],
    assignedClasses: req.body.assignedClasses || [],
  };

  db.staff.push(newStaff);
  db.addAuditLog(schoolId, 'School Admin', 'SCHOOL_ADMIN', 'HIRE_STAFF', `Added staff member: ${firstName} ${lastName} (${staffId})`);
  res.status(201).json(newStaff);
});

export default router;
