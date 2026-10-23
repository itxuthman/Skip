/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { db } from '../db.ts';

const router = Router();

router.get('/status', (req, res) => {
  const { schoolId = 'sch-001' } = req.query;
  const schoolStudents = db.students.filter((s) => s.schoolId === schoolId);
  const schoolStaff = db.staff.filter((s) => s.schoolId === schoolId);
  const schoolClasses = db.classes.filter((c) => c.schoolId === schoolId);
  const schoolInvoices = db.invoices.filter((i) => i.schoolId === schoolId);
  const schoolReceipts = db.receipts.filter((r) => r.schoolId === schoolId);
  const schoolScores = db.scores.filter((sc) => sc.schoolId === schoolId);

  res.json({
    schoolId,
    studentsCount: schoolStudents.length,
    staffCount: schoolStaff.length,
    classesCount: schoolClasses.length,
    invoicesCount: schoolInvoices.length,
    receiptsCount: schoolReceipts.length,
    scoresCount: schoolScores.length,
    attendanceCount: db.attendance.length,
    isCleanMode: schoolStudents.length === 0,
    timestamp: new Date().toISOString(),
  });
});

router.post('/clear-demo', (req, res) => {
  db.clearAllData();
  res.json({
    success: true,
    message: 'All demo students, grades, receipts, invoices, and attendance logs successfully removed.',
    stats: {
      studentsCount: db.students.length,
      scoresCount: db.scores.length,
      invoicesCount: db.invoices.length,
      receiptsCount: db.receipts.length,
    },
  });
});

router.post('/seed-demo', (req, res) => {
  db.seedDemoRecords();
  res.json({
    success: true,
    message: 'Sample demo school data loaded successfully.',
    stats: {
      studentsCount: db.students.length,
      scoresCount: db.scores.length,
      invoicesCount: db.invoices.length,
      receiptsCount: db.receipts.length,
      attendanceCount: db.attendance.length,
    },
  });
});

export default router;
