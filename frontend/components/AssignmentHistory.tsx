// frontend/components/AssignmentHistory.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/Supabase";
import { useAssignmentStore } from "../store/useAssignmentStore";

export default function AssignmentHistory() {
  const { setView, setGeneratedPaper, assignmentsHistory, setAssignmentsHistory } = useAssignmentStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    // Fetch user's assignments ordered by newest first
    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching history:", error);
    } else {
      setAssignmentsHistory(data || []);
    }
    setIsLoading(false);
  };

  const handleViewPaper = (paperData: any) => {
    setGeneratedPaper(paperData);
    setView('paper');
  };

  if (isLoading) {
    return <div className="text-center py-20 text-veda-gray">Loading your assignments...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-soft p-8 max-w-5xl mx-auto border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-veda-dark mb-1">Assignment History</h2>
          <p className="text-sm text-veda-gray">View and manage your previously generated papers.</p>
        </div>
        <button 
          onClick={() => setView('create')}
          className="bg-veda-dark text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-black transition-colors"
        >
          + Create New
        </button>
      </div>

      {assignmentsHistory.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
          <p className="text-veda-gray mb-4">You haven't generated any assignments yet.</p>
          <button onClick={() => setView('create')} className="text-veda-orange font-bold hover:underline">
            Create your first one →
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-veda-gray border-b border-gray-200">
              <tr>
                <th className="pb-3 font-semibold">Date Created</th>
                <th className="pb-3 font-semibold">Context / Topic</th>
                <th className="pb-3 font-semibold text-center">Questions</th>
                <th className="pb-3 font-semibold text-center">Marks</th>
                <th className="pb-3 font-semibold text-center">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assignmentsHistory.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 text-veda-dark font-medium whitespace-nowrap">
                    {new Date(row.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-veda-gray truncate max-w-[200px]">
                    {row.additional_info || "General Assessment"}
                  </td>
                  <td className="py-4 text-center font-medium">{row.total_questions}</td>
                  <td className="py-4 text-center font-medium">{row.total_marks}</td>
                  <td className="py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${row.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        row.status === 'processing' ? 'bg-yellow-100 text-yellow-700' : 
                        row.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    {row.status === 'completed' && row.generated_paper && (
                      <button 
                        onClick={() => handleViewPaper(row.generated_paper)}
                        className="text-veda-orange font-bold hover:text-orange-700 hover:underline"
                      >
                        View Paper
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}