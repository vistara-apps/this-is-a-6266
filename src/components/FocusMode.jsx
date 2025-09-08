import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Save, FileText, Clock } from 'lucide-react';

export default function FocusMode({ onExitFocus }) {
  const { state, dispatch } = useApp();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [sessionTime, setSessionTime] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  // Timer for focus session
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update word count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (!content.trim()) return;

    const noteTitle = title.trim() || `Focus Session - ${new Date().toLocaleDateString()}`;
    
    dispatch({
      type: 'ADD_NOTE',
      payload: {
        userId: state.user.userId,
        projectId: state.activeProject,
        title: noteTitle,
        content: content,
        sourceUrl: '',
        tags: ['focus-session'],
        createdAt: new Date().toISOString(),
      }
    });

    // Clear content after saving
    setContent('');
    setTitle('');
    
    // Show success message
    alert('Note saved successfully!');
  };

  return (
    <div className="min-h-screen focus-mode flex flex-col">
      {/* Minimal Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-white">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span className="font-mono text-lg">{formatTime(sessionTime)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>{wordCount} words</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          
          <button
            onClick={onExitFocus}
            className="p-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Writing Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl focus-writing-area rounded-xl p-8">
          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your note..."
            className="w-full text-2xl font-bold border-none outline-none bg-transparent placeholder-gray-400 mb-6"
          />
          
          {/* Content Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing in your distraction-free environment..."
            className="w-full h-96 text-lg leading-relaxed border-none outline-none bg-transparent resize-none placeholder-gray-400"
            autoFocus
          />
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="p-4 text-center">
        <p className="text-white text-opacity-70 text-sm">
          Focus Mode • Press Ctrl/Cmd + S to save • Click X to exit
        </p>
      </div>
    </div>
  );
}