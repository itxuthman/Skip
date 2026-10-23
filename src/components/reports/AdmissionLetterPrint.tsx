/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { School, Student } from '../../types/index.ts';

interface AdmissionLetterPrintProps {
  school: School;
  student: Student;
}

export const AdmissionLetterPrint: React.FC<AdmissionLetterPrintProps> = ({ school, student }) => {
  const admissionYear = new Date().getFullYear();

  return (
    <div className="printable-document bg-white text-slate-900 p-8 max-w-3xl mx-auto rounded-xl shadow-lg border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
      {/* Official School Header */}
      <div className="text-center pb-4 border-b-2 border-blue-900 print:border-black">
        <div className="flex items-center justify-center gap-4">
          <img
            src={school.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80'}
            alt="School Crest"
            className="h-16 w-16 object-cover rounded-xl ring-2 ring-blue-900/40 print:ring-0"
          />
          <div>
            <h1 className="text-xl md:text-2xl font-black text-blue-950 print:text-black uppercase tracking-wider">
              {school.name}
            </h1>
            <p className="text-xs font-semibold italic text-blue-800 print:text-black">
              "{school.motto}"
            </p>
            <p className="text-[11px] text-slate-600 print:text-black mt-0.5">
              {school.address}, {school.city}, {school.state} · Tel: {school.phone} · Email: {school.email}
            </p>
            <p className="text-[10px] text-slate-500 print:text-black font-mono">
              Accredited by State Ministry of Education & WAEC/NECO Examination Council
            </p>
          </div>
        </div>
      </div>

      {/* Reference Bar */}
      <div className="mt-4 flex justify-between items-center text-xs border-b border-slate-200 pb-2">
        <div>
          <span className="font-bold text-slate-500 uppercase text-[10px] block">Official Ref:</span>
          <span className="font-mono font-bold text-blue-900 print:text-black">
            {school.code || 'AIA'}/ADM/{admissionYear}/{student.admissionNumber.split('/').pop() || '001'}
          </span>
        </div>
        <div className="text-right">
          <span className="font-bold text-slate-500 uppercase text-[10px] block">Date of Issue:</span>
          <span className="font-medium text-slate-800 print:text-black">{student.admissionDate || '2026-10-22'}</span>
        </div>
      </div>

      {/* Title */}
      <div className="mt-5 text-center">
        <span className="inline-block bg-blue-900 text-white print:bg-black px-4 py-1 text-xs font-black uppercase tracking-widest rounded">
          OFFICIAL PROVISIONAL LETTER OF ADMISSION
        </span>
      </div>

      {/* Candidate Address & Passport */}
      <div className="mt-5 flex justify-between items-start gap-4">
        <div className="space-y-1 text-xs">
          <p className="font-bold text-sm text-slate-900 print:text-black">
            {student.firstName} {student.middleName} {student.lastName}
          </p>
          <p className="text-slate-600 print:text-black">C/O {student.guardian.name} ({student.guardian.relationship})</p>
          <p className="text-slate-600 print:text-black">{student.address}</p>
          <p className="text-slate-600 print:text-black">{student.lga}, {student.stateOfOrigin}</p>
          <p className="text-slate-600 print:text-black">Tel: {student.guardian.phone}</p>
        </div>

        <div className="text-center">
          <img
            src={student.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
            alt={student.firstName}
            className="h-24 w-24 object-cover rounded border-2 border-slate-400 print:border-black mx-auto"
          />
          <span className="text-[10px] font-mono font-bold block mt-1 text-blue-900 print:text-black">
            {student.admissionNumber}
          </span>
        </div>
      </div>

      {/* Body Letter */}
      <div className="mt-6 space-y-3 text-xs leading-relaxed text-slate-800 print:text-black text-justify">
        <p>Dear <strong>{student.firstName}</strong>,</p>

        <p>
          Following your satisfactory performance in the entrance examination and interview, the Board of Governors
          and Academic Board of <strong>{school.name}</strong> are pleased to offer you provisional admission into:
        </p>

        <div className="p-3 my-2 bg-blue-50/70 print:bg-transparent print:border print:border-black rounded-lg border border-blue-200 text-center font-bold text-sm text-blue-950 print:text-black">
          CLASS: {student.className.toUpperCase()} ({student.armName.toUpperCase()}) — {school.activeSession} ACADEMIC SESSION
        </div>

        <p className="font-bold text-xs uppercase tracking-wide pt-1">Terms and Conditions of Admission:</p>
        <ol className="list-decimal pl-5 space-y-1.5 text-[11px]">
          <li>
            <strong>Acceptance Fee & Clearance:</strong> This provisional offer must be formally accepted within two (2) weeks
            of issuance by payment of the prescribed acceptance fee and submission of original credentials for sighting.
          </li>
          <li>
            <strong>Medical Fitness & Genotype Verification:</strong> A certified medical report from a recognized government
            hospital confirming blood group ({student.bloodGroup || 'O+'}) and genotype ({student.genotype || 'AA'}) is mandatory before resumption.
          </li>
          <li>
            <strong>Code of Conduct & Discipline:</strong> You will be required to abide strictly by the school’s rules,
            academic honesty policy, and standard uniform guidelines.
          </li>
          <li>
            <strong>School Fees Settlement:</strong> Full settlement of termly tuition and development levies must be concluded
            with the Bursary department before the first day of resumption.
          </li>
        </ol>

        <p className="pt-2">
          We congratulate you on this milestone and look forward to partnering with your family to nurture your academic,
          moral, and leadership potential.
        </p>
      </div>

      {/* Signatures & Seal */}
      <div className="mt-10 pt-4 border-t border-slate-300 flex justify-between items-end text-xs">
        <div>
          <div className="h-10 flex items-end">
            <span className="font-serif italic text-lg text-blue-900 print:text-black">Zainab Bello-Kano</span>
          </div>
          <p className="font-bold text-slate-900 print:text-black">Mrs. Zainab Bello-Kano</p>
          <p className="text-[10px] text-slate-500 print:text-black">Registrar & Admissions Officer</p>
        </div>

        <div className="text-center">
          <div className="inline-block border-2 border-dashed border-blue-800 print:border-black px-4 py-2 rounded-lg text-center">
            <span className="text-[9px] font-black uppercase text-blue-900 print:text-black tracking-widest block">
              OFFICIAL SEAL
            </span>
            <span className="text-[10px] font-bold text-slate-700 print:text-black block">
              {school.code || 'AIA'} REGISTRAR
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="h-10 flex items-end justify-end">
            <span className="font-serif italic text-lg text-blue-900 print:text-black">Dr. D. Adeleke</span>
          </div>
          <p className="font-bold text-slate-900 print:text-black">Dr. Danjuma Adeleke, Ph.D, FIMC</p>
          <p className="text-[10px] text-slate-500 print:text-black">Principal / Head of School</p>
        </div>
      </div>
    </div>
  );
};
