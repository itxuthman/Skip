/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Bell,
  Sun,
  Moon,
  Building2,
  ChevronDown,
  UserCheck,
  Check,
  Database,
  Trash2,
  RefreshCw,
  Sparkles,
  Menu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { UserRole } from '../../types/index.ts';

const ROLE_OPTIONS: { role: UserRole; label: string; desc: string }[] = [
  { role: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Platform SaaS manager' },
  { role: 'SCHOOL_ADMIN', label: 'School Admin', desc: 'Complete school operations' },
  { role: 'PRINCIPAL', label: 'Principal', desc: 'Head of school & supervisor' },
  { role: 'TEACHER', label: 'Teacher', desc: 'Assessments, attendance & classes' },
  { role: 'STUDENT', label: 'Student', desc: 'Results, timetable, assignments' },
  { role: 'PARENT', label: 'Parent / Guardian', desc: "Children's progress & fees" },
  { role: 'ACCOUNTANT', label: 'Accountant / Bursar', desc: 'Fees, receipts & expenses' },
  { role: 'REGISTRAR', label: 'Registrar', desc: 'Admissions & records' },
];

export const Header: React.FC<{ onMobileMenuToggle: () => void }> = ({ onMobileMenuToggle }) => {
  const {
    currentSchool,
    currentUser,
    currentRole,
    schools,
    darkMode,
    isCleanMode,
    notificationCount,
    toggleDarkMode,
    setCurrentSchool,
    switchPersona,
    clearAllDemoData,
    seedDemoData,
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [schoolMenuOpen, setSchoolMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dataMenuOpen, setDataMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
      {/* Left: Mobile hamburger & Brand/School name */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-xs">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base md:text-lg">
                EduNaija
              </span>
              <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-500 font-medium">·</span>
              <span className="hidden sm:inline text-xs font-medium text-blue-700 dark:text-blue-400">
                {currentSchool?.code || 'AIA'} Portal
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="truncate max-w-[220px] font-medium text-slate-700 dark:text-slate-300">
                {currentSchool?.name}
              </span>
              <span aria-hidden="true">·</span>
              <span>{currentSchool?.activeSession} ({currentSchool?.activeTerm})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: School switcher, Role switcher, Dark mode, Notifications, User profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Multi-school selector (especially useful for Super Admin or multi-campus) */}
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => {
              setSchoolMenuOpen(!schoolMenuOpen);
              setRoleMenuOpen(false);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Select active school"
          >
            <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="max-w-[140px] truncate">{currentSchool?.name || 'Switch School'}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {schoolMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10 z-50">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Switch Institution
              </div>
              {schools.map((sch) => (
                <button
                  key={sch.id}
                  type="button"
                  onClick={() => {
                    setCurrentSchool(sch);
                    setSchoolMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs rounded-lg transition-colors ${
                    currentSchool?.id === sch.id
                      ? 'bg-blue-50 text-blue-800 font-semibold dark:bg-blue-900/40 dark:text-blue-200'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="truncate">
                    <p className="truncate font-medium">{sch.name}</p>
                    <p className="text-[11px] text-slate-400">{sch.city}, {sch.state}</p>
                  </div>
                  {currentSchool?.id === sch.id && <Check className="h-4 w-4 shrink-0 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Role Persona Switcher (CRITICAL REQUIREMENT for testing all 8 roles) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setRoleMenuOpen(!roleMenuOpen);
              setSchoolMenuOpen(false);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
            aria-label="Switch active role demo persona"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-semibold">{currentRole.replace('_', ' ')}</span>
            <ChevronDown className="h-3.5 w-3.5 text-blue-200" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Switch Role / Preview Persona
              </div>
              <div className="max-h-80 overflow-y-auto space-y-1">
                {ROLE_OPTIONS.map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      switchPersona(item.role);
                      setRoleMenuOpen(false);
                    }}
                    className={`flex w-full items-start justify-between px-3 py-2 text-left rounded-lg transition-colors ${
                      currentRole === item.role
                        ? 'bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-medium">{item.label}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-400">{item.desc}</div>
                    </div>
                    {currentRole === item.role && <Check className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setRoleMenuOpen(false);
              setSchoolMenuOpen(false);
            }}
            className="relative p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-rose-500" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white p-3 shadow-xl ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Recent Notices</span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400">3 unread</span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-blue-50/60 dark:bg-slate-700/50">
                  <p className="font-semibold text-slate-900 dark:text-white">Mid-Term Open Day</p>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">Parent-teacher consultation on Wednesday 28th October.</p>
                  <p className="text-[10px] text-slate-400 mt-1">2 hours ago</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-slate-700/50">
                  <p className="font-semibold text-slate-900 dark:text-white">WAEC Registration Deadline</p>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">Biometrics capture closes Friday for SSS 3 candidates.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Yesterday</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Database State Menu: Clean Slate vs Sample Demo Records */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setDataMenuOpen(!dataMenuOpen);
              setRoleMenuOpen(false);
              setSchoolMenuOpen(false);
              setNotificationsOpen(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
              isCleanMode
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
            }`}
            title="Manage Database state: Clean Slate vs Sample Demo Data"
          >
            <Database className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{isCleanMode ? 'Clean Mode' : 'Demo Mode'}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {dataMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Database Records Manager
              </div>
              <div className="p-2 space-y-1">
                <button
                  type="button"
                  onClick={async () => {
                    await clearAllDemoData();
                    setDataMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4 shrink-0 text-rose-600" />
                  <div>
                    <p className="font-semibold">Clear All Demo Data</p>
                    <p className="text-[10px] text-slate-400">Empty students, scores, receipts</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await seedDemoData();
                    setDataMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-blue-600" />
                  <div>
                    <p className="font-semibold">Load Sample Demo Data</p>
                    <p className="text-[10px] text-slate-400">Seed 1,000+ sample school records</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
        </button>

        {/* User profile avatar & details */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={currentUser?.name || 'User avatar'}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-600/20"
          />
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
              {currentUser?.name || 'User'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {currentRole.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
