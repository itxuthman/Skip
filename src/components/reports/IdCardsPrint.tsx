/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { School, Student, Staff } from '../../types/index.ts';

interface IdCardsPrintProps {
  school: School;
  student?: Student | null;
  staff?: Staff | null;
  cardType?: 'student' | 'staff';
}

export const IdCardsPrint: React.FC<IdCardsPrintProps> = ({
  school,
  student,
  staff,
  cardType = 'student',
}) => {
  const isStudent = cardType === 'student' && !!student;
  const personName = isStudent ? `${student.firstName} ${student.middleName || ''} ${student.lastName}` : `${staff?.firstName} ${staff?.lastName}`;
  const personId = isStudent ? student.admissionNumber : staff?.staffId || 'STF-001';
  const personRole = isStudent ? `${student.className} (${student.armName})` : staff?.designation || 'Senior Academic Master';
  const personPhoto = isStudent
    ? student.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    : staff?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  return (
    <div className="printable-document bg-white text-slate-900 p-6 max-w-2xl mx-auto rounded-xl shadow-lg border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
      <div className="text-center mb-4 print:hidden">
        <h2 className="text-sm font-bold text-slate-700">Official CR80 Identity Card (Front & Back)</h2>
        <p className="text-[11px] text-slate-400">Ready for PVC card printer or A4 laminate print</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* CARD FRONT */}
        <div className="w-[320px] h-[200px] rounded-2xl border-2 border-blue-900 print:border-black p-3.5 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white print:text-black print:bg-white shadow-md flex flex-col justify-between relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/20 print:border-black">
            <img
              src={school.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80'}
              alt="Logo"
              className="h-8 w-8 rounded-lg bg-white p-0.5 object-cover"
            />
            <div className="leading-tight">
              <h3 className="text-[11px] font-black uppercase tracking-wider">{school.name}</h3>
              <p className="text-[8px] text-blue-200 print:text-black italic">"{school.motto}"</p>
            </div>
          </div>

          {/* Body */}
          <div className="flex items-center gap-3 my-1">
            <img
              src={personPhoto}
              alt={personName}
              className="h-20 w-18 rounded-lg object-cover ring-2 ring-white/50 print:ring-black border border-white/40"
            />
            <div className="space-y-0.5 text-left">
              <p className="text-[9px] uppercase tracking-wider text-blue-200 print:text-black font-semibold">
                {isStudent ? 'STUDENT IDENTITY CARD' : 'STAFF IDENTITY CARD'}
              </p>
              <h4 className="text-xs font-black text-white print:text-black leading-tight">
                {personName}
              </h4>
              <p className="text-[10px] font-mono font-bold text-amber-300 print:text-black">
                {personId}
              </p>
              <p className="text-[9px] text-blue-100 print:text-black font-medium">{personRole}</p>
              <p className="text-[8px] text-blue-200 print:text-black">Session: {school.activeSession}</p>
            </div>
          </div>

          {/* Footer Barcode */}
          <div className="flex items-center justify-between pt-1 border-t border-white/20 print:border-black text-[8px]">
            <span className="font-mono tracking-widest text-[9px] font-bold">|||| | ||||| || |||| |||</span>
            <span className="font-bold text-amber-300 print:text-black uppercase text-[8px]">
              {school.code || 'AIA'} OFFICIAL
            </span>
          </div>
        </div>

        {/* CARD BACK */}
        <div className="w-[320px] h-[200px] rounded-2xl border-2 border-slate-300 print:border-black p-3.5 bg-slate-50 text-slate-800 shadow-md flex flex-col justify-between text-left">
          <div>
            <div className="text-center pb-1.5 border-b border-slate-200 text-[8px] font-bold uppercase tracking-wider text-slate-500">
              CARDHOLDER EMERGENCY & MEDICAL BIO
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[9px] mt-2">
              <div>
                <span className="text-[7.5px] uppercase font-bold text-slate-400 block">Blood Group:</span>
                <span className="font-bold">{isStudent ? student?.bloodGroup || 'O+' : 'O+'}</span>
              </div>
              <div>
                <span className="text-[7.5px] uppercase font-bold text-slate-400 block">Genotype:</span>
                <span className="font-bold">{isStudent ? student?.genotype || 'AA' : 'AA'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[7.5px] uppercase font-bold text-slate-400 block">Emergency Contact:</span>
                <span className="font-bold">{isStudent ? student?.guardian.phone : school.phone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[7.5px] uppercase font-bold text-slate-400 block">Residential Address:</span>
                <span className="text-[8px] text-slate-600 line-clamp-1">
                  {isStudent ? student?.address : school.address}
                </span>
              </div>
            </div>
          </div>

          {/* Legal disclaimer and registrar signature */}
          <div className="pt-1.5 border-t border-slate-200 text-[7px] text-slate-500 leading-tight">
            <p className="italic">
              This card is the property of {school.name}. If found, please return to the school administration office or the nearest police station.
            </p>
            <div className="flex justify-between items-end mt-1 text-[8px] font-bold text-slate-700">
              <span>Expiry: 31st July, {new Date().getFullYear() + 2}</span>
              <span className="border-b border-slate-400 pb-0.5">Registrar's Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
