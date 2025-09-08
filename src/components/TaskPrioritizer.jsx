import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { prioritizeTasks, generateTaskSuggestions } from '../services/aiService';
import { Brain, ArrowUp, ArrowDown, Plus, Loader2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function TaskPrioritizer({ variant = 'autoSuggest' }) {
  const { state, dispatch } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  const activeProject = state.projects.find(p => p.projectId === state.activeProject);
  const projectTasks = state.tasks.filter(task => task.projectId === state.activeProject);

  const handleAIPrioritization = async () => {
    if (!activeProject || projectTasks.length === 0) return;

    setIsAnalyzing(true);
    try {
      const result = await prioritizeTasks(projectTasks, activeProject.goal);
      setSuggestions(result);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Prioritization error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateTaskSuggestions = async () => {
    if (!activeProject) return;

    setIsAnalyzing(true);
    try {
      const result = await generateTaskSuggestions(activeProject.goal, projectTasks);
      setSuggestions(result);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Task suggestion error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateTaskPriority = (taskId, newPriority) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: { taskId, priority: newPriority }
    });
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <ArrowDown className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const sortedTasks = [...projectTasks].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
  });

  if (variant === 'manualSort') {
    return (
      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-textPrimary">Task Prioritization</h3>
          <button
            onClick={handleAIPrioritization}
            disabled={isAnalyzing || projectTasks.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            AI Prioritize
          </button>
        </div>

        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <div
              key={task.taskId}
              className={`p-4 rounded-lg border-l-4 ${getPriorityColor(task.priority)} transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getPriorityIcon(task.priority)}
                  <div>
                    <p className="font-medium text-textPrimary">{task.description}</p>
                    <p className="text-sm text-textSecondary">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={task.priority}
                    onChange={(e) => updateTaskPriority(task.taskId, e.target.value)}
                    className="px-3 py-1 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  
                  {task.isCompleted && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
              
              {task.dependencies.length > 0 && (
                <div className="mt-2 text-sm text-textSecondary">
                  <span className="font-medium">Dependencies:</span> {task.dependencies.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>

        {projectTasks.length === 0 && (
          <div className="text-center py-8 text-textSecondary">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tasks found. Add some tasks to get started with prioritization.</p>
          </div>
        )}

        {showSuggestions && (
          <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-textPrimary">AI Recommendations</h4>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-textSecondary hover:text-textPrimary"
              >
                ×
              </button>
            </div>
            <div className="text-sm text-textSecondary whitespace-pre-wrap">
              {suggestions}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Auto-suggest variant
  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-textPrimary">Smart Task Management</h3>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateTaskSuggestions}
            disabled={isAnalyzing || !activeProject}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Suggest Tasks
          </button>
          
          <button
            onClick={handleAIPrioritization}
            disabled={isAnalyzing || projectTasks.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            AI Prioritize
          </button>
        </div>
      </div>

      {/* Priority Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {['high', 'medium', 'low'].map((priority) => {
          const count = projectTasks.filter(task => task.priority === priority && !task.isCompleted).length;
          return (
            <div key={priority} className="text-center p-3 rounded-lg bg-bg">
              <div className="flex items-center justify-center mb-2">
                {getPriorityIcon(priority)}
              </div>
              <p className="text-2xl font-bold text-textPrimary">{count}</p>
              <p className="text-sm text-textSecondary capitalize">{priority} Priority</p>
            </div>
          );
        })}
      </div>

      {/* Task List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedTasks.map((task) => (
          <div
            key={task.taskId}
            className={`p-4 rounded-lg border-l-4 ${getPriorityColor(task.priority)} transition-all hover:shadow-md ${
              task.isCompleted ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getPriorityIcon(task.priority)}
                <div className={task.isCompleted ? 'line-through' : ''}>
                  <p className="font-medium text-textPrimary">{task.description}</p>
                  <p className="text-sm text-textSecondary">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => dispatch({
                    type: 'UPDATE_TASK',
                    payload: { taskId: task.taskId, isCompleted: !task.isCompleted }
                  })}
                  className={`p-2 rounded-md transition-colors ${
                    task.isCompleted 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showSuggestions && (
        <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-textPrimary">AI Suggestions</h4>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-textSecondary hover:text-textPrimary"
            >
              ×
            </button>
          </div>
          <div className="text-sm text-textSecondary whitespace-pre-wrap">
            {suggestions}
          </div>
        </div>
      )}
    </div>
  );
}
