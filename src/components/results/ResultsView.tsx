/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Award,
  Printer,
  Save,
  CheckCircle,
  Eye,
  Download,
  Send,
  Layers,
  Sparkles,
  BookOpen,
  X,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { AcademicClass, Subject, Student, SubjectAssessmentScore, StudentReportCard } from '../../types/index.ts';
import { fetchApi } from '../../utils/api.ts';
import {
  calculateSubjectTotal,
  getGradeAndRemark,
  DEFAULT_NIGERIAN_GRADING_SCALE,
  formatOrdinalPosition,
} from '../../utils/academicCalculations.ts';

export const ResultsView: React.FC = () => {
  const { currentSchool, currentUser, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'entry' | 'broadsheet' | 'report-card'>('entry');
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('Second Term');
  const [loading, setLoading] = useState(true);

  // Scores Entry State: Map studentId -> { ca1, ca2, exam, teacherRemark }
  const [scoresMap, setScoresMap] = useState<Record<string, { ca1: number; ca2: number; exam: number; teacherRemark: string }>>({});

  // Report Card State
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);
  const [reportCardData, setReportCardData] = useState<StudentReportCard | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [classesData, subjectsData] = await Promise.all([
          fetchApi<AcademicClass[]>(`/api/academics/classes?schoolId=${currentSchool?.id || 'sch-001'}`),
          fetchApi<Subject[]>(`/api/academics/subjects?schoolId=${currentSchool?.id || 'sch-001'}`),
        ]);
        setClasses(classesData);
        setSubjects(subjectsData);
        if (classesData.length > 0) {
          // Default to SSS 2 (Science) or first class
          const defaultClass = classesData.find((c) => c.id === 'cls-sss2-sci') || classesData[0];
          setSelectedClassId(defaultClass.id);
        }
        if (subjectsData.length > 0) {
          setSelectedSubjectId(subjectsData[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [currentSchool?.id]);

  useEffect(() => {
    if (!selectedClassId) return;

    async function loadClassData() {
      try {
        setLoading(true);
        const [studentsData, existingScores] = await Promise.all([
          fetchApi<Student[]>(`/api/students?schoolId=${currentSchool?.id || 'sch-001'}&classId=${selectedClassId}&status=ACTIVE`),
          fetchApi<SubjectAssessmentScore[]>(
            `/api/results/scores?schoolId=${currentSchool?.id || 'sch-001'}&classId=${selectedClassId}&subjectId=${selectedSubjectId}&termId=${selectedTerm}`
          ),
        ]);

        setStudents(studentsData);
        if (studentsData.length > 0 && !selectedStudentForReport) {
          setSelectedStudentForReport(studentsData[0]);
        }

        // Initialize score map
        const newMap: Record<string, { ca1: number; ca2: number; exam: number; teacherRemark: string }> = {};
        for (const s of studentsData) {
          const rec = existingScores.find((es) => es.studentId === s.id);
          newMap[s.id] = {
            ca1: rec ? rec.ca1 : 16,
            ca2: rec ? rec.ca2 : 17,
            exam: rec ? rec.exam : 50,
            teacherRemark: rec?.teacherRemark || 'Good academic engagement in class.',
          };
        }
        setScoresMap(newMap);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadClassData();
  }, [selectedClassId, selectedSubjectId, selectedTerm, currentSchool?.id]);

  // Load report card for selected student
  useEffect(() => {
    if (!selectedStudentForReport) return;

    async function loadReport() {
      try {
        setLoadingReport(true);
        const card = await fetchApi<StudentReportCard>(
          `/api/results/report-card/${selectedStudentForReport?.id}?termId=${selectedTerm}&sessionId=${currentSchool?.activeSession || '2025/2026'}`
        );
        setReportCardData(card);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingReport(false);
      }
    }
    loadReport();
  }, [selectedStudentForReport?.id, selectedTerm]);

  const handleScoreChange = (studentId: string, field: 'ca1' | 'ca2' | 'exam' | 'teacherRemark', value: any) => {
    setScoresMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: field === 'teacherRemark' ? value : Number(value) || 0,
      },
    }));
  };

  const handleSaveScores = async () => {
    try {
      const scoresList = Object.entries(scoresMap).map(([studentId, val]) => ({
        studentId,
        ca1: val.ca1,
        ca2: val.ca2,
        exam: val.exam,
        teacherRemark: val.teacherRemark,
      }));

      await fetchApi('/api/results/scores', {
        method: 'POST',
        body: JSON.stringify({
          schoolId: currentSchool?.id || 'sch-001',
          classId: selectedClassId,
          subjectId: selectedSubjectId,
          termId: selectedTerm,
          sessionId: currentSchool?.activeSession || '2025/2026',
          scoresList,
          actor: currentUser?.name || 'Subject Teacher',
        }),
      });

      showToast('Continuous assessment & examination scores saved and published!', 'success');
      // Reload report if needed
      if (selectedStudentForReport) {
        const card = await fetchApi<StudentReportCard>(
          `/api/results/report-card/${selectedStudentForReport.id}?termId=${selectedTerm}`
        );
        setReportCardData(card);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to save scores', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Sub Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Examinations & Academic Grading</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            WAEC/NECO standard CA & exam scoring, automatic position ranking, and printable Nigerian terminal report sheets.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('entry')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'entry'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Score Entry (CA & Exam)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('report-card')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'report-card'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Official Terminal Report Card
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('broadsheet')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'broadsheet'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Class Broadsheet
          </button>
        </div>
      </div>

      {/* TAB 1: SCORE ENTRY */}
      {activeTab === 'entry' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Class:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Subject:</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Term:</label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSaveScores}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save & Publish Scores</span>
              </button>
            </div>
          </div>

          {/* Assessment Weighting info banner */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
              <span>
                Standard Nigerian Grading Scale: <strong>1st CA (20%)</strong> + <strong>2nd CA (20%)</strong> +{' '}
                <strong>Terminal Examination (60%)</strong> = <strong>100%</strong>.
              </span>
            </div>
            <span className="font-semibold text-blue-700 dark:text-blue-300 hidden sm:inline">
              A1: 75-100 · B2/B3: 65-74 · C4-C6: 50-64 · D7/E8: 40-49 · F9: 0-39
            </span>
          </div>

          {/* Score Entry Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Admission No</th>
                    <th className="py-3 px-4 w-28">1st CA (20)</th>
                    <th className="py-3 px-4 w-28">2nd CA (20)</th>
                    <th className="py-3 px-4 w-28">Exam (60)</th>
                    <th className="py-3 px-4 w-24">Total (100)</th>
                    <th className="py-3 px-4 w-20">Grade</th>
                    <th className="py-3 px-4">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((student) => {
                    const current = scoresMap[student.id] || { ca1: 0, ca2: 0, exam: 0, teacherRemark: '' };
                    const calc = calculateSubjectTotal({ ca1: current.ca1, ca2: current.ca2, exam: current.exam });
                    const gradeInfo = getGradeAndRemark(calc.total);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400">{student.armName}</p>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-blue-700 dark:text-blue-400">
                          {student.admissionNumber}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={current.ca1}
                            onChange={(e) => handleScoreChange(student.id, 'ca1', e.target.value)}
                            className="w-20 px-2.5 py-1 text-xs text-center rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={current.ca2}
                            onChange={(e) => handleScoreChange(student.id, 'ca2', e.target.value)}
                            className="w-20 px-2.5 py-1 text-xs text-center rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            max="60"
                            value={current.exam}
                            onChange={(e) => handleScoreChange(student.id, 'exam', e.target.value)}
                            className="w-20 px-2.5 py-1 text-xs text-center rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                            {calc.total}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold font-mono px-2 py-0.5 rounded text-xs ${
                              gradeInfo.grade.startsWith('A')
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : gradeInfo.grade.startsWith('B') || gradeInfo.grade.startsWith('C')
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {gradeInfo.grade}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Teacher's remark..."
                            value={current.teacherRemark}
                            onChange={(e) => handleScoreChange(student.id, 'teacherRemark', e.target.value)}
                            className="w-full max-w-xs px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OFFICIAL TERMINAL REPORT CARD */}
      {activeTab === 'report-card' && (
        <div className="space-y-4">
          {/* Student Selector Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs print:hidden">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                Select Student:
              </label>
              <select
                value={selectedStudentForReport?.id || ''}
                onChange={(e) => {
                  const s = students.find((st) => st.id === e.target.value);
                  if (s) setSelectedStudentForReport(s);
                }}
                className="w-full sm:w-72 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.admissionNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Official Report Card</span>
              </button>
            </div>
          </div>

          {/* Printable Report Card Canvas */}
          {reportCardData && (
            <div className="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-900 max-w-4xl mx-auto print:border-0 print:shadow-none print:p-0">
              {/* Header Letterhead */}
              <div className="text-center pb-4 border-b-2 border-blue-900 dark:border-blue-700">
                <div className="flex items-center justify-center gap-3">
                  <img
                    src={currentSchool?.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80'}
                    alt="School Logo"
                    className="h-14 w-14 rounded-xl object-cover ring-2 ring-blue-900/30"
                  />
                  <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      {currentSchool?.name}
                    </h1>
                    <p className="text-xs font-semibold italic text-blue-800 dark:text-blue-300">
                      "{currentSchool?.motto}"
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {currentSchool?.address}, {currentSchool?.city}, {currentSchool?.state} · Phone: {currentSchool?.phone}
                    </p>
                  </div>
                </div>
                <div className="mt-3 inline-block bg-blue-900 text-white px-6 py-1 rounded text-xs font-bold uppercase tracking-widest">
                  TERMINAL CONTINUOUS ASSESSMENT & EXAMINATION REPORT SHEET
                </div>
              </div>

              {/* Student Bio Strip */}
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Student's Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {reportCardData.studentName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Admission Number:</span>
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                    {reportCardData.admissionNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Class & Arm:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {reportCardData.className} ({reportCardData.armName})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Academic Session / Term:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {reportCardData.sessionId} · {reportCardData.termId}
                  </span>
                </div>
              </div>

              {/* Attendance & Class Position Bar */}
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-slate-100 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 block">Days School Opened</span>
                  <span className="font-bold">{reportCardData.attendance.totalDays}</span>
                </div>
                <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200">
                  <span className="text-[10px] block">Days Present</span>
                  <span className="font-bold">{reportCardData.attendance.daysPresent}</span>
                </div>
                <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200">
                  <span className="text-[10px] block">Days Absent</span>
                  <span className="font-bold">{reportCardData.attendance.daysAbsent}</span>
                </div>
                <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200">
                  <span className="text-[10px] block">Total Marks</span>
                  <span className="font-bold">{reportCardData.totalMarksObtained} / {reportCardData.totalMarksPossible}</span>
                </div>
                <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200">
                  <span className="text-[10px] block">Term Average</span>
                  <span className="font-bold">{reportCardData.averageScore}%</span>
                </div>
                <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200">
                  <span className="text-[10px] block">Class Position</span>
                  <span className="font-bold text-sm">{reportCardData.classPosition} of {reportCardData.totalStudentsInClass}</span>
                </div>
              </div>

              {/* Cognitive Academic Scores Table */}
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className="bg-blue-900 text-white font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-2 text-center">1st CA (20)</th>
                      <th className="py-2.5 px-2 text-center">2nd CA (20)</th>
                      <th className="py-2.5 px-2 text-center">Exam (60)</th>
                      <th className="py-2.5 px-2 text-center">Total (100)</th>
                      <th className="py-2.5 px-2 text-center">Grade</th>
                      <th className="py-2.5 px-2 text-center">Pos</th>
                      <th className="py-2.5 px-3">Teacher's Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {reportCardData.scores.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                          {s.subjectName}
                        </td>
                        <td className="py-2 px-2 text-center font-mono">{s.ca1}</td>
                        <td className="py-2 px-2 text-center font-mono">{s.ca2}</td>
                        <td className="py-2 px-2 text-center font-mono">{s.exam}</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-slate-900 dark:text-white">
                          {s.total}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-blue-700 dark:text-blue-400">
                          {s.grade}
                        </td>
                        <td className="py-2 px-2 text-center font-medium text-slate-600 dark:text-slate-400">
                          {s.position || '1st'}
                        </td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                          {s.teacherRemark || s.remark}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Affective & Psychomotor Domains (Authentic Nigerian standard) */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Affective Domain */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-white pb-1.5 border-b border-slate-200 dark:border-slate-700 mb-2">
                    A. Affective Domain Assessment (Rating: 1 - 5)
                  </h4>
                  <div className="space-y-1.5">
                    {reportCardData.affectiveDomain.map((item) => (
                      <div key={item.trait} className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-700 dark:text-slate-300">{item.trait}</span>
                        <div className="flex gap-1 font-mono font-bold text-blue-700 dark:text-blue-400">
                          {'★'.repeat(item.rating)} ({item.rating}/5)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Psychomotor Skills */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-white pb-1.5 border-b border-slate-200 dark:border-slate-700 mb-2">
                    B. Psychomotor Domain & Practical Skills (1 - 5)
                  </h4>
                  <div className="space-y-1.5">
                    {reportCardData.psychomotorDomain.map((item) => (
                      <div key={item.skill} className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-700 dark:text-slate-300">{item.skill}</span>
                        <div className="flex gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {'★'.repeat(item.rating)} ({item.rating}/5)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Remarks, Signatures & Next Term Date */}
              <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 text-xs space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Class Teacher's Remarks:</span>
                  <p className="font-medium text-slate-900 dark:text-white italic mt-0.5">
                    "{reportCardData.classTeacherRemarks}"
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Principal's Remarks & Approval:</span>
                  <p className="font-medium text-slate-900 dark:text-white italic mt-0.5">
                    "{reportCardData.principalRemarks}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Next Term Resumption:</span>
                    <span className="font-bold text-blue-900 dark:text-blue-300">{reportCardData.nextTermBegins}</span>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">{currentSchool?.principalName}</p>
                    <p className="text-[10px] text-slate-500">Principal & Head of School</p>
                    <div className="inline-block mt-1 border border-blue-600 px-3 py-0.5 rounded text-[10px] font-bold text-blue-700 dark:text-blue-400">
                      OFFICIALLY SIGNED & SEALED
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CLASS BROADSHEET MATRIX */}
      {activeTab === 'broadsheet' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Class Academic Master Broadsheet</h3>
              <p className="text-xs text-slate-500">Cross-subject matrix for cumulative performance evaluation</p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Broadsheet</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Admission No</th>
                    <th className="py-3 px-2 text-center">Mathematics</th>
                    <th className="py-3 px-2 text-center">English</th>
                    <th className="py-3 px-2 text-center">Physics</th>
                    <th className="py-3 px-2 text-center">Chemistry</th>
                    <th className="py-3 px-2 text-center">Biology</th>
                    <th className="py-3 px-2 text-center">Total</th>
                    <th className="py-3 px-2 text-center">Average</th>
                    <th className="py-3 px-2 text-center">Class Rank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">Tobi Adebayo</td>
                    <td className="py-3 px-3 font-mono text-blue-700 dark:text-blue-400">AIA/2024/0012</td>
                    <td className="py-3 px-2 text-center font-bold text-emerald-600">91 (A1)</td>
                    <td className="py-3 px-2 text-center font-bold text-emerald-600">82 (A1)</td>
                    <td className="py-3 px-2 text-center font-bold text-emerald-600">88 (A1)</td>
                    <td className="py-3 px-2 text-center font-bold text-emerald-600">81 (A1)</td>
                    <td className="py-3 px-2 text-center font-bold text-emerald-600">80 (A1)</td>
                    <td className="py-3 px-2 text-center font-mono font-bold">695</td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-blue-700">86.9%</td>
                    <td className="py-3 px-2 text-center font-bold text-emerald-600">1st</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">Amina Ibrahim</td>
                    <td className="py-3 px-3 font-mono text-blue-700 dark:text-blue-400">AIA/2024/0018</td>
                    <td className="py-3 px-2 text-center font-bold text-emerald-600">87 (A1)</td>
                    <td className="py-3 px-2 text-center font-bold text-emerald-600">91 (A1)</td>
                    <td className="py-3 px-2 text-center font-bold text-emerald-600">84 (A1)</td>
                    <td className="py-3 px-2 text-center font-bold text-emerald-600">83 (A1)</td>
                    <td className="py-3 px-2 text-center font-bold text-emerald-600">90 (A1)</td>
                    <td className="py-3 px-2 text-center font-mono font-bold">682</td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-blue-700">85.3%</td>
                    <td className="py-3 px-2 text-center font-bold text-blue-600">2nd</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">Somtochukwu Eze</td>
                    <td className="py-3 px-3 font-mono text-blue-700 dark:text-blue-400">AIA/2024/0025</td>
                    <td className="py-3 px-2 text-center font-bold text-blue-600">75 (A1)</td>
                    <td className="py-3 px-2 text-center font-bold text-blue-600">80 (A1)</td>
                    <td className="py-3 px-2 text-center font-bold text-blue-600">77 (B2)</td>
                    <td className="py-3 px-2 text-center font-bold text-blue-600">74 (B2)</td>
                    <td className="py-3 px-2 text-center font-bold text-blue-600">76 (A1)</td>
                    <td className="py-3 px-2 text-center font-mono font-bold">610</td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-blue-700">76.3%</td>
                    <td className="py-3 px-2 text-center font-bold text-slate-600">3rd</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
