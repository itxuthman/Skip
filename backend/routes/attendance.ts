/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { db } from '../db.ts';

const router = Router();

router.get('/', (req, res) => {
  const { schoolId = 'sch-001', classId, date = '2026-10-22' } = req.query;
  let records = db.attendance.filter((a) => a.schoolId === schoolId && a.date === date);

  if (classId) {
    records = records.filter((a) => a.classId === classId);
  }

  res.json(records);
});

router.post('/mark', (req, res) => {
  const { schoolId = 'sch-001', classId, date, records, markedBy = 'Teacher' } = req.body;
  if (!classId || !date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Class, date, and attendance records are required' });
  }

  // Remove existing attendance for this class and date
  db.attendance = db.attendance.filter((a) => !(a.schoolId === schoolId && a.classId === classId && a.date === date));

  // Insert updated records
  for (const item of records) {
    const student = db.students.find((s) => s.id === item.studentId);
    db.attendance.push({
      id: `att-${Date.now()}-${item.studentId}`,
      schoolId,
      classId,
      date,
      studentId: item.studentId,
      studentName: student ? `${student.firstName} ${student.lastName}` : item.studentName || 'Student',
      admissionNumber: student?.admissionNumber || '',
      status: item.status || 'PRESENT',
      remarks: item.remarks || '',
      markedBy,
    });
  }

  db.addAuditLog(
    schoolId,
    markedBy,
    'TEACHER',
    'RECORD_ATTENDANCE',
    `Marked attendance for class on ${date} (${records.length} students)`
  );

  res.json({ message: 'Attendance recorded successfully', count: records.length });
});

export default router;
