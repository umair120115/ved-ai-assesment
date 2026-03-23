// // app/page.tsx
// "use client"; // Required since we are using Zustand hooks

// import CreateAssignmentForm from "../components/CreateAssignmentForm";
// import OutputPaper from "../components/OutputPaper";
// import { useAssignmentStore } from "../store/useAssignmentStore";

// export default function Home() {
//   const generatedPaper = useAssignmentStore((state) => state.generatedPaper);
//   const isGenerating = useAssignmentStore((state) => state.isGenerating);

//   // If paper is generated, show the output view
//   if (generatedPaper) {
//     return <OutputPaper data={generatedPaper} />;
//   }

//   return (
//     <div className="w-full h-full relative">
//       {/* Loading Overlay when waiting for Backend/Gemini */}
//       {isGenerating && (
//         <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl">
//           <div className="w-12 h-12 border-4 border-veda-orange border-t-transparent rounded-full animate-spin mb-4"></div>
//           <h2 className="text-xl font-bold text-veda-dark">Crafting Assessment...</h2>
//           <p className="text-veda-gray text-sm mt-2">AI is analyzing requirements and generating structured questions.</p>
//         </div>
//       )}
      
//       <CreateAssignmentForm />
//     </div>
//   );
// }


// frontend/app/page.tsx
"use client";

import CreateAssignmentForm from "../components/CreateAssignmentForm";
import OutputPaper from "../components/OutputPaper";
import AssignmentHistory from "../components/AssignmentHistory";
import { useAssignmentStore } from "../store/useAssignmentStore";

export default function Home() {
  const view = useAssignmentStore((state) => state.view);
  const generatedPaper = useAssignmentStore((state) => state.generatedPaper);
  const isGenerating = useAssignmentStore((state) => state.isGenerating);

  // View 1: The Final Rendered Paper
  if (view === 'paper' && generatedPaper) {
    return <OutputPaper data={generatedPaper} />;
  }

  // View 2: The Creation Form
  if (view === 'create') {
    return (
      <div className="w-full h-full relative">
        {isGenerating && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl">
            <div className="w-12 h-12 border-4 border-veda-orange border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-veda-dark">Crafting Assessment...</h2>
            <p className="text-veda-gray text-sm mt-2">AI is analyzing requirements and generating structured questions.</p>
          </div>
        )}
        <CreateAssignmentForm />
      </div>
    );
  }

  // View 3: The Default History Dashboard
  return <AssignmentHistory />;
}