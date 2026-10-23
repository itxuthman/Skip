/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { School, Student } from '../../types/index.ts';

interface TestimonialPrintProps {
  school: School;
  student: Student;
}

export const TestimonialPrint: React.FC<TestimonialPrintProps> = ({ school, student }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="printable-document bg-white text-slate-900 p-8 max-w-3xl mx-auto rounded-2xl shadow-xl border-4 border-double border-blue-900 print:shadow-none print:border-4 print:border-black print:p-6 print:m-0 print:max-w-none text-xs relative">
      {/* Decorative inner border */}
      <div className="border border-blue-900/30 print:border-black p-6 rounded-xl">
        {/* Certificate Header */}
        <div className="text-center pb-4 border-b-2 border-blue-900 print:border-black">
          <img
            src={school.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80'}
            alt="School Crest"
            className="h-16 w-16 object-cover rounded-xl mx-auto mb-2"
          />
          <h1 className="text-2xl font-black text-blue-950 print:text-black uppercase tracking-wider">
            {school.name}
          </h1>
          <p className="text-xs font-semibold italic text-blue-800 print:text-black">
            "{school.motto}"
          </p>
          <p className="text-[10.5px] text-slate-600 print:text-black mt-1">
            {school.address}, {school.city}, {school.state} · Federal Republic of Nigeria
          </p>
          <p className="text-[10px] text-slate-500 print:text-black font-mono">
            Government Approved · WAEC Centre No: 428019 · NECO Centre No: 028114
          </p>
        </div>

        {/* Certificate Title */}
        <div className="mt-5 text-center">
          <h2 className="text-base font-black uppercase text-blue-900 print:text-black tracking-widest">
            STUDENT'S TESTIMONIAL & CERTIFICATE OF COMPLETION
          </h2>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono mt-0.5">
            Certificate Serial Number: TEST/{currentYear}/{student.admissionNumber.split('/').pop() || '001'}
          </p>
        </div>

        {/* Certificate Body */}
        <div className="mt-6 space-y-4 text-xs leading-relaxed text-slate-800 print:text-black text-justify">
          <p>
            This is to certify that{' '}
            <strong className="text-sm underline decoration-blue-900 decoration-2 print:decoration-black uppercase">
              {student.firstName} {student.middleName} {student.lastName}
            </strong>,{' '}
            Admission Number <strong className="font-mono text-blue-900 print:text-black">{student.admissionNumber}</strong>,{' '}
            was a registered bonafide student of <strong>{school.name}</strong> from September {currentYear - 3} to July {currentYear}.
          </p>

          <p>
            During their tenure at this college, they pursued the prescribed course of studies in accordance with the
            National Curriculum for <strong>{student.className}</strong> and satisfied all graduation and continuous assessment requirements.
          </p>

          {/* Assessment Table */}
          <div className="mt-3 p-3 bg-slate-50 print:bg-transparent rounded-lg border border-slate-300 grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block">General Conduct:</span>
              <span className="font-bold text-slate-900 print:text-black">Exemplary, Respectful, and Law-abiding</span>
            </div>
            <div>
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Academic Diligence:</span>
              <span className="font-bold text-slate-900 print:text-black">Dedicated and Conscientious Learner</span>
            </div>
            <div>
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Co-Curricular Participation:</span>
              <span className="font-bold text-slate-900 print:text-black">Literary & Debating Society / STEM Club</span>
            </div>
            <div>
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Post of Responsibility Held:</span>
              <span className="font-bold text-slate-900 print:text-black">Class Prefect / Library Monitor</span>
            </div>
          </div>

          <p className="pt-2">
            We attest to their integrity and reliability, and we recommend them without reservation for higher academic
            endeavors or any future engagement of trust.
          </p>
        </div>

        {/* Seal and Signatures */}
        <div className="mt-10 pt-4 border-t border-slate-300 flex justify-between items-end text-xs">
          <div>
            <p className="font-serif italic text-base text-blue-900 print:text-black">Zainab Bello-Kano</p>
            <p className="font-bold text-slate-900 print:text-black">Mrs. Zainab Bello-Kano</p>
            <p className="text-[10px] text-slate-500 print:text-black">Registrar</p>
          </div>

          <div className="text-center">
            <div className="border-2 border-dashed border-blue-900 print:border-black px-4 py-2 rounded-xl text-center">
              <span className="text-[9px] font-black uppercase text-blue-900 print:text-black tracking-widest block">
                COLLEGE SEAL
              </span>
              <span className="text-[9.5px] font-bold text-slate-700 print:text-black">
                REPUBLIC OF NIGERIA
              </span>
            </div>
            <p className="text-[9px] text-slate-400 print:text-black mt-1">Date: 22nd October, {currentYear}</p>
          </div>

          <div className="text-right">
            <p className="font-serif italic text-base text-blue-900 print:text-black">Dr. D. Adeleke</p>
            <p className="font-bold text-slate-900 print:text-black">Dr. Danjuma Adeleke, Ph.D, FIMC</p>
            <p className="text-[10px] text-slate-500 print:text-black">Principal & Secretary to Governing Council</p>
          </div>
        </div>
      </div>
    </div>
  );
};
