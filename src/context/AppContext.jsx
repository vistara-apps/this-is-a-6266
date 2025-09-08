import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext();

const initialState = {
  user: {
    userId: 'user-1',
    email: 'demo@insightsynth.com',
    subscriptionTier: 'pro',
    createdAt: new Date().toISOString(),
  },
  projects: [
    {
      projectId: 'project-1',
      userId: 'user-1',
      name: 'Research Project',
      description: 'AI-powered document analysis',
      goal: 'Synthesize research papers on machine learning',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    }
  ],
  notes: [
    {
      noteId: 'note-1',
      userId: 'user-1',
      projectId: 'project-1',
      title: 'Welcome to InsightSynth',
      content: 'This is your first note. Start by adding a new project or uploading a document for AI synthesis.',
      sourceUrl: '',
      tags: ['welcome', 'getting-started'],
      createdAt: new Date().toISOString(),
    }
  ],
  tasks: [
    {
      taskId: 'task-1',
      projectId: 'project-1',
      description: 'Upload research documents',
      isCompleted: false,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
      dependencies: [],
      createdAt: new Date().toISOString(),
    },
    {
      taskId: 'task-2',
      projectId: 'project-1',
      description: 'Review AI synthesis results',
      isCompleted: false,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      dependencies: ['task-1'],
      createdAt: new Date().toISOString(),
    }
  ],
  activeProject: 'project-1',
  synthesisResults: {},
  isLoading: false,
  error: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_ACTIVE_PROJECT':
      return { ...state, activeProject: action.payload };
    
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, { ...action.payload, projectId: uuidv4() }]
      };
    
    case 'ADD_NOTE':
      return {
        ...state,
        notes: [...state.notes, { ...action.payload, noteId: uuidv4() }]
      };
    
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(note => 
          note.noteId === action.payload.noteId ? { ...note, ...action.payload } : note
        )
      };
    
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note.noteId !== action.payload)
      };
    
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, { ...action.payload, taskId: uuidv4() }]
      };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.taskId === action.payload.taskId ? { ...task, ...action.payload } : task
        )
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.taskId !== action.payload)
      };
    
    case 'SET_SYNTHESIS_RESULT':
      return {
        ...state,
        synthesisResults: {
          ...state.synthesisResults,
          [action.payload.id]: action.payload.result
        }
      };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('insightsynth-data', JSON.stringify(state));
  }, [state]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('insightsynth-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(key => {
          if (key !== 'isLoading' && key !== 'error') {
            dispatch({ type: 'SET_STATE', payload: { [key]: parsed[key] } });
          }
        });
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}