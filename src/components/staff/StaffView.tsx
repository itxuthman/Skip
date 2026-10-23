/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  UserPlus,
  Search,
  BookOpen,
  Calendar,
  Phone,
  Mail,
  Award,
  CheckCircle,
  X,
  Briefcase,
  Shield,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Staff, AcademicClass, Subject } from '../../types/index.ts';
import { fetchApi } from '../../utils/api.ts';

export const StaffView: React.FC = () => {
  const { currentSchool, showToast } = useApp();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+234 803 000 0000',
    role: 'TEACHER',
    designation: 'Senior Subject Master',
    qualification: 'B.Sc (Ed) / PGDE',
    selectedSubjectIds: [] as string[],
    selectedClassIds: [] as string[],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffData, classesData, subjectsData] = await Promise.all([
        fetchApi<Staff[]>(`/api/staff?schoolId=${currentSchool?.id || 'sch-001'}`),
        fetchApi<AcademicClass[]>(`/api/academics/classes?schoolId=${currentSchool?.id || 'sch-001'}`),
        fetchApi<Subject[]>(`/api/academics/subjects?schoolId=${currentSchool?.id || 'sch-001'}`),
      ]);
      setStaffList(staffData);
      setClasses(classesData);
      setSubjects(subjectsData);
    } catch (e) {
      console.error(e);
      showToast('Failed to load staff list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSchool?.id]);

  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      showToast('Please provide staff name and official email', 'error');
      return;
    }

    try {
      const assignedSubjects = subjects
        .filter((s) => formData.selectedSubjectIds.includes(s.id))
        .map((s) => ({ id: s.id, name: s.name }));

      const assignedClasses = classes
        .filter((c) => formData.selectedClassIds.includes(c.id))
        .map((c) => ({ id: c.id, name: c.name }));

      await fetchApi('/api/staff', {
        method: 'POST',
        body: JSON.stringify({
          schoolId: currentSchool?.id || 'sch-001',
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          designation: formData.designation,
          qualification: formData.qualification,
          assignedSubjects,
          assignedClasses,
        }),
      });

      showToast(`Staff member registered successfully!`, 'success');
      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to register staff', 'error');
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Teachers & Staff Nominal Roll</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Teaching faculty, administrative officers, subject assignments, and qualifications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors shadow-xs"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Register Staff Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="TEACHER">Teaching Staff</option>
            <option value="PRINCIPAL">Principal / Head of School</option>
            <option value="ACCOUNTANT">Bursar / Accountant</option>
            <option value="REGISTRAR">Registrar</option>
          </select>
        </div>
      </div>

      {/* Staff Directory Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={staff.avatarUrl}
                    alt={staff.firstName}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-600/20"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {staff.firstName} {staff.lastName}
                    </h3>
                    <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                      {staff.designation}
                    </p>
                    <span className="font-mono text-[10px] text-slate-400">{staff.staffId}</span>
                  </div>
                </div>
                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {staff.status}
                </span>
              </div>

              {/* Qualifications */}
              <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{staff.qualification}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{staff.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{staff.phone}</span>
                </div>
              </div>

              {/* Assigned Subjects & Classes */}
              {staff.assignedSubjects.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Assigned Subjects:</p>
                  <div className="flex flex-wrap gap-1">
                    {staff.assignedSubjects.map((sub) => (
                      <span
                        key={sub.id}
                        className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-md"
                      >
                        {sub.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>Employed: {staff.employmentDate}</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{staff.role}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Register Staff Member</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterStaff} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Babajide"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fashola"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="b.fashola@school.ng"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+234 803 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="TEACHER">Teacher</option>
                    <option value="PRINCIPAL">Principal / Head Teacher</option>
                    <option value="ACCOUNTANT">Accountant / Bursar</option>
                    <option value="REGISTRAR">Registrar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Academic Qualifications
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B.Sc (Ed) Physics, PGDE"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Subject Mapping */}
              {formData.role === 'TEACHER' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Assign Teaching Subjects:
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-lg">
                    {subjects.map((sub) => (
                      <label key={sub.id} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.selectedSubjectIds.includes(sub.id)}
                          onChange={(e) => {
                            if (e.target.value) {
                              setFormData({
                                ...formData,
                                selectedSubjectIds: e.target.checked
                                  ? [...formData.selectedSubjectIds, sub.id]
                                  : formData.selectedSubjectIds.filter((id) => id !== sub.id),
                              });
                            }
                          }}
                          className="rounded text-blue-600"
                        />
                        <span className="truncate">{sub.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Save Staff Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
