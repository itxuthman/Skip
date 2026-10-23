/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Calendar,
  ClipboardList,
  FileSpreadsheet,
  Megaphone,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Student, TimetableEntry, Assignment, Announcement, StudentReportCard } from '../../types/index.ts';
import { fetchApi } from '../../utils/api.ts';

export const StudentPortalView: React.FC = () => {
  const { currentSchool, currentUser, setActiveTab } = useApp();
  const [student, setStudent] = useState<Student | null>(null);
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [reportCard, setReportCard] = useState<StudentReportCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const allStudents = await fetchApi<Student[]>(`/api/students?schoolId=${currentSchool?.id || 'sch-001'}`);
        // Find current student or default to Tobi Adebayo
        const currentStudent = allStudents.find((s) => s.id === (currentUser?.studentId || 'stu-001')) || allStudents[0];
        setStudent(currentStudent);

        if (currentStudent) {
          const [ttData, asnData, repData] = await Promise.all([
            fetchApi<TimetableEntry[]>(`/api/timetables?schoolId=${currentSchool?.id || 'sch-001'}&classId=${currentStudent.classId}`),
            fetchApi<Assignment[]>(`/api/assignments?schoolId=${currentSchool?.id || 'sch-001'}&classId=${currentStudent.classId}`),
            fetchApi<StudentReportCard>(`/api/results/report-card/${currentStudent.id}?termId=Second Term`),
          ]);
          setTimetables(ttData);
          setAssignments(asnData);
          setReportCard(repData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [currentSchool?.id, currentUser]);

  return (
    <div className="space-y-6">
      {/* Student Welcome Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <img
            src={student?.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
            alt="Student Avatar"
            className="h-16 w-16 rounded-full object-cover ring-4 ring-white/20"
          />
          <div>
            <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <span>Student Learning Portal</span>
              <span>·</span>
              <span>{student?.className} ({student?.armName})</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-1">
              Welcome back, {student?.firstName}!
            </h1>
            <p className="text-slate-300 text-xs mt-1 font-mono">
              Admission No: {student?.admissionNumber} · {currentSchool?.name}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Term Average Score</span>
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {reportCard?.averageScore || 86.9}%
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Class Position: {reportCard?.classPosition || '1st'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Attendance Punctuality</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">96%</p>
          <p className="text-[11px] text-slate-400 mt-1">58 days present this term</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Homework</span>
            <ClipboardList className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{assignments.length}</p>
          <p className="text-[11px] text-blue-600 font-medium mt-1">Tasks due next week</p>
        </div>
      </div>

      {/* Two Column Grid: Today's Timetable + Active Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timetable Schedule */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Class Schedule & Timetable</h3>
              <p className="text-xs text-slate-500">{student?.className} Period Allocations</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('timetables')}
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Full Timetable
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {timetables.map((slot) => (
              <div
                key={slot.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{slot.subjectName}</span>
                  <p className="text-[11px] text-slate-500">
                    {slot.day} · Period {slot.period} ({slot.time})
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{slot.room}</span>
                  <p className="text-[11px] text-slate-400">{slot.teacherName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Homework & Assignments */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Class Tasks & Homework</h3>
              <p className="text-xs text-slate-500">Assigned by subject teachers</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('assignments')}
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              All Assignments
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {assignments.map((asn) => (
              <div
                key={asn.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{asn.title}</span>
                  <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                    {asn.subjectName}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2">
                  {asn.description}
                </p>
                <div className="flex justify-between items-center pt-1 text-[11px] text-slate-400 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span>Teacher: {asn.teacherName}</span>
                  <span className="font-medium text-rose-600 dark:text-rose-400">Due: {asn.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
