/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSubjectTotal,
  getGradeAndRemark,
  calculatePositions,
  calculateFeeBalance,
  generateAdmissionNumber,
  calculateAttendanceMetrics,
  formatOrdinalPosition,
} from './academicCalculations.ts';

test('calculateSubjectTotal: correctly adds valid scores', () => {
  const result = calculateSubjectTotal({ ca1: 18, ca2: 17, exam: 52 });
  assert.equal(result.isValid, true);
  assert.equal(result.total, 87);
  assert.equal(result.errors.length, 0);
});

test('calculateSubjectTotal: catches invalid scores exceeding max boundaries', () => {
  const result = calculateSubjectTotal({ ca1: 25, ca2: 15, exam: 70 }, { ca1Max: 20, ca2Max: 20, examMax: 60 });
  assert.equal(result.isValid, false);
  assert.equal(result.errors.length, 2);
});

test('getGradeAndRemark: evaluates standard Nigerian WAEC/NECO scale', () => {
  const a1 = getGradeAndRemark(85);
  assert.equal(a1.grade, 'A1');
  assert.equal(a1.remark, 'Excellent');

  const b2 = getGradeAndRemark(72);
  assert.equal(b2.grade, 'B2');

  const c6 = getGradeAndRemark(51);
  assert.equal(c6.grade, 'C6');
  assert.equal(c6.remark, 'Credit');

  const f9 = getGradeAndRemark(32);
  assert.equal(f9.grade, 'F9');
  assert.equal(f9.remark, 'Fail');
});

test('calculatePositions: calculates ordinal ranks and handles ties correctly', () => {
  const students = [
    { id: 's1', totalScore: 88 },
    { id: 's2', totalScore: 92 },
    { id: 's3', totalScore: 88 }, // tie with s1
    { id: 's4', totalScore: 75 },
  ];

  const positions = calculatePositions(students);
  assert.equal(positions.get('s2')?.rank, 1);
  assert.equal(positions.get('s2')?.rankText, '1st');

  assert.equal(positions.get('s1')?.rank, 2);
  assert.equal(positions.get('s1')?.rankText, '2nd');

  assert.equal(positions.get('s3')?.rank, 2);
  assert.equal(positions.get('s3')?.rankText, '2nd');

  // s4 should be 4th because 2 students were 2nd
  assert.equal(positions.get('s4')?.rank, 4);
  assert.equal(positions.get('s4')?.rankText, '4th');
});

test('formatOrdinalPosition: formats numbers correctly', () => {
  assert.equal(formatOrdinalPosition(1), '1st');
  assert.equal(formatOrdinalPosition(2), '2nd');
  assert.equal(formatOrdinalPosition(3), '3rd');
  assert.equal(formatOrdinalPosition(4), '4th');
  assert.equal(formatOrdinalPosition(11), '11th');
  assert.equal(formatOrdinalPosition(21), '21st');
  assert.equal(formatOrdinalPosition(22), '22nd');
});

test('calculateFeeBalance: computes balances and payment status accurately', () => {
  const full = calculateFeeBalance(250000, 250000);
  assert.equal(full.balance, 0);
  assert.equal(full.status, 'PAID');
  assert.equal(full.paymentPercentage, 100);

  const partial = calculateFeeBalance(250000, 150000);
  assert.equal(partial.balance, 100000);
  assert.equal(partial.status, 'PARTIAL');
  assert.equal(partial.paymentPercentage, 60);

  const unpaid = calculateFeeBalance(250000, 0);
  assert.equal(unpaid.balance, 250000);
  assert.equal(unpaid.status, 'UNPAID');
  assert.equal(unpaid.paymentPercentage, 0);
});

test('generateAdmissionNumber: formats admission number with prefix, year, and sequence', () => {
  const num1 = generateAdmissionNumber('AIA', 2026, 42);
  assert.equal(num1, 'AIA/2026/0042');

  const num2 = generateAdmissionNumber('gfc-college', 2025, 5);
  assert.equal(num2, 'GFCCOLLEGE/2025/0005');
});

test('calculateAttendanceMetrics: computes attendance percentage', () => {
  const records: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' }[] = [
    { status: 'PRESENT' },
    { status: 'PRESENT' },
    { status: 'LATE' },
    { status: 'ABSENT' },
    { status: 'EXCUSED' },
  ];

  const metrics = calculateAttendanceMetrics(records);
  assert.equal(metrics.total, 5);
  assert.equal(metrics.present, 2);
  assert.equal(metrics.absent, 1);
  assert.equal(metrics.late, 1);
  assert.equal(metrics.excused, 1);
  assert.equal(metrics.attendanceRate, 80); // (2+1+1)/5 = 80%
});
