// // store/useAssignmentStore.ts
// import { create } from 'zustand';

// export interface QuestionRow {
//   id: string;
//   type: string;
//   count: number;
//   marks: number;
// }

// interface AssignmentState {
//   file: File | null;
//   dueDate: string;
//   questionRows: QuestionRow[];
//   additionalInfo: string;
  
//   // NEW: Generation States
//   isGenerating: boolean;
//   generatedPaper: any | null;

//   // Actions
//   setFile: (file: File | null) => void;
//   setDueDate: (date: string) => void;
//   addQuestionRow: () => void;
//   updateQuestionRow: (id: string, field: keyof QuestionRow, value: string | number) => void;
//   removeQuestionRow: (id: string) => void;
//   setAdditionalInfo: (info: string) => void;
  
//   // NEW: Generation Actions
//   setIsGenerating: (status: boolean) => void;
//   setGeneratedPaper: (data: any | null) => void;
//   resetForm: () => void;

//   // Getters for derived state
//   getTotalQuestions: () => number;
//   getTotalMarks: () => number;
// }

// export const useAssignmentStore = create<AssignmentState>((set, get) => ({
//   file: null,
//   dueDate: '',
//   questionRows: [
//     { id: '1', type: 'Multiple Choice Questions', count: 0, marks: 0 }
//   ],
//   additionalInfo: '',
  
//   isGenerating: false,
//   generatedPaper: null,

//   setFile: (file) => set({ file }),
//   setDueDate: (dueDate) => set({ dueDate }),
//   addQuestionRow: () => set((state) => ({
//     questionRows: [...state.questionRows, { id: Math.random().toString(36).substring(7), type: 'Short Questions', count: 0, marks: 0 }]
//   })),
//   updateQuestionRow: (id, field, value) => set((state) => ({
//     questionRows: state.questionRows.map((row) => row.id === id ? { ...row, [field]: value } : row)
//   })),
//   removeQuestionRow: (id) => set((state) => ({
//     questionRows: state.questionRows.filter((row) => row.id !== id)
//   })),
//   setAdditionalInfo: (additionalInfo) => set({ additionalInfo }),
  
//   setIsGenerating: (isGenerating) => set({ isGenerating }),
//   setGeneratedPaper: (generatedPaper) => set({ generatedPaper }),
//   resetForm: () => set({ generatedPaper: null, isGenerating: false }),

//   getTotalQuestions: () => get().questionRows.reduce((sum, row) => sum + (Number(row.count) || 0), 0),
//   getTotalMarks: () => get().questionRows.reduce((sum, row) => sum + ((Number(row.count) || 0) * (Number(row.marks) || 0)), 0),
// }));





// frontend/store/useAssignmentStore.ts
import { create } from 'zustand';

export interface QuestionRow {
  id: string;
  type: string;
  count: number;
  marks: number;
}

interface AssignmentState {
  file: File | null;
  dueDate: string;
  questionRows: QuestionRow[];
  additionalInfo: string;
  
  // Generation States
  isGenerating: boolean;
  generatedPaper: any | null;

  // NEW: Navigation & History States
  view: 'history' | 'create' | 'paper';
  assignmentsHistory: any[];

  // Actions
  setFile: (file: File | null) => void;
  setDueDate: (date: string) => void;
  addQuestionRow: () => void;
  updateQuestionRow: (id: string, field: keyof QuestionRow, value: string | number) => void;
  removeQuestionRow: (id: string) => void;
  setAdditionalInfo: (info: string) => void;
  
  // Generation & Navigation Actions
  setIsGenerating: (status: boolean) => void;
  setGeneratedPaper: (data: any | null) => void;
  setView: (view: 'history' | 'create' | 'paper') => void;
  setAssignmentsHistory: (history: any[]) => void;
  resetForm: () => void;

  getTotalQuestions: () => number;
  getTotalMarks: () => number;
}

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  file: null,
  dueDate: '',
  questionRows: [
    { id: '1', type: 'Multiple Choice Questions', count: 0, marks: 0 }
  ],
  additionalInfo: '',
  
  isGenerating: false,
  generatedPaper: null,
  
  // Default to history view
  view: 'history',
  assignmentsHistory: [],

  setFile: (file) => set({ file }),
  setDueDate: (dueDate) => set({ dueDate }),
  addQuestionRow: () => set((state) => ({
    questionRows: [...state.questionRows, { id: Math.random().toString(36).substring(7), type: 'Short Questions', count: 0, marks: 0 }]
  })),
  updateQuestionRow: (id, field, value) => set((state) => ({
    questionRows: state.questionRows.map((row) => row.id === id ? { ...row, [field]: value } : row)
  })),
  removeQuestionRow: (id) => set((state) => ({
    questionRows: state.questionRows.filter((row) => row.id !== id)
  })),
  setAdditionalInfo: (additionalInfo) => set({ additionalInfo }),
  
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setGeneratedPaper: (generatedPaper) => set({ generatedPaper, view: 'paper' }), // Auto-switch to paper view
  setView: (view) => set({ view }),
  setAssignmentsHistory: (assignmentsHistory) => set({ assignmentsHistory }),
  
  resetForm: () => set({ 
    generatedPaper: null, 
    isGenerating: false, 
    view: 'create', // Go back to the creator form
    questionRows: [{ id: '1', type: 'Multiple Choice Questions', count: 0, marks: 0 }],
    additionalInfo: ''
  }),

  getTotalQuestions: () => get().questionRows.reduce((sum, row) => sum + (Number(row.count) || 0), 0),
  getTotalMarks: () => get().questionRows.reduce((sum, row) => sum + ((Number(row.count) || 0) * (Number(row.marks) || 0)), 0),
}));