/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { School, StudentReportCard } from '../../types/index.ts';

interface TerminalReportCardPrintProps {
  school: School;
  report: StudentReportCard;
}

export const TerminalReportCardPrint: React.FC<TerminalReportCardPrintProps> = ({ school, report }) => {
  return (
    <div className="printable-document bg-white text-slate-900 p-6 max-w-4xl mx-auto rounded-xl shadow-lg border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none text-xs">
      {/* Official Header */}
      <div className="text-center pb-3 border-b-2 border-blue-900 print:border-black">
        <div className="flex items-center justify-center gap-3">
          <img
            src={school.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80'}
            alt="School Crest"
            className="h-14 w-14 object-cover rounded-xl"
          />
          <div>
            <h1 className="text-lg md:text-xl font-black text-blue-950 print:text-black uppercase tracking-wider">
              {school.name}
            </h1>
            <p className="text-[11px] font-semibold italic text-blue-800 print:text-black">
              "{school.motto}"
            </p>
            <p className="text-[10px] text-slate-600 print:text-black">
              {school.address}, {school.city}, {school.state} · Tel: {school.phone} · Web: www.edunaija.ng
            </p>
          </div>
        </div>
        <div className="mt-2 inline-block bg-blue-900 text-white print:bg-black px-4 py-0.5 rounded text-[11px] font-bold uppercase tracking-widest">
          TERMINAL CONTINUOUS ASSESSMENT & EXAMINATION REPORT SHEET
        </div>
      </div>

      {/* Student Biodata Strip */}
      <div className="mt-3 p-2.5 bg-slate-50 print:bg-transparent rounded-lg border border-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        <div>
          <span className="text-[9px] font-bold uppercase text-slate-500 block">Student's Name:</span>
          <span className="font-bold text-slate-900 print:text-black">{report.studentName}</span>
        </div>
        <div>
          <span className="text-[9px] font-bold uppercase text-slate-500 block">Admission Number:</span>
          <span className="font-mono font-bold text-blue-900 print:text-black">{report.admissionNumber}</span>
        </div>
        <div>
          <span className="text-[9px] font-bold uppercase text-slate-500 block">Class & Arm:</span>
          <span className="font-semibold text-slate-900 print:text-black">
            {report.className} ({report.armName})
          </span>
        </div>
        <div>
          <span className="text-[9px] font-bold uppercase text-slate-500 block">Academic Term:</span>
          <span className="font-semibold text-slate-900 print:text-black">
            {report.termId} · {report.sessionId}
          </span>
        </div>
      </div>

      {/* Academic Performance Summary Strip */}
      <div className="mt-2 grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-[10px]">
        <div className="p-1.5 bg-slate-100 print:bg-transparent border border-slate-200 rounded">
          <span className="text-slate-500 block text-[9px]">Days Opened</span>
          <span className="font-bold">{report.attendance?.totalDays || 65}</span>
        </div>
        <div className="p-1.5 bg-slate-100 print:bg-transparent border border-slate-200 rounded">
          <span className="text-slate-500 block text-[9px]">Days Present</span>
          <span className="font-bold">{report.attendance?.daysPresent || 63}</span>
        </div>
        <div className="p-1.5 bg-slate-100 print:bg-transparent border border-slate-200 rounded">
          <span className="text-slate-500 block text-[9px]">Days Absent</span>
          <span className="font-bold">{report.attendance?.daysAbsent || 2}</span>
        </div>
        <div className="p-1.5 bg-slate-100 print:bg-transparent border border-slate-200 rounded">
          <span className="text-slate-500 block text-[9px]">Total Marks</span>
          <span className="font-bold">{report.totalMarksObtained} / {report.totalMarksPossible}</span>
        </div>
        <div className="p-1.5 bg-slate-100 print:bg-transparent border border-slate-200 rounded">
          <span className="text-slate-500 block text-[9px]">Term Average</span>
          <span className="font-bold text-blue-900 print:text-black">{report.averageScore}%</span>
        </div>
        <div className="p-1.5 bg-slate-100 print:bg-transparent border border-slate-200 rounded">
          <span className="text-slate-500 block text-[9px]">Class Position</span>
          <span className="font-bold text-amber-900 print:text-black">{report.classPosition}</span>
        </div>
      </div>

      {/* Subject Scores Table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left border-collapse text-[10.5px]">
          <thead>
            <tr className="bg-slate-200 print:bg-slate-100 text-slate-800 font-bold uppercase text-[9.5px]">
              <th className="p-1.5 border border-slate-400">#</th>
              <th className="p-1.5 border border-slate-400">Subject Name</th>
              <th className="p-1.5 border border-slate-400 text-center">1st CA (20)</th>
              <th className="p-1.5 border border-slate-400 text-center">2nd CA (20)</th>
              <th className="p-1.5 border border-slate-400 text-center">Exam (60)</th>
              <th className="p-1.5 border border-slate-400 text-center font-black">Total (100)</th>
              <th className="p-1.5 border border-slate-400 text-center">Grade</th>
              <th className="p-1.5 border border-slate-400">Remark</th>
              <th className="p-1.5 border border-slate-400">Teacher's Note</th>
            </tr>
          </thead>
          <tbody>
            {report.scores && report.scores.length > 0 ? (
              report.scores.map((sub, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70 print:bg-transparent'}>
                  <td className="p-1.5 border border-slate-300 text-center">{idx + 1}</td>
                  <td className="p-1.5 border border-slate-300 font-semibold">{sub.subjectName}</td>
                  <td className="p-1.5 border border-slate-300 text-center font-mono">{sub.ca1}</td>
                  <td className="p-1.5 border border-slate-300 text-center font-mono">{sub.ca2}</td>
                  <td className="p-1.5 border border-slate-300 text-center font-mono">{sub.exam}</td>
                  <td className="p-1.5 border border-slate-300 text-center font-mono font-bold bg-blue-50/50 print:bg-transparent">
                    {sub.total}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-center font-bold">{sub.grade}</td>
                  <td className="p-1.5 border border-slate-300">{sub.remark}</td>
                  <td className="p-1.5 border border-slate-300 text-slate-600 print:text-black italic text-[9.5px]">
                    {sub.teacherRemark || 'Satisfactory effort.'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-4 text-center text-slate-400 border border-slate-300">
                  No continuous assessment scores recorded yet for this terminal evaluation period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Nigerian 9-Point Grading Key & Affective Domain */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-[9.5px]">
        {/* Grading Scale Key */}
        <div className="p-2 border border-slate-300 rounded">
          <span className="font-bold text-slate-800 uppercase block mb-1">
            WAEC / NECO 9-Point Grading Key:
          </span>
          <div className="grid grid-cols-3 gap-1 text-[9px]">
            <span><strong>75 - 100%:</strong> A1 (Excellent)</span>
            <span><strong>70 - 74%:</strong> B2 (Very Good)</span>
            <span><strong>65 - 69%:</strong> B3 (Good)</span>
            <span><strong>60 - 64%:</strong> C4 (Credit)</span>
            <span><strong>55 - 59%:</strong> C5 (Credit)</span>
            <span><strong>50 - 54%:</strong> C6 (Credit)</span>
            <span><strong>45 - 49%:</strong> D7 (Pass)</span>
            <span><strong>40 - 44%:</strong> E8 (Fair Pass)</span>
            <span><strong>0 - 39%:</strong> F9 (Fail)</span>
          </div>
        </div>

        {/* Affective & Psychomotor Traits */}
        <div className="p-2 border border-slate-300 rounded">
          <span className="font-bold text-slate-800 uppercase block mb-1">
            Affective & Psychomotor Domain (Scale 1 - 5):
          </span>
          <div className="grid grid-cols-3 gap-1 text-[9px]">
            {report.psychomotorDomain && report.psychomotorDomain.length > 0 ? (
              report.psychomotorDomain.map((p, idx) => (
                <span key={idx}>{p.skill}: <strong>{p.rating}/5</strong></span>
              ))
            ) : (
              <>
                <span>Punctuality: <strong>5/5</strong></span>
                <span>Neatness: <strong>5/5</strong></span>
                <span>Politeness: <strong>5/5</strong></span>
                <span>Honesty: <strong>4/5</strong></span>
                <span>Leadership: <strong>4/5</strong></span>
                <span>Sports: <strong>4/5</strong></span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Remarks, Verdict, and Signatures */}
      <div className="mt-3 p-2.5 border border-slate-300 rounded space-y-2 text-[10.5px]">
        <div>
          <span className="font-bold text-slate-700 uppercase text-[9px] block">Class Teacher's Remark:</span>
          <p className="italic text-slate-800 print:text-black">
            "{report.classTeacherRemarks || 'A consistent, well-behaved student with commendable dedication to class activities.'}"
          </p>
        </div>
        <div>
          <span className="font-bold text-slate-700 uppercase text-[9px] block">Principal's Verdict & Advice:</span>
          <p className="italic text-slate-800 print:text-black">
            "{report.principalRemarks || 'A very good terminal result. Keep striving for excellence in all academic pursuits.'}"
          </p>
        </div>
      </div>

      {/* Signatures & Resumption Date Footer */}
      <div className="mt-4 pt-2 border-t border-slate-300 flex justify-between items-end text-[10px]">
        <div>
          <p className="font-bold text-slate-900 print:text-black">Mr. Kehinde Ogundipe</p>
          <p className="text-slate-500 print:text-black">Form Teacher / Year Tutor</p>
        </div>

        <div className="text-center">
          <div className="border border-blue-900 print:border-black px-3 py-1 rounded text-[9px] font-bold text-blue-950 print:text-black uppercase">
            CERTIFIED TERMINAL RESULT · OFFICIAL STAMP
          </div>
          <p className="text-[9px] text-slate-500 print:text-black mt-0.5">
            Next Term Resumption: <strong>{report.nextTermBegins || '11th January, 2027'}</strong>
          </p>
        </div>

        <div className="text-right">
          <p className="font-bold text-slate-900 print:text-black">Dr. Danjuma Adeleke, Ph.D</p>
          <p className="text-slate-500 print:text-black">Principal / Head of School</p>
        </div>
      </div>
    </div>
  );
};
