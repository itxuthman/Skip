/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Calendar,
  Check,
  X,
  Clock,
  HelpCircle,
  Download,
  Send,
  Save,
  MessageSquare,
  Sparkles,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Student, AcademicClass, AttendanceRecord } from '../../types/index.ts';
import { fetchApi } from '../../utils/api.ts';
import { calculateAttendanceMetrics } from '../../utils/academicCalculations.ts';

export const AttendanceView: React.FC = () => {
  const { currentSchool, currentUser, showToast } = useApp();
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-22');
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks: string }>>({});
  const [loading, setLoading] = useState(true);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [absentStudentsList, setAbsentStudentsList] = useState<Student[]>([]);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const classesData = await fetchApi<AcademicClass[]>(`/api/academics/classes?schoolId=${currentSchool?.id || 'sch-001'}`);
        setClasses(classesData);
        if (classesData.length > 0) {
          setSelectedClassId(classesData[2]?.id || classesData[0].id); // default to JSS 1 or SSS 2
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

    async function loadRegister() {
      try {
        setLoading(true);
        const [allStudents, existingRecords] = await Promise.all([
          fetchApi<Student[]>(`/api/students?schoolId=${currentSchool?.id || 'sch-001'}&classId=${selectedClassId}&status=ACTIVE`),
          fetchApi<AttendanceRecord[]>(`/api/attendance?schoolId=${currentSchool?.id || 'sch-001'}&classId=${selectedClassId}&date=${selectedDate}`),
        ]);

        setStudentsInClass(allStudents);

        // Prepopulate map with existing records or default to PRESENT
        const initialMap: Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks: string }> = {};
        for (const s of allStudents) {
          const rec = existingRecords.find((r) => r.studentId === s.id);
          initialMap[s.id] = {
            status: rec?.status || 'PRESENT',
            remarks: rec?.remarks || '',
          };
        }
        setAttendanceMap(initialMap);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadRegister();
  }, [selectedClassId, selectedDate, currentSchool?.id]);

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const markAllPresent = () => {
    const updated = { ...attendanceMap };
    for (const sid of Object.keys(updated)) {
      updated[sid] = { ...updated[sid], status: 'PRESENT' };
    }
    setAttendanceMap(updated);
    showToast('Marked all students in class as PRESENT', 'info');
  };

  const handleSaveAttendance = async () => {
    try {
      const records = Object.entries(attendanceMap).map(([studentId, data]) => ({
        studentId,
        status: data.status,
        remarks: data.remarks,
      }));

      await fetchApi('/api/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({
          schoolId: currentSchool?.id || 'sch-001',
          classId: selectedClassId,
          date: selectedDate,
          records,
          markedBy: currentUser?.name || 'Class Teacher',
        }),
      });

      showToast(`Attendance register submitted for ${selectedDate}!`, 'success');

      // Check if any students are absent or late
      const absents = studentsInClass.filter((s) => attendanceMap[s.id]?.status === 'ABSENT');
      if (absents.length > 0) {
        setAbsentStudentsList(absents);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to save attendance', 'error');
    }
  };

  const exportAttendanceRegister = () => {
    const headers = ['Admission No', 'Student Name', 'Class', 'Date', 'Status', 'Remarks'];
    const rows = studentsInClass.map((s) => [
      s.admissionNumber,
      `${s.firstName} ${s.lastName}`,
      s.className,
      selectedDate,
      attendanceMap[s.id]?.status || 'PRESENT',
      attendanceMap[s.id]?.remarks || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported daily attendance register', 'success');
  };

  // Metrics summary
  const recordsArray = Object.values(attendanceMap);
  const metrics = calculateAttendanceMetrics(recordsArray);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily Student Attendance Register</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time morning roll call, late arrival tracking, and parent SMS notification integration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportAttendanceRegister}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Register</span>
          </button>

          <button
            type="button"
            onClick={markAllPresent}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Mark All Present</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAttendance}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save & Submit Register</span>
          </button>
        </div>
      </div>

      {/* Date & Class Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Select Class:</label>
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
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Class Teacher on Duty:</label>
          <div className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            {currentUser?.name || 'Mr. Kehinde Ogundipe'}
          </div>
        </div>
      </div>

      {/* Real-time Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Enrolled</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{metrics.total}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Present</span>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{metrics.present}</p>
        </div>
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Late</span>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{metrics.late}</p>
        </div>
        <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Absent</span>
          <p className="text-xl font-bold text-rose-700 dark:text-rose-300">{metrics.absent}</p>
        </div>
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-3 text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Attendance Rate</span>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{metrics.attendanceRate}%</p>
        </div>
      </div>

      {/* Attendance Register Interactive Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
              <tr>
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Admission No</th>
                <th className="py-3 px-4">Status Selector</th>
                <th className="py-3 px-4">Teacher Remark / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {studentsInClass.map((student, idx) => {
                const currentStatus = attendanceMap[student.id]?.status || 'PRESENT';
                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={student.avatarUrl}
                          alt={student.firstName}
                          className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400">{student.armName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-blue-700 dark:text-blue-400">
                      {student.admissionNumber}
                    </td>
                    <td className="py-3 px-4">
                      {/* 4-State Interactive Toggle */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'PRESENT')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          Present
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'LATE')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                            currentStatus === 'LATE'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          Late
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'ABSENT')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                            currentStatus === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          Absent
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'EXCUSED')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                            currentStatus === 'EXCUSED'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          Excused
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Optional remarks (e.g. clinic pass, traffic)..."
                        value={attendanceMap[student.id]?.remarks || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAttendanceMap((prev) => ({
                            ...prev,
                            [student.id]: {
                              ...prev[student.id],
                              remarks: val,
                            },
                          }));
                        }}
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

      {/* Parent SMS Notification Alert Card (Master Prompt Requirement) */}
      {absentStudentsList.length > 0 && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {absentStudentsList.length} Student(s) Marked Absent Today
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Would you like to dispatch automatic SMS absence alerts to parents via Nigerian telecom gateway?
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSmsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Preview & Send Absence SMS</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: SMS Preview for Nigerian parents */}
      {isSmsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Absence SMS Dispatch Simulation</h3>
              <button
                type="button"
                onClick={() => setIsSmsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                The following SMS notification will be dispatched to guardians:
              </p>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200">
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block mb-1">
                  SENDER: {currentSchool?.code || 'EDUNAIJA'} (MTN/Airtel/Glo Gateway)
                </span>
                "Dear Guardian, your ward was marked ABSENT at {currentSchool?.name} today ({selectedDate}). If this absence was unexcused, kindly contact the school office on {currentSchool?.phone} immediately."
              </div>

              <div className="text-xs text-slate-500">
                Recipients: {absentStudentsList.map((s) => `${s.guardian.name} (${s.guardian.phone})`).join(', ')}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsSmsModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`SMS absence broadcast dispatched to ${absentStudentsList.length} parents`, 'success');
                  setIsSmsModalOpen(false);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Confirm SMS Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
