/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { db } from '../db.ts';
import { Student, Invoice } from '../../src/types/index.ts';
import { generateAdmissionNumber } from '../../src/utils/academicCalculations.ts';

const router = Router();

router.get('/', (req, res) => {
  const { schoolId = 'sch-001', classId, search, status, limit, offset } = req.query;
  let result = db.students.filter((s) => s.schoolId === schoolId);

  if (classId) {
    result = result.filter((s) => s.classId === classId);
  }
  if (status) {
    result = result.filter((s) => s.status === status);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q)
    );
  }

  // Support pagination if provided
  if (limit) {
    const l = Number(limit);
    const o = Number(offset) || 0;
    return res.json({
      total: result.length,
      items: result.slice(o, o + l),
    });
  }

  res.json(result);
});

router.post('/', (req, res) => {
  const {
    schoolId = 'sch-001',
    firstName,
    lastName,
    middleName,
    gender,
    dateOfBirth,
    classId,
    armId,
    guardian,
    stateOfOrigin,
    lga,
    address,
    bloodGroup,
    genotype,
  } = req.body;

  if (!firstName || !lastName || !classId) {
    return res.status(400).json({ error: 'First name, last name, and class are required' });
  }

  const targetClass = db.classes.find((c) => c.id === classId);
  const targetArm = targetClass?.arms.find((a) => a.id === armId) || targetClass?.arms[0];
  const school = db.schools.find((s) => s.id === schoolId) || db.schools[0];

  const sequence = db.students.filter((s) => s.schoolId === schoolId).length + 1;
  const currentYear = new Date().getFullYear();
  const admissionNumber = generateAdmissionNumber(school.code, currentYear, sequence);

  const newStudent: Student = {
    id: `stu-${Date.now()}`,
    schoolId,
    admissionNumber,
    firstName,
    lastName,
    middleName: middleName || '',
    gender: gender || 'Male',
    dateOfBirth: dateOfBirth || '2012-01-01',
    classId,
    className: targetClass?.name || 'Class',
    armId: targetArm?.id || 'arm-1',
    armName: targetArm?.name || 'Arm A',
    admissionDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    avatarUrl: req.body.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    stateOfOrigin: stateOfOrigin || 'Lagos State',
    lga: lga || 'Ikeja',
    address: address || 'Lagos, Nigeria',
    guardian: guardian || {
      name: 'Guardian Name',
      relationship: 'Parent',
      phone: '+234 800 000 0000',
      email: 'parent@example.com',
      address: 'Lagos, Nigeria',
      occupation: 'Professional',
    },
    bloodGroup: bloodGroup || 'O+',
    genotype: genotype || 'AA',
  };

  db.students.push(newStudent);
  db.addAuditLog(schoolId, 'Registrar', 'REGISTRAR', 'STUDENT_ENROLLED', `Enrolled ${firstName} ${lastName} with Adm No ${admissionNumber}`);

  // Create tuition invoice for student
  const invoice: Invoice = {
    id: `inv-${Date.now()}`,
    schoolId,
    invoiceNumber: `INV/2026/${String(db.invoices.length + 1).padStart(4, '0')}`,
    studentId: newStudent.id,
    studentName: `${newStudent.firstName} ${newStudent.lastName}`,
    admissionNumber: newStudent.admissionNumber,
    className: newStudent.className,
    armName: newStudent.armName,
    term: school.activeTerm,
    session: school.activeSession,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '2026-02-15',
    items: [
      { description: 'Termly Tuition & Educational Resources', amount: 180000 },
      { description: 'ICT, Lab & Library Levy', amount: 30000 },
      { description: 'PTA & School Development Levy', amount: 15000 },
    ],
    totalAmount: 225000,
    paidAmount: 0,
    balance: 225000,
    status: 'UNPAID',
  };
  db.invoices.push(invoice);

  res.status(201).json(newStudent);
});

router.put('/:id', (req, res) => {
  const student = db.students.find((s) => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  Object.assign(student, req.body);
  db.addAuditLog(student.schoolId, 'Registrar', 'REGISTRAR', 'UPDATE_STUDENT', `Updated profile of ${student.firstName} ${student.lastName}`);
  res.json(student);
});

router.delete('/:id', (req, res) => {
  const student = db.students.find((s) => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  student.status = 'ARCHIVED';
  db.addAuditLog(student.schoolId, 'School Admin', 'SCHOOL_ADMIN', 'ARCHIVE_STUDENT', `Archived student ${student.firstName} ${student.lastName}`);
  res.json({ message: 'Student archived successfully', student });
});

router.post('/import', (req, res) => {
  const { schoolId = 'sch-001', studentsList } = req.body;
  if (!Array.isArray(studentsList) || studentsList.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty students list' });
  }

  const imported: Student[] = [];
  const school = db.schools.find((s) => s.id === schoolId) || db.schools[0];
  let seq = db.students.filter((s) => s.schoolId === schoolId).length + 1;

  for (const item of studentsList) {
    const admNo = generateAdmissionNumber(school.code, 2026, seq++);
    const student: Student = {
      id: `stu-${Date.now()}-${seq}`,
      schoolId,
      admissionNumber: admNo,
      firstName: item.firstName || 'Student',
      lastName: item.lastName || 'Learner',
      gender: item.gender || 'Male',
      dateOfBirth: item.dateOfBirth || '2012-05-10',
      classId: item.classId || 'cls-jss1',
      className: item.className || 'JSS 1',
      armId: 'arm-1',
      armName: item.armName || 'Arm A',
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      stateOfOrigin: item.stateOfOrigin || 'Lagos State',
      lga: item.lga || 'Ikeja',
      address: item.address || 'Lagos, Nigeria',
      guardian: {
        name: item.guardianName || 'Guardian',
        relationship: 'Parent',
        phone: item.guardianPhone || '+234 803 000 0000',
        email: item.guardianEmail || 'parent@school.ng',
        address: item.address || 'Lagos, Nigeria',
        occupation: 'Civil Servant',
      },
      bloodGroup: 'O+',
      genotype: 'AA',
    };
    db.students.push(student);
    imported.push(student);
  }

  db.addAuditLog(schoolId, 'Registrar', 'REGISTRAR', 'CSV_STUDENT_IMPORT', `Imported ${imported.length} students via CSV`);
  res.json({ message: `Successfully imported ${imported.length} students`, importedCount: imported.length });
});

export default router;
