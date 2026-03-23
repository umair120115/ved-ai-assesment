// components/OutputPaper.tsx
"use client";

import { useAssignmentStore } from "../store/useAssignmentStore";

export default function OutputPaper({ data }: { data: any }) {
  const { resetForm } = useAssignmentStore();

  if (!data || !data.sections) return null;

  return (
    <div className="w-full max-w-4xl mx-auto pb-12">
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={resetForm} className="text-sm font-semibold text-veda-gray hover:text-veda-dark">
          ← Back to Editor
        </button>
        <button onClick={() => window.print()} className="px-6 py-2 bg-veda-dark text-white text-sm font-semibold rounded-full shadow-md hover:bg-black transition">
          🖨️ Print / Download PDF
        </button>
      </div>

      {/* The A4 Paper Canvas */}
      <div className="bg-white p-12 shadow-paper rounded-sm border border-gray-200 text-black font-serif print:shadow-none print:border-none print:p-0">
        
        {/* Paper Header */}
        <div className="text-center mb-8 border-b-2 border-black pb-6">
          <h1 className="text-2xl font-bold mb-2">Delhi Public School, Sector-4, Bokaro</h1>
          <h2 className="text-xl font-semibold mb-1">Subject: Assessment</h2>
          <div className="flex justify-between text-sm mt-4 font-semibold">
            <span>Time Allowed: 3 Hours</span>
            <span>Maximum Marks: {data.total_marks}</span>
          </div>
        </div>

        {/* Student Info */}
        <div className="mb-8 text-sm space-y-4 font-semibold">
          <p>All questions are compulsory unless stated otherwise.</p>
          <div className="flex flex-col gap-3 mt-4">
             <p>Name: _______________________________</p>
             <p>Roll Number: ________________________</p>
             <p>Class & Section: ____________________</p>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-10">
          {data.sections.map((section: any, idx: number) => (
            <div key={idx}>
              <h3 className="text-lg font-bold text-center underline mb-2">{section.title}</h3>
              <p className="text-sm italic mb-4">{section.instructions}</p>
              
              <div className="space-y-6">
                {section.questions.map((q: any, qIdx: number) => (
                  <div key={qIdx} className="flex gap-4 text-sm">
                    <span className="font-bold">{qIdx + 1}.</span>
                    <div className="flex-1">
                      <p className="mb-1">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full mr-2 font-sans font-bold
                          ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : q.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {q.difficulty}
                        </span>
                        {q.text}
                      </p>
                    </div>
                    <span className="font-bold whitespace-nowrap">[{q.marks} Marks]</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}