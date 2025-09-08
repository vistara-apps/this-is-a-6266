import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import DocumentUploader from './DocumentUploader';
import NoteEditor from './NoteEditor';
import TaskList from './TaskList';
import SummaryViewer from './SummaryViewer';
import { 
  Upload, 
  FileText, 
  CheckSquare, 
  Eye,
  Focus,
  Brain,
  Zap
} from 'lucide-react';

const TAB_ITEMS = [
  { id: 'synthesis', label: 'AI Synthesis', icon: Brain },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'overview', label: 'Overview', icon: Eye },
];

export default function MainContent({ onEnterFocus }) {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('synthesis');
  const { projects, activeProject } = state;

  const currentProject = projects.find(p => p.projectId === activeProject);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'synthesis':
        return (
          <div className="space-y-6">
            <div className="bg-surface rounded-lg shadow-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-textPrimary">AI Research Synthesis</h2>
                  <p className="text-sm text-textSecondary">Upload documents or paste text for AI analysis</p>
                </div>
              </div>
              <DocumentUploader />
            </div>
            <SummaryViewer />
          </div>
        );
      
      case 'notes':
        return (
          <div className="bg-surface rounded-lg shadow-card h-full">
            <NoteEditor />
          </div>
        );
      
      case 'tasks':
        return (
          <div className="bg-surface rounded-lg shadow-card h-full">
            <TaskList />
          </div>
        );
      
      case 'overview':
        return (
          <div className="space-y-6">
            <ProjectOverview project={currentProject} />
            <RecentActivity />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-surface border-b border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-textPrimary">
              {currentProject?.name || 'Select a Project'}
            </h1>
            <p className="text-textSecondary">
              {currentProject?.description || 'Choose a project to get started'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onEnterFocus}
              className="flex items-center space-x-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              <Focus className="w-4 h-4" />
              <span className="hidden sm:inline">Focus Mode</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">AI Assist</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-bg rounded-lg p-1">
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-surface text-textPrimary shadow-sm'
                    : 'text-textSecondary hover:text-textPrimary hover:bg-surface hover:bg-opacity-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}

function ProjectOverview({ project }) {
  const { state } = useApp();
  
  if (!project) {
    return (
      <div className="bg-surface rounded-lg shadow-card p-8 text-center">
        <div className="w-16 h-16 bg-border rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-textSecondary" />
        </div>
        <h3 className="text-lg font-medium text-textPrimary mb-2">No Project Selected</h3>
        <p className="text-textSecondary">Select a project from the sidebar to view its overview.</p>
      </div>
    );
  }

  const projectNotes = state.notes.filter(n => n.projectId === project.projectId);
  const projectTasks = state.tasks.filter(t => t.projectId === project.projectId);
  const completedTasks = projectTasks.filter(t => t.isCompleted);

  return (
    <div className="bg-surface rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold text-textPrimary mb-6">Project Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-1">{projectNotes.length}</div>
          <div className="text-sm text-textSecondary">Notes</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-accent mb-1">{projectTasks.length}</div>
          <div className="text-sm text-textSecondary">Total Tasks</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-500 mb-1">{completedTasks.length}</div>
          <div className="text-sm text-textSecondary">Completed</div>
        </div>
      </div>

      {project.goal && (
        <div className="p-4 bg-bg rounded-lg">
          <h3 className="text-sm font-medium text-textSecondary mb-2">Project Goal</h3>
          <p className="text-textPrimary">{project.goal}</p>
        </div>
      )}
    </div>
  );
}

function RecentActivity() {
  const { state } = useApp();
  
  // Combine recent notes and tasks for activity feed
  const recentItems = [
    ...state.notes.map(note => ({ ...note, type: 'note', timestamp: note.createdAt })),
    ...state.tasks.map(task => ({ ...task, type: 'task', timestamp: task.createdAt }))
  ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <div className="bg-surface rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold text-textPrimary mb-4">Recent Activity</h2>
      
      <div className="space-y-3">
        {recentItems.map((item) => (
          <div key={`${item.type}-${item.noteId || item.taskId}`} className="flex items-center space-x-3 p-3 bg-bg rounded-lg">
            <div className={`p-2 rounded-lg ${
              item.type === 'note' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
            }`}>
              {item.type === 'note' ? <FileText className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-textPrimary truncate">
                {item.type === 'note' ? item.title : item.description}
              </p>
              <p className="text-xs text-textSecondary">
                {new Date(item.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}