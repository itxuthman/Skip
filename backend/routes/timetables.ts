/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { db } from '../db.ts';
import { TimetableEntry } from '../../src/types/index.ts';

const router = Router();

router.get('/', (req, res) => {
  const { schoolId = 'sch-001', classId } = req.query;
  let list = db.timetables.filter((t) => t.schoolId === schoolId);
  if (classId) list = list.filter((t) => t.classId === classId);
  res.json(list);
});

router.post('/', (req, res) => {
  const { schoolId = 'sch-001', classId, day, period, time, subjectId, teacherId, room } = req.body;
  if (!classId || !day || !period || !subjectId) {
    return res.status(400).json({ error: 'Class, day, period, and subject are required' });
  }

  // Conflict Detection
  if (teacherId) {
    const teacherConflict = db.timetables.find(
      (t) => t.schoolId === schoolId && t.day === day && t.period === Number(period) && t.teacherId === teacherId && t.classId !== classId
    );
    if (teacherConflict) {
      return res.status(409).json({
        error: `Timetable Conflict: Teacher is already booked for ${teacherConflict.className} at this period!`,
      });
    }
  }

  if (room) {
    const roomConflict = db.timetables.find(
      (t) => t.schoolId === schoolId && t.day === day && t.period === Number(period) && t.room.toLowerCase() === room.toLowerCase() && t.classId !== classId
    );
    if (roomConflict) {
      return res.status(409).json({
        error: `Room Conflict: ${room} is already booked for ${roomConflict.className} at this period!`,
      });
    }
  }

  const academicClass = db.classes.find((c) => c.id === classId);
  const subject = db.subjects.find((s) => s.id === subjectId);
  const teacher = db.staff.find((st) => st.id === teacherId);

  db.timetables = db.timetables.filter(
    (t) => !(t.schoolId === schoolId && t.classId === classId && t.day === day && t.period === Number(period))
  );

  const slot: TimetableEntry = {
    id: `tt-${Date.now()}`,
    schoolId,
    classId,
    className: academicClass?.name || 'Class',
    armId: academicClass?.arms[0]?.id || 'arm-1',
    armName: academicClass?.arms[0]?.name || 'Arm A',
    day,
    period: Number(period),
    time: time || '08:00 - 08:45',
    subjectId,
    subjectName: subject?.name || 'Subject',
    teacherId: teacherId || '',
    teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Assigned Teacher',
    room: room || 'Classroom',
  };

  db.timetables.push(slot);
  res.status(201).json(slot);
});

export default router;
