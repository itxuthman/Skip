/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ScoreInput {
  ca1?: number;
  ca2?: number;
  exam?: number;
}

export interface WeightingConfig {
  ca1Max: number; // e.g. 20
  ca2Max: number; // e.g. 20
  examMax: number; // e.g. 60
}

export interface GradingScaleItem {
  min: number;
  max: number;
  grade: string;
  remark: string;
  points: number;
}

export const DEFAULT_NIGERIAN_GRADING_SCALE: GradingScaleItem[] = [
  { min: 75, max: 100, grade: 'A1', remark: 'Excellent', points: 5 },
  { min: 70, max: 74, grade: 'B2', remark: 'Very Good', points: 4 },
  { min: 65, max: 69, grade: 'B3', remark: 'Good', points: 3.5 },
  { min: 60, max: 64, grade: 'C4', remark: 'Credit', points: 3 },
  { min: 55, max: 59, grade: 'C5', remark: 'Credit', points: 2.5 },
  { min: 50, max: 54, grade: 'C6', remark: 'Credit', points: 2 },
  { min: 45, max: 49, grade: 'D7', remark: 'Pass', points: 1.5 },
  { min: 40, max: 44, grade: 'E8', remark: 'Fair Pass', points: 1 },
  { min: 0, max: 39, grade: 'F9', remark: 'Fail', points: 0 },
];

export const DEFAULT_WEIGHTING: WeightingConfig = {
  ca1Max: 20,
  ca2Max: 20,
  examMax: 60,
};

/**
 * Validates and calculates continuous assessment & examination score total.
 */
export function calculateSubjectTotal(
  scores: ScoreInput,
  weights: WeightingConfig = DEFAULT_WEIGHTING
): {
  total: number;
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const ca1 = scores.ca1 ?? 0;
  const ca2 = scores.ca2 ?? 0;
  const exam = scores.exam ?? 0;

  if (ca1 < 0 || ca1 > weights.ca1Max) {
    errors.push(`1st CA must be between 0 and ${weights.ca1Max} (got ${ca1})`);
  }
  if (ca2 < 0 || ca2 > weights.ca2Max) {
    errors.push(`2nd CA must be between 0 and ${weights.ca2Max} (got ${ca2})`);
  }
  if (exam < 0 || exam > weights.examMax) {
    errors.push(`Exam score must be between 0 and ${weights.examMax} (got ${exam})`);
  }

  const total = Math.min(100, Math.max(0, Math.round((ca1 + ca2 + exam) * 10) / 10));
  return {
    total,
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Evaluates score against Nigerian Secondary/Primary school grading scale
 */
export function getGradeAndRemark(
  score: number,
  gradingScale: GradingScaleItem[] = DEFAULT_NIGERIAN_GRADING_SCALE
): { grade: string; remark: string; points: number } {
  const rounded = Math.round(score);
  for (const item of gradingScale) {
    if (rounded >= item.min && rounded <= item.max) {
      return { grade: item.grade, remark: item.remark, points: item.points };
    }
  }
  return { grade: 'F9', remark: 'Fail', points: 0 };
}

/**
 * Computes ranks / positions for students in a subject or class (e.g. 1st, 2nd, 2nd, 4th)
 */
export function calculatePositions<T extends { id: string; totalScore: number }>(
  items: T[]
): Map<string, { rank: number; rankText: string }> {
  // Sort descending
  const sorted = [...items].sort((a, b) => b.totalScore - a.totalScore);
  const positionMap = new Map<string, { rank: number; rankText: string }>();

  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].totalScore === sorted[i - 1].totalScore) {
      // Tie: keep same rank as previous
      const prev = positionMap.get(sorted[i - 1].id)!;
      positionMap.set(sorted[i].id, prev);
    } else {
      currentRank = i + 1;
      positionMap.set(sorted[i].id, {
        rank: currentRank,
        rankText: formatOrdinalPosition(currentRank),
      });
    }
  }

  return positionMap;
}

export function formatOrdinalPosition(n: number): string {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

/**
 * Calculates fee balances, total paid, and arrears status
 */
export function calculateFeeBalance(
  totalBilled: number,
  totalPaid: number
): {
  balance: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
  paymentPercentage: number;
} {
  const balance = Math.max(0, totalBilled - totalPaid);
  let status: 'PAID' | 'PARTIAL' | 'UNPAID' = 'UNPAID';

  if (totalPaid >= totalBilled && totalBilled > 0) {
    status = 'PAID';
  } else if (totalPaid > 0 && totalPaid < totalBilled) {
    status = 'PARTIAL';
  } else if (totalBilled === 0) {
    status = 'PAID';
  }

  const paymentPercentage = totalBilled > 0 ? Math.min(100, Math.round((totalPaid / totalBilled) * 100)) : 100;

  return {
    balance,
    status,
    paymentPercentage,
  };
}

/**
 * Generates official Nigerian admission numbers
 * Example: AIA/2026/0042
 */
export function generateAdmissionNumber(
  prefix: string,
  sessionYear: number,
  sequence: number
): string {
  const cleanPrefix = prefix.replace(/[^A-Z0-9]/gi, '').toUpperCase() || 'SCH';
  const padded = String(sequence).padStart(4, '0');
  return `${cleanPrefix}/${sessionYear}/${padded}`;
}

/**
 * Calculates attendance summary metrics
 */
export function calculateAttendanceMetrics(records: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' }[]): {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number; // percentage
} {
  const total = records.length;
  if (total === 0) {
    return { total: 0, present: 0, absent: 0, late: 0, excused: 0, attendanceRate: 100 };
  }

  let present = 0;
  let absent = 0;
  let late = 0;
  let excused = 0;

  for (const r of records) {
    if (r.status === 'PRESENT') present++;
    else if (r.status === 'ABSENT') absent++;
    else if (r.status === 'LATE') late++;
    else if (r.status === 'EXCUSED') excused++;
  }

  // Attendance rate considers Present + Late + Excused as attending
  const attended = present + late + excused;
  const attendanceRate = Math.round((attended / total) * 100);

  return {
    total,
    present,
    absent,
    late,
    excused,
    attendanceRate,
  };
}
