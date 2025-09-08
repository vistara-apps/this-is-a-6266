import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  FolderOpen, 
  Plus, 
  FileText, 
  CheckSquare, 
  Brain,
  X,
  Settings,
  User,
  Crown
} from 'lucide-react';

export default function Sidebar({ onClose }) {
  const { state, dispatch } = useApp();
  const { projects, activeProject, user } = state;

  const handleAddProject = () => {
    const name = prompt('Enter project name:');
    if (name) {
      const newProject = {
        userId: user.userId,
        name,
        description: '',
        goal: '',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
    }
  };

  const currentProject = projects.find(p => p.projectId === activeProject);

  return (
    <div className="h-full bg-surface border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-textPrimary">InsightSynth</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* User info */}
        <div className="flex items-center space-x-3 p-3 bg-bg rounded-lg">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-textPrimary truncate">{user.email}</p>
            <div className="flex items-center space-x-1">
              <Crown className="w-3 h-3 text-primary" />
              <p className="text-xs text-textSecondary capitalize">{user.subscriptionTier}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-textSecondary mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-bg transition-colors group">
              <Brain className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
              <span className="text-sm font-medium text-textPrimary">AI Synthesis</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-bg transition-colors group">
              <FileText className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
              <span className="text-sm font-medium text-textPrimary">New Note</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-bg transition-colors group">
              <CheckSquare className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
              <span className="text-sm font-medium text-textPrimary">Add Task</span>
            </button>
          </div>
        </div>

        {/* Projects */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-textSecondary">Projects</h3>
            <button
              onClick={handleAddProject}
              className="p-1 rounded-md hover:bg-border transition-colors"
            >
              <Plus className="w-4 h-4 text-textSecondary" />
            </button>
          </div>
          
          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.projectId}
                onClick={() => dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project.projectId })}
                className={`w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-colors ${
                  project.projectId === activeProject
                    ? 'bg-primary text-white'
                    : 'hover:bg-bg text-textPrimary'
                }`}
              >
                <FolderOpen className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{project.name}</p>
                  <p className={`text-xs truncate ${
                    project.projectId === activeProject ? 'text-blue-100' : 'text-textSecondary'
                  }`}>
                    {project.description || 'No description'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Project Stats */}
        {currentProject && (
          <div className="p-4 bg-bg rounded-lg">
            <h4 className="text-sm font-medium text-textPrimary mb-3">Project Overview</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-textSecondary">Notes</span>
                <span className="text-textPrimary font-medium">
                  {state.notes.filter(n => n.projectId === activeProject).length}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-textSecondary">Tasks</span>
                <span className="text-textPrimary font-medium">
                  {state.tasks.filter(t => t.projectId === activeProject).length}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-textSecondary">Completed</span>
                <span className="text-accent font-medium">
                  {state.tasks.filter(t => t.projectId === activeProject && t.isCompleted).length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-border">
        <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-bg transition-colors">
          <Settings className="w-5 h-5 text-textSecondary" />
          <span className="text-sm font-medium text-textPrimary">Settings</span>
        </button>
      </div>
    </div>
  );
}