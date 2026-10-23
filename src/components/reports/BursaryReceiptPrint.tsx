/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { School, PaymentReceipt, Invoice } from '../../types/index.ts';

interface BursaryReceiptPrintProps {
  school: School;
  receipt: PaymentReceipt;
  invoice?: Invoice | null;
}

export const BursaryReceiptPrint: React.FC<BursaryReceiptPrintProps> = ({ school, receipt, invoice }) => {
  return (
    <div className="printable-document bg-white text-slate-900 p-6 max-w-2xl mx-auto rounded-xl shadow-lg border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none text-xs">
      {/* Receipt Header */}
      <div className="text-center pb-3 border-b-2 border-emerald-900 print:border-black">
        <div className="flex items-center justify-center gap-3">
          <img
            src={school.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80'}
            alt="School Crest"
            className="h-12 w-12 object-cover rounded-xl"
          />
          <div>
            <h1 className="text-lg font-black text-slate-900 print:text-black uppercase tracking-wider">
              {school.name}
            </h1>
            <p className="text-[10px] text-slate-500 print:text-black italic">
              BURSARY & ACCOUNTS DEPARTMENT · OFFICIAL PAYMENT RECEIPT
            </p>
            <p className="text-[10px] text-slate-500 print:text-black">
              {school.address}, {school.city}, {school.state} · Tel: {school.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="mt-3 flex justify-between items-center text-xs pb-2 border-b border-slate-200">
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Receipt Serial No:</span>
          <span className="font-mono font-bold text-emerald-800 print:text-black text-sm">
            {receipt.receiptNumber}
          </span>
        </div>
        <div className="text-center">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Transaction Reference:</span>
          <span className="font-mono text-slate-700 print:text-black text-[11px]">{receipt.reference}</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Payment Date:</span>
          <span className="font-bold text-slate-800 print:text-black">{receipt.paymentDate}</span>
        </div>
      </div>

      {/* Student Details Strip */}
      <div className="mt-3 p-3 bg-slate-50 print:bg-transparent rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
        <div>
          <span className="text-[9px] font-bold uppercase text-slate-400 block">Student's Name:</span>
          <span className="font-bold text-slate-900 print:text-black">{receipt.studentName}</span>
        </div>
        <div>
          <span className="text-[9px] font-bold uppercase text-slate-400 block">Admission Number:</span>
          <span className="font-mono font-bold text-blue-900 print:text-black">{receipt.admissionNumber}</span>
        </div>
        <div>
          <span className="text-[9px] font-bold uppercase text-slate-400 block">Class:</span>
          <span className="font-semibold text-slate-900 print:text-black">{receipt.className}</span>
        </div>
        <div>
          <span className="text-[9px] font-bold uppercase text-slate-400 block">Payment Channel:</span>
          <span className="font-semibold text-slate-900 print:text-black">{receipt.paymentMethod}</span>
        </div>
        <div>
          <span className="text-[9px] font-bold uppercase text-slate-400 block">Payer / Guardian:</span>
          <span className="font-semibold text-slate-900 print:text-black">{receipt.payerName || receipt.studentName}</span>
        </div>
        <div>
          <span className="text-[9px] font-bold uppercase text-slate-400 block">Payer Phone:</span>
          <span className="text-slate-900 print:text-black">{receipt.payerPhone || '+234 803 000 0000'}</span>
        </div>
      </div>

      {/* Itemized Invoice Breakdown if available */}
      {invoice?.items && invoice.items.length > 0 && (
        <div className="mt-3">
          <table className="w-full text-left border-collapse text-[10.5px]">
            <thead>
              <tr className="bg-slate-100 print:bg-transparent text-slate-700 font-bold uppercase text-[9px]">
                <th className="p-1 border border-slate-300">#</th>
                <th className="p-1 border border-slate-300">Fee Description</th>
                <th className="p-1 border border-slate-300 text-right">Amount (₦)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it, idx) => (
                <tr key={idx}>
                  <td className="p-1 border border-slate-200 text-center">{idx + 1}</td>
                  <td className="p-1 border border-slate-200">{it.description}</td>
                  <td className="p-1 border border-slate-200 text-right font-mono">
                    ₦{it.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Amount Box */}
      <div className="mt-3 p-4 bg-emerald-50 print:bg-transparent border-2 border-emerald-700 print:border-black rounded-xl text-center">
        <span className="text-[10px] uppercase font-bold text-emerald-800 print:text-black block">
          AMOUNT RECEIVED IN NIGERIAN NAIRA:
        </span>
        <span className="text-2xl font-black font-mono text-emerald-900 print:text-black">
          ₦{receipt.amountPaid.toLocaleString()}
        </span>
        <div className="mt-1 flex justify-center gap-6 text-[11px] text-slate-600 print:text-black">
          <span>Total Billed: <strong>₦{(invoice?.totalAmount || receipt.amountPaid + receipt.balanceRemaining).toLocaleString()}</strong></span>
          <span>Balance Remaining: <strong className={receipt.balanceRemaining > 0 ? 'text-rose-700 print:text-black' : 'text-emerald-700 print:text-black'}>₦{receipt.balanceRemaining.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Detachable Examination Clearance Pass */}
      <div className="mt-4 pt-3 border-t-2 border-dashed border-slate-400">
        <div className="p-3 bg-slate-50 print:bg-transparent border border-slate-300 rounded-lg flex justify-between items-center">
          <div>
            <span className="text-[9px] font-black uppercase text-blue-900 print:text-black tracking-widest block">
              OFFICIAL EXAMINATION & ACCESS CLEARANCE SLIP
            </span>
            <p className="text-[10.5px] font-bold text-slate-900 print:text-black mt-0.5">
              Candidate: {receipt.studentName} ({receipt.admissionNumber})
            </p>
            <p className="text-[9.5px] text-slate-500 print:text-black">
              Class: {receipt.className} · Session: {school.activeSession} ({school.activeTerm})
            </p>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
              receipt.balanceRemaining === 0
                ? 'bg-emerald-700 text-white print:border print:border-black print:text-black print:bg-transparent'
                : 'bg-amber-600 text-white print:border print:border-black print:text-black print:bg-transparent'
            }`}>
              {receipt.balanceRemaining === 0 ? 'FULL CLEARANCE: EXAM ELIGIBLE' : 'PROVISIONAL CLEARANCE'}
            </span>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-4 pt-2 border-t border-slate-300 flex justify-between items-end text-[10px]">
        <div>
          <p className="font-bold text-slate-900 print:text-black">{receipt.recordedBy || 'Mr. Segun Oladipo'}</p>
          <p className="text-slate-500 print:text-black">Authorized Bursar / Accounts Officer</p>
        </div>

        <div className="text-center">
          <div className="border border-emerald-800 print:border-black text-emerald-800 print:text-black px-3 py-0.5 rounded text-[9px] font-bold uppercase">
            PAYMENT VERIFIED & VALIDATED
          </div>
        </div>

        <div className="text-right">
          <p className="font-bold text-slate-900 print:text-black">Mrs. Funke Awolowo, FCA</p>
          <p className="text-slate-500 print:text-black">Director of Financial Services</p>
        </div>
      </div>
    </div>
  );
};
