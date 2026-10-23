/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle,
  X,
  MapPin,
  User,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { TimetableEntry, AcademicClass, Subject, Staff } from '../../types/index.ts';
import { fetchApi } from '../../utils/api.ts';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const PERIOD_TIMES: Record<number, string> = {
  1: '08:00 - 08:45',
  2: '08:45 - 09:30',
  3: '09:30 - 10:15',
  4: '10:45 - 11:30',
  5: '11:30 - 12:15',
  6: '12:15 - 01:00',
  7: '01:30 - 02:15',
  8: '02:15 - 03:00',
};

export const TimetableView: React.FC = () => {
  const { currentSchool, showToast } = useApp();
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Staff[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [slotDay, setSlotDay] = useState<string>('Monday');
  const [slotPeriod, setSlotPeriod] = useState<number>(1);
  const [slotSubjectId, setSlotSubjectId] = useState<string>('');
  const [slotTeacherId, setSlotTeacherId] = useState<string>('');
  const [slotRoom, setSlotRoom] = useState<string>('Room S201');

  const loadData = async () => {
    try {
      setLoading(true);
      const [classesData, subjectsData, staffData] = await Promise.all([
        fetchApi<AcademicClass[]>(`/api/academics/classes?schoolId=${currentSchool?.id || 'sch-001'}`),
        fetchApi<Subject[]>(`/api/academics/subjects?schoolId=${currentSchool?.id || 'sch-001'}`),
        fetchApi<Staff[]>(`/api/staff?schoolId=${currentSchool?.id || 'sch-001'}`),
      ]);
      setClasses(classesData);
      setSubjects(subjectsData);
      setTeachers(staffData.filter((s) => s.role === 'TEACHER'));

      if (classesData.length > 0 && !selectedClassId) {
        setSelectedClassId(classesData.find((c) => c.id === 'cls-sss2-sci')?.id || classesData[0].id);
      }
      if (subjectsData.length > 0 && !slotSubjectId) {
        setSlotSubjectId(subjectsData[0].id);
      }
      if (staffData.length > 0 && !slotTeacherId) {
        setSlotTeacherId(staffData[1]?.id || staffData[0].id);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load timetable options', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSchool?.id]);

  useEffect(() => {
    if (!selectedClassId) return;
    async function loadClassTimetable() {
      try {
        const slots = await fetchApi<TimetableEntry[]>(
          `/api/timetables?schoolId=${currentSchool?.id || 'sch-001'}&classId=${selectedClassId}`
        );
        setTimetables(slots);
      } catch (e) {
        console.error(e);
      }
    }
    loadClassTimetable();
  }, [selectedClassId, currentSchool?.id]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !slotSubjectId) return;

    try {
      await fetchApi('/api/timetables', {
        method: 'POST',
        body: JSON.stringify({
          schoolId: currentSchool?.id || 'sch-001',
          classId: selectedClassId,
          day: slotDay,
          period: slotPeriod,
          time: PERIOD_TIMES[slotPeriod],
          subjectId: slotSubjectId,
          teacherId: slotTeacherId,
          room: slotRoom,
        }),
      });

      showToast(`Scheduled Period ${slotPeriod} on ${slotDay}`, 'success');
      setIsAddModalOpen(false);
      // Reload slots
      const slots = await fetchApi<TimetableEntry[]>(
        `/api/timetables?schoolId=${currentSchool?.id || 'sch-001'}&classId=${selectedClassId}`
      );
      setTimetables(slots);
    } catch (err: any) {
      showToast(err.message || 'Timetable conflict detected', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Academic Timetable & Schedules</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Weekly class schedule with automated teacher & classroom double-booking collision prevention.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Schedule Period</span>
          </button>
        </div>
      </div>

      {/* Timetable Grid View */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
              <tr>
                <th className="py-3 px-3 w-28 border-r border-slate-200 dark:border-slate-800">Period & Time</th>
                {DAYS.map((day) => (
                  <th key={day} className="py-3 px-3 min-w-[150px] border-r border-slate-200 dark:border-slate-800 last:border-0">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {PERIODS.map((p) => (
                <tr key={p} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
                    <div>Period {p}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{PERIOD_TIMES[p]}</div>
                  </td>
                  {DAYS.map((day) => {
                    const slot = timetables.find((t) => t.day === day && t.period === p);
                    return (
                      <td key={day} className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 last:border-0 align-top">
                        {slot ? (
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-1">
                            <span className="font-bold text-blue-900 dark:text-blue-200 block truncate">
                              {slot.subjectName}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                              <User className="h-3 w-3 shrink-0" />
                              <span className="truncate">{slot.teacherName}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{slot.room}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-14 rounded border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-[11px] text-slate-300 dark:text-slate-600">
                            Free
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Period Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Schedule Class Period</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Day of Week</label>
                  <select
                    value={slotDay}
                    onChange={(e) => setSlotDay(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Period</label>
                  <select
                    value={slotPeriod}
                    onChange={(e) => setSlotPeriod(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {PERIODS.map((p) => (
                      <option key={p} value={p}>
                        Period {p} ({PERIOD_TIMES[p]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
                <select
                  value={slotSubjectId}
                  onChange={(e) => setSlotSubjectId(e.target.value)}
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
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Teacher
                </label>
                <select
                  value={slotTeacherId}
                  onChange={(e) => setSlotTeacherId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">No Teacher Assigned</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Classroom / Laboratory
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room S201, Physics Lab"
                  value={slotRoom}
                  onChange={(e) => setSlotRoom(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
                >
                  Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
