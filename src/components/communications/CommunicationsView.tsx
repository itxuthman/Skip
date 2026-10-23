/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Send,
  MessageSquare,
  Mail,
  Bell,
  CheckCircle,
  X,
  Filter,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Announcement } from '../../types/index.ts';
import { fetchApi } from '../../utils/api.ts';

export const CommunicationsView: React.FC = () => {
  const { currentSchool, currentUser, showToast } = useApp();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'General' | 'Academic' | 'PTA' | 'Urgent' | 'Sports'>('Academic');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'PARENTS' | 'STAFF' | 'STUDENTS'>('ALL');
  const [sendInApp, setSendInApp] = useState(true);
  const [sendSms, setSendSms] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<Announcement[]>(`/api/announcements?schoolId=${currentSchool?.id || 'sch-001'}`);
      setAnnouncements(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSchool?.id]);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const channels: ('IN_APP' | 'SMS' | 'EMAIL')[] = [];
    if (sendInApp) channels.push('IN_APP');
    if (sendSms) channels.push('SMS');
    if (sendEmail) channels.push('EMAIL');

    try {
      await fetchApi('/api/announcements', {
        method: 'POST',
        body: JSON.stringify({
          schoolId: currentSchool?.id || 'sch-001',
          title,
          content,
          category,
          targetAudience,
          channels,
          authorName: currentUser?.name || 'School Principal',
        }),
      });

      showToast(`Announcement published and dispatched across ${channels.join(', ')}`, 'success');
      setIsNewModalOpen(false);
      setTitle('');
      setContent('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to post announcement', 'error');
    }
  };

  const filtered = announcements.filter((a) => !filterCategory || a.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Communications & Parent Broadcasts</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            School-wide circulars, PTA meeting notices, in-app notifications, and Nigerian telecom SMS broadcasts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New School Broadcast</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.map((ann) => (
          <div
            key={ann.id}
            className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    ann.category === 'Urgent'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      : ann.category === 'Academic'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {ann.category}
                </span>
                <span className="text-xs font-semibold text-slate-500">Audience: {ann.targetAudience}</span>
              </div>
              <span className="text-[11px] text-slate-400">{ann.createdAt}</span>
            </div>

            <div className="mt-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{ann.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-500">
              <span>Authorized by: <strong>{ann.authorName}</strong></span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Channels:</span>
                <div className="flex gap-1.5">
                  {ann.channels.map((ch) => (
                    <span
                      key={ch}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {ch}
                    </span>
                  ))}
                  {ann.smsStatus && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      SMS SENT
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: New Broadcast */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Broadcast School Circular</h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePostAnnouncement} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End of Term Examination Timetable Released"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Academic">Academic Notice</option>
                    <option value="General">General School Circular</option>
                    <option value="PTA">PTA Consultative Meeting</option>
                    <option value="Urgent">Urgent / Emergency Alert</option>
                    <option value="Sports">Sports & Inter-House Events</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="ALL">All Stakeholders (Whole School)</option>
                    <option value="PARENTS">Parents & Guardians Only</option>
                    <option value="STAFF">Academic & Non-Teaching Staff</option>
                    <option value="STUDENTS">Students Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Circular Message / Content *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed circular contents for parents and students..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Delivery Channels */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Dispatch Communication Channels:
                </label>
                <div className="flex gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendInApp}
                      onChange={(e) => setSendInApp(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>In-App Noticeboard</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendSms}
                      onChange={(e) => setSendSms(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>SMS to Parents</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Email Broadcast</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
