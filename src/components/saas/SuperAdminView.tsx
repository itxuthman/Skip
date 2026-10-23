/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Globe2,
  Building2,
  Plus,
  Shield,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Users,
  Search,
  ExternalLink,
  Lock,
  X,
  CreditCard,
  Activity,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { School } from '../../types/index.ts';
import { fetchApi } from '../../utils/api.ts';
import { Naira } from '../common/Naira.tsx';

export const SuperAdminView: React.FC = () => {
  const { schools, refreshSchools, setCurrentSchool, showToast } = useApp();
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [motto, setMotto] = useState('');
  const [state, setState] = useState('Lagos State');
  const [city, setCity] = useState('Lagos');
  const [address, setAddress] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [phone, setPhone] = useState('+234 800 000 0000');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<'Basic' | 'Standard' | 'Premium'>('Standard');

  const handleRegisterSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    try {
      const newSchool = await fetchApi<School>('/api/schools', {
        method: 'POST',
        body: JSON.stringify({
          name,
          code: code.toUpperCase(),
          motto: motto || 'Knowledge, Faith and Character',
          state,
          city,
          address: address || 'Lagos, Nigeria',
          principalName: principalName || 'Principal',
          phone,
          email: email || 'info@school.ng',
          subscriptionPlan: plan,
        }),
      });

      showToast(`School "${name}" (${code}) onboarded successfully!`, 'success');
      setIsAddSchoolModalOpen(false);
      setName('');
      setCode('');
      await refreshSchools();
    } catch (err: any) {
      showToast(err.message || 'Failed to onboard school', 'error');
    }
  };

  const handleToggleStatus = async (school: School) => {
    const newStatus = school.subscriptionStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await fetchApi(`/api/schools/${school.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ subscriptionStatus: newStatus }),
      });
      showToast(`${school.name} status updated to ${newStatus}`, 'info');
      await refreshSchools();
    } catch (e: any) {
      showToast(e.message || 'Failed to update school', 'error');
    }
  };

  const filteredSchools = schools.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = !selectedPlan || s.subscriptionPlan === selectedPlan;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <Globe2 className="h-4 w-4" />
              <span>Multi-School SaaS Cloud Platform</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-1">
              Platform Master Administration
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1">
              Onboard new educational institutions, manage tiered subscriptions, enforce strict multi-tenant database isolation, and monitor platform usage across Nigerian states.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddSchoolModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Onboard New School</span>
          </button>
        </div>
      </div>

      {/* Platform Aggregates */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-medium text-slate-500">Active Institutions</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{schools.length}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Lagos, Abuja, Rivers</span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-medium text-slate-500">Platform Student Body</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">2,650</p>
          <span className="text-[10px] text-blue-600 font-medium">Across primary & secondary</span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-medium text-slate-500">Monthly Recurring Revenue</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-center">
            <Naira className="mr-0.5" />
            4,250,000
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">SaaS license fees</span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-medium text-slate-500">Tenant Data Isolation</span>
          <div className="mt-1 flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
            <Lock className="h-4 w-4" />
            <span>STRICTLY ENFORCED</span>
          </div>
          <span className="text-[10px] text-slate-400">Zero cross-school data leak</span>
        </div>
      </div>

      {/* Schools Directory */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by school name, city, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">All Subscription Tiers</option>
              <option value="Basic">Basic Plan</option>
              <option value="Standard">Standard Plan</option>
              <option value="Premium">Premium Plan</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchools.map((school) => (
            <div
              key={school.id}
              className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={school.logo}
                      alt={school.name}
                      className="h-11 w-11 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{school.name}</h3>
                      <p className="font-mono text-xs text-blue-700 dark:text-blue-400 font-semibold">{school.code}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      school.subscriptionStatus === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    {school.subscriptionStatus}
                  </span>
                </div>

                <div className="mt-3.5 space-y-1 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="italic text-[11px] text-slate-500">"{school.motto}"</p>
                  <p>{school.address}, {school.city}, {school.state}</p>
                  <p>Principal: <strong>{school.principalName}</strong></p>
                  <p>Capacity: {school.studentCapacity} students</p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-blue-700 dark:text-blue-400">
                      Tier: {school.subscriptionPlan} Plan
                    </span>
                    <span className="text-slate-400">Est. {school.establishedYear}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentSchool(school);
                    showToast(`Switched active management workspace to ${school.name}`);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 rounded-md transition-colors"
                >
                  Switch into Portal
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(school)}
                  className={`text-xs font-medium hover:underline ${
                    school.subscriptionStatus === 'Active' ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {school.subscriptionStatus === 'Active' ? 'Suspend Access' : 'Reactivate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Onboard New School */}
      {isAddSchoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Onboard New School into EduNaija SaaS
              </h3>
              <button
                type="button"
                onClick={() => setIsAddSchoolModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSchool} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Institution Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Corona Secondary School, Agbara"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    School Code (3-4 Chars) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSS"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  School Motto
                </label>
                <input
                  type="text"
                  placeholder="e.g. Knowledge, Faith and Discipline"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">City / Town</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Head of School / Principal
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. John Adeleke"
                    value={principalName}
                    onChange={(e) => setPrincipalName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Subscription Tier
                  </label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Basic">Basic (Up to 500 students)</option>
                    <option value="Standard">Standard (Up to 1,500 students)</option>
                    <option value="Premium">Premium (Unlimited + SMS Gateway)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSchoolModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
                >
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
