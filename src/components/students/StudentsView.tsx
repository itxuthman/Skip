/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  FileText,
  Printer,
  X,
  CheckCircle,
  Archive,
  Eye,
  GraduationCap,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Shield,
  Heart,
  Edit2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Student, AcademicClass } from '../../types/index.ts';
import { fetchApi } from '../../utils/api.ts';

export const StudentsView: React.FC = () => {
  const { currentSchool, showToast } = useApp();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // New Student Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    gender: 'Male' as 'Male' | 'Female',
    dateOfBirth: '2012-05-15',
    classId: '',
    armId: '',
    stateOfOrigin: 'Lagos State',
    lga: 'Ikeja',
    address: '15 Admiralty Way, Lekki Phase 1, Lagos',
    bloodGroup: 'O+',
    genotype: 'AA',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    guardianName: '',
    guardianRelationship: 'Father',
    guardianPhone: '+234 803 123 4567',
    guardianEmail: 'guardian@gmail.com',
    guardianOccupation: 'Business Executive',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, classesData] = await Promise.all([
        fetchApi<Student[]>(`/api/students?schoolId=${currentSchool?.id || 'sch-001'}`),
        fetchApi<AcademicClass[]>(`/api/academics/classes?schoolId=${currentSchool?.id || 'sch-001'}`),
      ]);
      setStudents(studentsData);
      setClasses(classesData);
      if (classesData.length > 0 && !formData.classId) {
        setFormData((prev) => ({
          ...prev,
          classId: classesData[0].id,
          armId: classesData[0].arms[0]?.id || '',
        }));
      }
    } catch (e) {
      console.error(e);
      showToast('Error loading student records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSchool?.id]);

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.classId) {
      showToast('Please fill all required student information', 'error');
      return;
    }

    try {
      const payload = {
        schoolId: currentSchool?.id || 'sch-001',
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        classId: formData.classId,
        armId: formData.armId,
        stateOfOrigin: formData.stateOfOrigin,
        lga: formData.lga,
        address: formData.address,
        bloodGroup: formData.bloodGroup,
        genotype: formData.genotype,
        avatarUrl: formData.avatarUrl,
        guardian: {
          name: formData.guardianName || 'Guardian',
          relationship: formData.guardianRelationship,
          phone: formData.guardianPhone,
          email: formData.guardianEmail,
          address: formData.address,
          occupation: formData.guardianOccupation,
        },
      };

      const newStudent = await fetchApi<Student>('/api/students', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      showToast(`Student admitted successfully! Admission No: ${newStudent.admissionNumber}`, 'success');
      setIsAddModalOpen(false);
      loadData();
      // Reset form
      setFormData((prev) => ({
        ...prev,
        firstName: '',
        lastName: '',
        middleName: '',
        guardianName: '',
      }));
    } catch (err: any) {
      showToast(err.message || 'Failed to enroll student', 'error');
    }
  };

  const handleArchiveStudent = async (studentId: string) => {
    if (!window.confirm('Are you sure you want to archive this student record?')) return;
    try {
      await fetchApi(`/api/students/${studentId}`, { method: 'DELETE' });
      showToast('Student record archived', 'info');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to archive student', 'error');
    }
  };

  const exportCsv = () => {
    const headers = ['Admission No', 'First Name', 'Last Name', 'Gender', 'Class', 'Arm', 'State of Origin', 'Guardian Name', 'Guardian Phone', 'Status'];
    const rows = filteredStudents.map((s) => [
      s.admissionNumber,
      s.firstName,
      s.lastName,
      s.gender,
      s.className,
      s.armName,
      s.stateOfOrigin,
      s.guardian.name,
      s.guardian.phone,
      s.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentSchool?.code || 'EduNaija'}_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported student roster to CSV', 'success');
  };

  const handleCsvImportSample = async () => {
    const sampleBatch = [
      { firstName: 'Chidera', lastName: 'Okafor', gender: 'Female', classId: classes[0]?.id, className: classes[0]?.name, armName: 'Gold', stateOfOrigin: 'Anambra State', guardianName: 'Mr. Jude Okafor', guardianPhone: '+234 803 999 1234' },
      { firstName: 'Yusuf', lastName: 'Mohammed', gender: 'Male', classId: classes[0]?.id, className: classes[0]?.name, armName: 'Diamond', stateOfOrigin: 'Kano State', guardianName: 'Alhaji Mohammed', guardianPhone: '+234 812 777 8899' },
    ];

    try {
      await fetchApi('/api/students/import', {
        method: 'POST',
        body: JSON.stringify({
          schoolId: currentSchool?.id || 'sch-001',
          studentsList: sampleBatch,
        }),
      });
      showToast('Successfully batch imported demo student CSV roster', 'success');
      setIsImportModalOpen(false);
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Import failed', 'error');
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClass || s.classId === selectedClass;
    const matchesStatus = !selectedStatus || s.status === selectedStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Enrollment & Records</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Admissions, biometric biodata, class assignments, and printable Nigerian student profiles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors shadow-xs"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>New Admission</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or Admission No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Class Filter */}
        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Academic Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ACTIVE">Status: Active</option>
            <option value="ARCHIVED">Status: Archived</option>
            <option value="TRANSFERRED">Status: Transferred</option>
            <option value="">All Statuses</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Admission No</th>
                <th className="py-3 px-4">Class & Arm</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">State of Origin</th>
                <th className="py-3 px-4">Guardian Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No student records found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.avatarUrl}
                          alt={s.firstName}
                          className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {s.firstName} {s.lastName}
                          </p>
                          {s.middleName && <p className="text-[11px] text-slate-400">{s.middleName}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-blue-700 dark:text-blue-400">
                      {s.admissionNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {s.className} <span className="text-slate-400">({s.armName})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{s.gender}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{s.stateOfOrigin}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{s.guardian.name}</p>
                      <p className="text-[11px] text-slate-500">{s.guardian.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudent(s);
                            setIsProfileModalOpen(true);
                          }}
                          className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="View Profile & Printable Letter"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleArchiveStudent(s.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="Archive Student"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Register New Student Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-700 text-white p-1.5">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    New Student Admission Registration
                  </h3>
                  <p className="text-xs text-slate-500">
                    Auto-generates official Nigerian admission number for {currentSchool?.code}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterStudent} className="mt-4 space-y-4">
              {/* Personal Biodata */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  1. Student Biodata
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      placeholder="e.g. Adeleke"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chukwuma"
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      State of Origin
                    </label>
                    <input
                      type="text"
                      value={formData.stateOfOrigin}
                      onChange={(e) => setFormData({ ...formData, stateOfOrigin: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Class & Arm Assignment */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  2. Academic Placement
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Enrolling Class *
                    </label>
                    <select
                      required
                      value={formData.classId}
                      onChange={(e) => {
                        const cid = e.target.value;
                        const c = classes.find((cl) => cl.id === cid);
                        setFormData({
                          ...formData,
                          classId: cid,
                          armId: c?.arms[0]?.id || '',
                        });
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.level})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Class Arm
                    </label>
                    <select
                      value={formData.armId}
                      onChange={(e) => setFormData({ ...formData, armId: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {classes
                        .find((c) => c.id === formData.classId)
                        ?.arms.map((arm) => (
                          <option key={arm.id} value={arm.id}>
                            {arm.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Parent & Guardian Contact */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  3. Guardian & Emergency Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Guardian Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chief Adeleke"
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Guardian Phone (WhatsApp/SMS) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+234 803 000 0000"
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Residential Address in Nigeria
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Actions */}
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
                  <span>Complete Admission</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Printable Student Profile & Official Admission Letter */}
      {isProfileModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto print:p-0 print:border-0">
            {/* Action Bar (hidden when printing) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 print:hidden">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Official Student Record & Admission Profile
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 shadow-xs"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Official School Letterhead */}
            <div className="p-4 mt-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
              <div className="text-center pb-3 border-b border-slate-300 dark:border-slate-700">
                <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {currentSchool?.name}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 italic">{currentSchool?.motto}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {currentSchool?.address}, {currentSchool?.city}, {currentSchool?.state} · Phone: {currentSchool?.phone}
                </p>
                <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 mt-1 uppercase">
                  OFFICIAL STUDENT ADMISSION DOSSIER
                </p>
              </div>

              {/* Bio & Passport Photo */}
              <div className="mt-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <img
                  src={selectedStudent.avatarUrl}
                  alt={selectedStudent.firstName}
                  className="h-28 w-28 rounded-lg object-cover ring-2 ring-blue-700/30"
                />
                <div className="flex-1 space-y-1.5 text-xs text-slate-800 dark:text-slate-200">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Full Name:</span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {selectedStudent.firstName} {selectedStudent.middleName} {selectedStudent.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Admission Number:</span>
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                        {selectedStudent.admissionNumber}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Class & Arm:</span>
                      <span>
                        {selectedStudent.className} ({selectedStudent.armName})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Admission:</span>
                      <span>{selectedStudent.admissionDate}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Gender:</span>
                      <span>{selectedStudent.gender}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Group:</span>
                      <span>{selectedStudent.bloodGroup || 'O+'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Genotype:</span>
                      <span>{selectedStudent.genotype || 'AA'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guardian & Origin Information */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">State of Origin & LGA:</span>
                    <span>
                      {selectedStudent.stateOfOrigin} · {selectedStudent.lga}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Residential Address:</span>
                    <span>{selectedStudent.address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary Guardian:</span>
                    <span className="font-semibold">{selectedStudent.guardian.name}</span> (
                    {selectedStudent.guardian.relationship})
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Guardian Phone:</span>
                    <span>{selectedStudent.guardian.phone}</span>
                  </div>
                </div>
              </div>

              {/* Verification & Registrar Signature */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-end text-xs text-slate-500">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Mrs. Zainab Bello-Kano
                  </p>
                  <p className="text-[10px]">Academic Registrar / Admissions</p>
                </div>
                <div className="text-right">
                  <div className="inline-block border-2 border-dashed border-blue-600/40 px-3 py-1 rounded text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase">
                    CERTIFIED OFFICIAL COPY
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Import CSV Roster */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Batch Import Students via CSV</h3>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p>Upload a standard CSV file with the following headers:</p>
              <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 break-all">
                firstName,lastName,gender,classId,armName,stateOfOrigin,guardianName,guardianPhone
              </div>
              <p className="text-[11px] text-slate-500">
                Admission numbers will be automatically generated in sequence for your school.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCsvImportSample}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Run Demo Batch Import</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
