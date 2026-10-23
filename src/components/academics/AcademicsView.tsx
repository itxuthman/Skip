/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Layers,
  Calendar,
  Plus,
  CheckCircle,
  X,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { AcademicClass, Subject } from '../../types/index.ts';
import { fetchApi } from '../../utils/api.ts';

export const AcademicsView: React.FC = () => {
  const { currentSchool, showToast } = useApp();
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'classes' | 'subjects' | 'sessions'>('classes');
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Class Form State
  const [newClassName, setNewClassName] = useState('');
  const [newClassLevel, setNewClassLevel] = useState<'PRIMARY' | 'JUNIOR_SECONDARY' | 'SENIOR_SECONDARY'>('JUNIOR_SECONDARY');
  const [newClassArms, setNewClassArms] = useState('Gold, Diamond');

  // New Subject Form State
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectCategory, setNewSubjectCategory] = useState<'General' | 'Science' | 'Arts' | 'Commercial' | 'Vocational'>('General');

  const loadData = async () => {
    try {
      setLoading(true);
      const [classesData, subjectsData] = await Promise.all([
        fetchApi<AcademicClass[]>(`/api/academics/classes?schoolId=${currentSchool?.id || 'sch-001'}`),
        fetchApi<Subject[]>(`/api/academics/subjects?schoolId=${currentSchool?.id || 'sch-001'}`),
      ]);
      setClasses(classesData);
      setSubjects(subjectsData);
    } catch (e) {
      console.error(e);
      showToast('Failed to load academic structures', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSchool?.id]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName) return;

    try {
      const armsArray = newClassArms.split(',').map((a) => a.trim()).filter(Boolean);
      await fetchApi('/api/academics/classes', {
        method: 'POST',
        body: JSON.stringify({
          schoolId: currentSchool?.id || 'sch-001',
          name: newClassName,
          level: newClassLevel,
          arms: armsArray.length > 0 ? armsArray : ['Gold', 'Diamond'],
        }),
      });

      showToast(`Class "${newClassName}" created successfully`, 'success');
      setIsAddClassModalOpen(false);
      setNewClassName('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create class', 'error');
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName || !newSubjectCode) return;

    try {
      await fetchApi('/api/academics/subjects', {
        method: 'POST',
        body: JSON.stringify({
          schoolId: currentSchool?.id || 'sch-001',
          name: newSubjectName,
          code: newSubjectCode.toUpperCase(),
          category: newSubjectCategory,
        }),
      });

      showToast(`Subject "${newSubjectName}" added successfully`, 'success');
      setIsAddSubjectModalOpen(false);
      setNewSubjectName('');
      setNewSubjectCode('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to add subject', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Academic Structure & Curriculum</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sessions, terms, classes, arms, and Nigerian curriculum subject allocations.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveSubTab('classes')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'classes'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Classes & Arms ({classes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('subjects')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'subjects'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Subjects ({subjects.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('sessions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'sessions'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Sessions & Terms
          </button>
        </div>
      </div>

      {/* Tab 1: Classes & Arms */}
      {activeSubTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Academic Classes</h3>
            <button
              type="button"
              onClick={() => setIsAddClassModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Class</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{cls.name}</h4>
                      <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">{cls.level.replace('_', ' ')}</p>
                    </div>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
                      {cls.arms.length} arms
                    </span>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Class Arms:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cls.arms.map((arm) => (
                        <span
                          key={arm.id}
                          className="px-2 py-0.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200"
                        >
                          {arm.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{cls.subjects.length} Core Subjects</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active Enrolment</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Subjects */}
      {activeSubTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Curriculum Subjects</h3>
            <button
              type="button"
              onClick={() => setIsAddSubjectModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-4">Subject Code</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subjects.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{s.name}</td>
                    <td className="py-3 px-4 font-mono text-blue-700 dark:text-blue-400">{s.code}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-medium">Active</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Sessions & Terms */}
      {activeSubTab === 'sessions' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Academic Calendar</h3>
                <p className="text-xs text-slate-500">Currently active school session & term</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-lg">
                CURRENT SESSION
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Academic Session</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{currentSchool?.activeSession}</span>
                <p className="text-[11px] text-slate-500 mt-1">Sept 2025 – July 2026</p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                <span className="text-[10px] uppercase font-bold text-blue-500 block">Current Active Term</span>
                <span className="text-lg font-bold text-blue-900 dark:text-blue-100">{currentSchool?.activeTerm}</span>
                <p className="text-[11px] text-blue-600 dark:text-blue-300 mt-1">Jan 2026 – Apr 2026</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Next Term Resumption</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">Monday, 4th May 2026</span>
                <p className="text-[11px] text-slate-500 mt-1">Third / Promotional Term</p>
              </div>
            </div>

            {/* End of Session Promotion Rollover Info */}
            <div className="mt-6 p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    End-of-Session Promotion & Class Rollover Engine
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    At the conclusion of the 3rd Term, EduNaija calculates cumulative session scores (1st + 2nd + 3rd Term), evaluates pass thresholds (e.g. 50% cumulative average including English & Mathematics), and automatically promotes eligible students to the next class tier (e.g., JSS 1 → JSS 2, SSS 2 → SSS 3).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Class */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create New Academic Class</h3>
              <button
                type="button"
                onClick={() => setIsAddClassModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SSS 1 (Commercial)"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Education Level
                </label>
                <select
                  value={newClassLevel}
                  onChange={(e) => setNewClassLevel(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="PRIMARY">Primary School</option>
                  <option value="JUNIOR_SECONDARY">Junior Secondary School (JSS)</option>
                  <option value="SENIOR_SECONDARY">Senior Secondary School (SSS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Class Arms (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Gold, Diamond, Emerald"
                  value={newClassArms}
                  onChange={(e) => setNewClassArms(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Subject */}
      {isAddSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Curriculum Subject</h3>
              <button
                type="button"
                onClick={() => setIsAddSubjectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Processing / ICT"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DTP 201"
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={newSubjectCategory}
                  onChange={(e) => setNewSubjectCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="General">General</option>
                  <option value="Science">Science</option>
                  <option value="Arts">Arts</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Vocational">Vocational</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
