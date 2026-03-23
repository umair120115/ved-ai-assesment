// // components/CreateAssignmentForm.tsx
// "use client";

// import { useAssignmentStore } from "../store/useAssignmentStore";
// import { useAuthStore } from "../store/useAuthStore";
// import { supabase } from "../lib/Supabase";

// export default function CreateAssignmentForm() {
//   const { 
//     questionRows, 
//     addQuestionRow, 
//     updateQuestionRow, 
//     removeQuestionRow,
//     getTotalQuestions,
//     getTotalMarks,
//     setAdditionalInfo,
//     setIsGenerating
//   } = useAssignmentStore();

//   const handleGenerate = async () => {
//     setIsGenerating(true);
    
//     try {
//       const session = useAuthStore.getState().session;
//       if (!session) {
//         alert("You must be logged in to generate an assignment.");
//         setIsGenerating(false);
//         return;
//       }

//       // Format payload for FastAPI
//       const payload = {
//         due_date: useAssignmentStore.getState().dueDate || new Date().toISOString().split('T')[0],
//         question_types: questionRows.map(row => ({
//           id: row.id,
//           type: row.type,
//           count: Number(row.count) || 0,
//           marks: Number(row.marks) || 0
//         })),
//         total_questions: getTotalQuestions(),
//         total_marks: getTotalMarks(),
//         additional_info: useAssignmentStore.getState().additionalInfo
//       };

//       // Call your Docker backend
//       const response = await fetch("http://localhost:8000/api/assignments/generate", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${session.access_token}`
//         },
//         body: JSON.stringify(payload)
//       });

//       if (!response.ok) {
//         throw new Error("Failed to queue assignment");
//       }

//       const data = await response.json();
//       console.log("Job queued! Listening for completion on ID:", data.assignment_id);

//       // Listen to Supabase Realtime for the exact row to update
//       const channel = supabase
//         .channel(`listen-assignment-${data.assignment_id}`)
//         .on(
//           'postgres_changes',
//           { event: 'UPDATE', schema: 'public', table: 'assignments', filter: `id=eq.${data.assignment_id}` },
//           (payload) => {
//             if (payload.new.status === 'completed') {
//               console.log("Paper successfully generated!");
//               useAssignmentStore.getState().setGeneratedPaper(payload.new.generated_paper);
//               setIsGenerating(false);
//               supabase.removeChannel(channel);
//             } else if (payload.new.status === 'failed') {
//               alert("AI Generation failed. Please try again.");
//               setIsGenerating(false);
//               supabase.removeChannel(channel);
//             }
//           }
//         )
//         .subscribe();

//     } catch (error: any) {
//       console.error("Submission error:", error);
//       alert(error.message);
//       setIsGenerating(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-soft p-8 max-w-4xl mx-auto border border-gray-100 relative">
//       <h2 className="text-xl font-bold text-veda-dark mb-1">Assignment Details</h2>
//       <p className="text-sm text-veda-gray mb-8">Basic information about your assignment</p>

//       {/* File Upload Zone */}
//       <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-8 bg-veda-bg cursor-pointer hover:border-veda-orange transition-colors">
//         <div className="text-2xl mb-2">☁️</div>
//         <p className="text-sm font-semibold text-veda-dark">Choose a file or drag & drop it here</p>
//         <p className="text-xs text-veda-gray mt-1">JPEG, PNG, PDF up to 10MB</p>
//         <button className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
//           Browse Files
//         </button>
//       </div>

//       {/* Dynamic Question Types */}
//       <div className="space-y-4 mb-6">
//         <div className="flex justify-between text-sm font-medium text-veda-dark mb-2 px-1">
//           <span className="w-1/2">Question Type</span>
//           <span className="w-1/4 text-center">No. of Questions</span>
//           <span className="w-1/4 text-center">Marks</span>
//         </div>

//         {questionRows.map((row) => (
//           <div key={row.id} className="flex items-center gap-4 bg-veda-bg p-3 rounded-lg border border-gray-100">
//             <select 
//               value={row.type} onChange={(e) => updateQuestionRow(row.id, 'type', e.target.value)}
//               className="w-1/2 bg-white border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:border-veda-orange"
//             >
//               <option>Multiple Choice Questions</option>
//               <option>Short Questions</option>
//               <option>Diagram/Graph-Based</option>
//               <option>Numerical Problems</option>
//             </select>
//             <button onClick={() => removeQuestionRow(row.id)} className="text-gray-400 hover:text-red-500 px-2">✕</button>
//             <input 
//               type="number" min="0" value={row.count || ''} onChange={(e) => updateQuestionRow(row.id, 'count', parseInt(e.target.value) || 0)}
//               className="w-1/4 bg-white border border-gray-200 rounded-md p-2 text-sm text-center focus:outline-none focus:border-veda-orange" placeholder="0"
//             />
//             <input 
//               type="number" min="0" value={row.marks || ''} onChange={(e) => updateQuestionRow(row.id, 'marks', parseInt(e.target.value) || 0)}
//               className="w-1/4 bg-white border border-gray-200 rounded-md p-2 text-sm text-center focus:outline-none focus:border-veda-orange" placeholder="0"
//             />
//           </div>
//         ))}
//       </div>

//       {/* Add Row & Totals */}
//       <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-8">
//         <button onClick={addQuestionRow} className="flex items-center gap-2 text-sm font-semibold text-veda-dark bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
//           <span>+</span> Add Question Type
//         </button>
//         <div className="text-right text-sm">
//           <p className="text-veda-gray mb-1">Total Questions : <span className="font-bold text-veda-dark">{getTotalQuestions()}</span></p>
//           <p className="text-veda-gray">Total Marks : <span className="font-bold text-veda-dark">{getTotalMarks()}</span></p>
//         </div>
//       </div>

//       {/* Additional Info */}
//       <div className="mb-8">
//         <label className="block text-sm font-semibold text-veda-dark mb-2">Additional Information (For better output)</label>
//         <textarea 
//           onChange={(e) => setAdditionalInfo(e.target.value)}
//           placeholder="e.g. Generate a question paper for 3-hour exam duration..."
//           className="w-full bg-veda-bg border border-gray-200 rounded-xl p-4 text-sm min-h-[100px] focus:outline-none focus:border-veda-orange"
//         />
//       </div>

//       {/* Action Buttons */}
//       <div className="flex justify-between">
//         <button className="px-6 py-2 rounded-full border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition-colors">← Previous</button>
//         <button 
//           onClick={handleGenerate}
//           disabled={getTotalQuestions() === 0}
//           className={`px-8 py-2 rounded-full text-white text-sm font-semibold transition-colors shadow-md ${getTotalQuestions() === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-veda-dark hover:bg-black"}`}
//         >
//           Next →
//         </button>
//       </div>
//     </div>
//   );
// }




// frontend/components/CreateAssignmentForm.tsx
"use client";

import { useRef } from "react"; // 1. Import useRef
import { useAssignmentStore } from "../store/useAssignmentStore";
import { useAuthStore } from "../store/useAuthStore";
import { supabase } from "../lib/Supabase";

export default function CreateAssignmentForm() {
  const { 
    file, // 2. Pull file state from Zustand
    setFile, // 3. Pull setFile action
    questionRows, 
    addQuestionRow, 
    updateQuestionRow, 
    removeQuestionRow,
    getTotalQuestions,
    getTotalMarks,
    setAdditionalInfo,
    setIsGenerating
  } = useAssignmentStore();

  // 4. Create a reference to our hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 5. Handlers for the file input
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const session = useAuthStore.getState().session;
      if (!session) {
        alert("You must be logged in to generate an assignment.");
        setIsGenerating(false);
        return;
      }

      // Format payload for FastAPI
      const payload = {
        due_date: useAssignmentStore.getState().dueDate || new Date().toISOString().split('T')[0],
        question_types: questionRows.map(row => ({
          id: row.id,
          type: row.type,
          count: Number(row.count) || 0,
          marks: Number(row.marks) || 0
        })),
        total_questions: getTotalQuestions(),
        total_marks: getTotalMarks(),
        additional_info: useAssignmentStore.getState().additionalInfo
      };

      // Call your Docker backend
      const response = await fetch("http://localhost:8000/api/assignments/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to queue assignment");
      }

      const data = await response.json();
      console.log("Job queued! Listening for completion on ID:", data.assignment_id);

      // Listen to Supabase Realtime for the exact row to update
      const channel = supabase
        .channel(`listen-assignment-${data.assignment_id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'assignments', filter: `id=eq.${data.assignment_id}` },
          (payload) => {
            if (payload.new.status === 'completed') {
              console.log("Paper successfully generated!");
              useAssignmentStore.getState().setGeneratedPaper(payload.new.generated_paper);
              setIsGenerating(false);
              supabase.removeChannel(channel);
            } else if (payload.new.status === 'failed') {
              alert("AI Generation failed. Please try again.");
              setIsGenerating(false);
              supabase.removeChannel(channel);
            }
          }
        )
        .subscribe();

    } catch (error: any) {
      console.error("Submission error:", error);
      alert(error.message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-soft p-8 max-w-4xl mx-auto border border-gray-100 relative">
      <h2 className="text-xl font-bold text-veda-dark mb-1">Assignment Details</h2>
      <p className="text-sm text-veda-gray mb-8">Basic information about your assignment</p>

      {/* --- FUNCTIONAL FILE UPLOAD ZONE --- */}
      
      {/* Hidden native file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.jpeg,.jpg,.png"
      />

      <div 
        onClick={handleFileClick}
        className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-8 bg-veda-bg cursor-pointer hover:border-veda-orange transition-colors"
      >
        {file ? (
          // View when a file is selected
          <div className="flex flex-col items-center justify-center">
             <div className="text-3xl mb-3">📄</div>
             <p className="text-sm font-bold text-veda-dark">{file.name}</p>
             <p className="text-xs text-veda-gray mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
             <button 
               onClick={(e) => { 
                 e.stopPropagation(); // Prevents the click from triggering the parent div
                 setFile(null); 
               }}
               className="mt-4 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
             >
               Remove File
             </button>
          </div>
        ) : (
          // Default empty view
          <div>
            <div className="text-2xl mb-2">☁️</div>
            <p className="text-sm font-semibold text-veda-dark">Choose a file or drag & drop it here</p>
            <p className="text-xs text-veda-gray mt-1">JPEG, PNG, PDF up to 10MB</p>
            <button className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 pointer-events-none">
              Browse Files
            </button>
          </div>
        )}
      </div>
      {/* ------------------------------------- */}

      {/* Dynamic Question Types */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm font-medium text-veda-dark mb-2 px-1">
          <span className="w-1/2">Question Type</span>
          <span className="w-1/4 text-center">No. of Questions</span>
          <span className="w-1/4 text-center">Marks</span>
        </div>

        {questionRows.map((row) => (
          <div key={row.id} className="flex items-center gap-4 bg-veda-bg p-3 rounded-lg border border-gray-100">
            <select 
              value={row.type} onChange={(e) => updateQuestionRow(row.id, 'type', e.target.value)}
              className="w-1/2 bg-white border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:border-veda-orange"
            >
              <option>Multiple Choice Questions</option>
              <option>Short Questions</option>
              <option>Diagram/Graph-Based</option>
              <option>Numerical Problems</option>
            </select>
            <button onClick={() => removeQuestionRow(row.id)} className="text-gray-400 hover:text-red-500 px-2">✕</button>
            <input 
              type="number" min="0" value={row.count || ''} onChange={(e) => updateQuestionRow(row.id, 'count', parseInt(e.target.value) || 0)}
              className="w-1/4 bg-white border border-gray-200 rounded-md p-2 text-sm text-center focus:outline-none focus:border-veda-orange" placeholder="0"
            />
            <input 
              type="number" min="0" value={row.marks || ''} onChange={(e) => updateQuestionRow(row.id, 'marks', parseInt(e.target.value) || 0)}
              className="w-1/4 bg-white border border-gray-200 rounded-md p-2 text-sm text-center focus:outline-none focus:border-veda-orange" placeholder="0"
            />
          </div>
        ))}
      </div>

      {/* Add Row & Totals */}
      <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-8">
        <button onClick={addQuestionRow} className="flex items-center gap-2 text-sm font-semibold text-veda-dark bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
          <span>+</span> Add Question Type
        </button>
        <div className="text-right text-sm">
          <p className="text-veda-gray mb-1">Total Questions : <span className="font-bold text-veda-dark">{getTotalQuestions()}</span></p>
          <p className="text-veda-gray">Total Marks : <span className="font-bold text-veda-dark">{getTotalMarks()}</span></p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-veda-dark mb-2">Additional Information (For better output)</label>
        <textarea 
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder="e.g. Generate a question paper for 3-hour exam duration..."
          className="w-full bg-veda-bg border border-gray-200 rounded-xl p-4 text-sm min-h-[100px] focus:outline-none focus:border-veda-orange"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button className="px-6 py-2 rounded-full border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition-colors">← Previous</button>
        <button 
          onClick={handleGenerate}
          disabled={getTotalQuestions() === 0}
          className={`px-8 py-2 rounded-full text-white text-sm font-semibold transition-colors shadow-md ${getTotalQuestions() === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-veda-dark hover:bg-black"}`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}