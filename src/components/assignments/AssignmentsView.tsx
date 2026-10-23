/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Calendar,
  User,
  BookOpen,
  CheckCircle,
  X,
  Upload,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Assignment, AcademicClass, Subject } from '../../types/index.ts';
import { fetchApi } from '../../utils/api.ts';

export const AssignmentsView: React.FC = () => {
  const { currentSchool, currentUser, showToast } = useApp();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetSubjectId, setTargetSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [asnData, clsData, subData] = await Promise.all([
        fetchApi<Assignment[]>(`/api/assignments?schoolId=${currentSchool?.id || 'sch-001'}`),
        fetchApi<AcademicClass[]>(`/api/academics/classes?schoolId=${currentSchool?.id || 'sch-001'}`),
        fetchApi<Subject[]>(`/api/academics/subjects?schoolId=${currentSchool?.id || 'sch-001'}`),
      ]);
      setAssignments(asnData);
      setClasses(clsData);
      setSubjects(subData);
      if (clsData.length > 0 && !selectedClassId) {
        setSelectedClassId(clsData.find((c) => c.id === 'cls-sss2-sci')?.id || clsData[0].id);
      }
      if (subData.length > 0 && !targetSubjectId) {
        setTargetSubjectId(subData[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSchool?.id]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedClassId || !targetSubjectId) return;

    try {
      await fetchApi('/api/assignments', {
        method: 'POST',
        body: JSON.stringify({
          schoolId: currentSchool?.id || 'sch-001',
          title,
          description,
          classId: selectedClassId,
          subjectId: targetSubjectId,
          teacherName: currentUser?.name || 'Subject Master',
          dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        }),
      });

      showToast(`Assignment published for ${classes.find((c) => c.id === selectedClassId)?.name}`, 'success');
      setIsAddModalOpen(false);
      setTitle('');
      setDescription('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create assignment', 'error');
    }
  };

  const handleStudentSubmit = (asn: Assignment) => {
    setActiveAssignment(asn);
    setIsSubmitModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Assignments & Homework Tasks</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Subject coursework, project deadlines, and student homework tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((asn) => (
          <div
            key={asn.id}
            className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  {asn.subjectName}
                </span>
                <span className="text-[11px] font-mono font-medium text-rose-600 dark:text-rose-400">
                  Due: {asn.dueDate}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 leading-snug">
                {asn.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3">
                {asn.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">Class: <strong>{asn.className}</strong></span>
              <button
                type="button"
                onClick={() => handleStudentSubmit(asn)}
                className="px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 rounded-md transition-colors"
              >
                Submit Solution
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: New Assignment */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Publish Class Assignment</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry: IUPAC Nomenclature"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Class *</label>
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
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
                  <select
                    value={targetSubjectId}
                    onChange={(e) => setTargetSubjectId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Instructions & Textbook Exercises
                </label>
                <textarea
                  rows={4}
                  placeholder="Specify textbook questions, laboratory format, or essay guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Student Submission */}
      {isSubmitModalOpen && activeAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Submit Homework Assignment</h3>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">{activeAssignment.title}</p>
                <p className="text-slate-500">{activeAssignment.subjectName} · Due {activeAssignment.dueDate}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Student Notes / Answers:
                </label>
                <textarea
                  rows={4}
                  placeholder="Type written answers or summarize completed exercises..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center">
                <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Attach PDF or photos of written notes</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Simulated file attachment</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Assignment submitted to subject teacher!', 'success');
                  setIsSubmitModalOpen(false);
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
