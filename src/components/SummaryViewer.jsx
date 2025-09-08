import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Copy, Download, Save, Trash2, Eye, EyeOff } from 'lucide-react';

export default function SummaryViewer() {
  const { state, dispatch } = useApp();
  const [expandedSummary, setExpandedSummary] = useState(null);

  const syntheses = Object.entries(state.synthesisResults || {}).map(([id, result]) => ({
    id,
    ...result
  }));

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleSaveAsNote = (synthesis) => {
    const title = prompt('Enter note title:') || `AI Synthesis - ${new Date(synthesis.createdAt).toLocaleDateString()}`;
    dispatch({
      type: 'ADD_NOTE',
      payload: {
        userId: state.user.userId,
        projectId: state.activeProject,
        title,
        content: synthesis.summary,
        sourceUrl: '',
        tags: ['ai-synthesis'],
        createdAt: new Date().toISOString(),
      }
    });
  };

  const handleDelete = (synthesisId) => {
    if (confirm('Delete this synthesis?')) {
      const newResults = { ...state.synthesisResults };
      delete newResults[synthesisId];
      dispatch({
        type: 'SET_SYNTHESIS_RESULT',
        payload: { id: 'reset', result: newResults }
      });
    }
  };

  if (syntheses.length === 0) {
    return (
      <div className="bg-surface rounded-lg shadow-card p-8 text-center">
        <div className="w-16 h-16 bg-border rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-textSecondary" />
        </div>
        <h3 className="text-lg font-medium text-textPrimary mb-2">No Syntheses Yet</h3>
        <p className="text-textSecondary">Upload a document or paste text above to generate your first AI synthesis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-textPrimary">Recent Syntheses</h2>
      
      {syntheses.map((synthesis) => (
        <div key={synthesis.id} className="bg-surface rounded-lg shadow-card overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-textPrimary">
                  AI Synthesis
                </h3>
                <p className="text-sm text-textSecondary">
                  {new Date(synthesis.createdAt).toLocaleDateString()} at{' '}
                  {new Date(synthesis.createdAt).toLocaleTimeString()}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setExpandedSummary(
                    expandedSummary === synthesis.id ? null : synthesis.id
                  )}
                  className="p-2 hover:bg-border rounded-lg transition-colors"
                  title={expandedSummary === synthesis.id ? 'Collapse' : 'Expand'}
                >
                  {expandedSummary === synthesis.id ? (
                    <EyeOff className="w-4 h-4 text-textSecondary" />
                  ) : (
                    <Eye className="w-4 h-4 text-textSecondary" />
                  )}
                </button>
                
                <button
                  onClick={() => handleCopy(synthesis.summary)}
                  className="p-2 hover:bg-border rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4 text-textSecondary" />
                </button>
                
                <button
                  onClick={() => handleSaveAsNote(synthesis)}
                  className="p-2 hover:bg-border rounded-lg transition-colors"
                  title="Save as note"
                >
                  <Save className="w-4 h-4 text-textSecondary" />
                </button>
                
                <button
                  onClick={() => handleDelete(synthesis.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete synthesis"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Custom Prompt */}
            {synthesis.prompt && (
              <div className="mb-4 p-3 bg-bg rounded-lg">
                <h4 className="text-sm font-medium text-textSecondary mb-1">Custom Prompt</h4>
                <p className="text-sm text-textPrimary">{synthesis.prompt}</p>
              </div>
            )}

            {/* Summary */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-textSecondary mb-2">AI Summary</h4>
              <div className="prose prose-sm max-w-none">
                <div className="text-textPrimary whitespace-pre-wrap leading-relaxed">
                  {synthesis.summary}
                </div>
              </div>
            </div>

            {/* Original Text (Expandable) */}
            {expandedSummary === synthesis.id && (
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium text-textSecondary mb-2">Original Text</h4>
                <div className="p-3 bg-bg rounded-lg max-h-64 overflow-y-auto">
                  <p className="text-sm text-textPrimary whitespace-pre-wrap">
                    {synthesis.originalText}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}