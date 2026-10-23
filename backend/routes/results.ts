/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { db } from '../db.ts';
import { SubjectAssessmentScore, StudentReportCard } from '../../src/types/index.ts';
import {
  calculateSubjectTotal,
  getGradeAndRemark,
  calculatePositions,
} from '../../src/utils/academicCalculations.ts';

const router = Router();

router.get('/scores', (req, res) => {
  const { schoolId = 'sch-001', classId, subjectId, termId = 'Second Term' } = req.query;
  let filtered = db.scores.filter((s) => s.schoolId === schoolId && s.termId === termId);

  if (classId) filtered = filtered.filter((s) => s.classId === classId);
  if (subjectId) filtered = filtered.filter((s) => s.subjectId === subjectId);

  res.json(filtered);
});

router.post('/scores', (req, res) => {
  const { schoolId = 'sch-001', classId, subjectId, termId = 'Second Term', sessionId = '2025/2026', scoresList, actor = 'Teacher' } = req.body;
  if (!classId || !subjectId || !Array.isArray(scoresList)) {
    return res.status(400).json({ error: 'Class, subject, and scores array are required' });
  }

  const subject = db.subjects.find((s) => s.id === subjectId);

  // Validate and calculate totals & grades for each student
  const preparedItems: any[] = [];
  for (const item of scoresList) {
    const calc = calculateSubjectTotal({ ca1: Number(item.ca1) || 0, ca2: Number(item.ca2) || 0, exam: Number(item.exam) || 0 });
    const gradeInfo = getGradeAndRemark(calc.total);
    const student = db.students.find((s) => s.id === item.studentId);

    preparedItems.push({
      studentId: item.studentId,
      studentName: student ? `${student.firstName} ${student.lastName}` : 'Student',
      admissionNumber: student?.admissionNumber || '',
      ca1: item.ca1 ?? 0,
      ca2: item.ca2 ?? 0,
      exam: item.exam ?? 0,
      total: calc.total,
      grade: gradeInfo.grade,
      remark: gradeInfo.remark,
      teacherRemark: item.teacherRemark || '',
    });
  }

  const rankedMap = calculatePositions(
    preparedItems.map((p) => ({ id: p.studentId, totalScore: p.total }))
  );

  for (const item of preparedItems) {
    const rankInfo = rankedMap.get(item.studentId);
    const existingIndex = db.scores.findIndex(
      (s) =>
        s.schoolId === schoolId &&
        s.studentId === item.studentId &&
        s.subjectId === subjectId &&
        s.termId === termId
    );

    const scoreRecord: SubjectAssessmentScore = {
      id: existingIndex >= 0 ? db.scores[existingIndex].id : `sc-${Date.now()}-${item.studentId}`,
      schoolId,
      studentId: item.studentId,
      studentName: item.studentName,
      admissionNumber: item.admissionNumber,
      classId,
      sessionId,
      termId,
      subjectId,
      subjectName: subject?.name || 'Subject',
      ca1: item.ca1,
      ca2: item.ca2,
      exam: item.exam,
      total: item.total,
      grade: item.grade,
      remark: item.remark,
      position: rankInfo?.rankText,
      teacherRemark: item.teacherRemark,
      isApproved: true,
    };

    if (existingIndex >= 0) {
      db.scores[existingIndex] = scoreRecord;
    } else {
      db.scores.push(scoreRecord);
    }
  }

  db.addAuditLog(schoolId, actor, 'TEACHER', 'SAVE_SCORES', `Entered scores for ${subject?.name} in class (${scoresList.length} students)`);
  res.json({ message: 'Scores saved successfully', count: preparedItems.length });
});

router.get('/report-card/:studentId', (req, res) => {
  const { studentId } = req.params;
  const { termId = 'Second Term', sessionId = '2025/2026' } = req.query;

  const student = db.students.find((s) => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  let reportCard = db.reportCards.find(
    (r) => r.studentId === studentId && r.termId === termId && r.sessionId === sessionId
  );

  const studentScores = db.scores.filter(
    (s) => s.studentId === studentId && s.termId === termId && s.sessionId === sessionId
  );

  const classStudents = db.students.filter((s) => s.classId === student.classId && s.status === 'ACTIVE');
  const totalMarks = studentScores.reduce((sum, s) => sum + s.total, 0);
  const average = studentScores.length > 0 ? Math.round((totalMarks / studentScores.length) * 10) / 10 : 0;

  if (!reportCard) {
    reportCard = {
      id: `rep-${studentId}-${Date.now()}`,
      schoolId: student.schoolId,
      studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      className: student.className,
      armName: student.armName,
      sessionId: sessionId as string,
      termId: termId as string,
      avatarUrl: student.avatarUrl,
      scores: studentScores,
      attendance: {
        totalDays: 60,
        daysPresent: 57,
        daysAbsent: 2,
        daysLate: 1,
      },
      totalMarksObtained: totalMarks,
      totalMarksPossible: studentScores.length * 100,
      averageScore: average,
      classPosition: '1st',
      totalStudentsInClass: classStudents.length,
      affectiveDomain: [
        { trait: 'Punctuality', rating: 5 },
        { trait: 'Neatness & Decorum', rating: 5 },
        { trait: 'Honesty & Reliability', rating: 4 },
        { trait: 'Leadership & Initiative', rating: 5 },
        { trait: 'Politeness & Respect', rating: 5 },
        { trait: 'Attentiveness in Class', rating: 4 },
      ],
      psychomotorDomain: [
        { skill: 'Handwriting & Presentation', rating: 4 },
        { skill: 'Laboratory Practical Skills', rating: 5 },
        { skill: 'Sports & Physical Fitness', rating: 5 },
        { skill: 'Musical / Performing Arts', rating: 4 },
        { skill: 'Computer Hardware / Tech Skills', rating: 5 },
      ],
      classTeacherRemarks: `${student.firstName} is an exceptionally diligent, well-behaved, and high-achieving student. Keep up the high standard!`,
      principalRemarks: 'Superb academic accomplishment this term. Congratulations!',
      nextTermBegins: 'Monday, 4th May 2026',
      isPublished: true,
      publishedDate: '2026-04-10',
    };
  } else {
    reportCard.scores = studentScores;
    reportCard.totalMarksObtained = totalMarks;
    reportCard.totalMarksPossible = studentScores.length * 100;
    reportCard.averageScore = average;
  }

  res.json(reportCard);
});

export default router;
