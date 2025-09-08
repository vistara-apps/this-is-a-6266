import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, Edit3, Trash2, Tag, Calendar } from 'lucide-react';

export default function NoteEditor() {
  const { state, dispatch } = useApp();
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState({
    title: '',
    content: '',
    tags: [],
  });

  const projectNotes = state.notes.filter(note => 
    note.projectId === state.activeProject && 
    (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
     note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  useEffect(() => {
    if (selectedNote) {
      const updatedNote = state.notes.find(n => n.noteId === selectedNote.noteId);
      if (updatedNote) {
        setSelectedNote(updatedNote);
      }
    }
  }, [state.notes, selectedNote]);

  const handleCreateNote = () => {
    setIsEditing(true);
    setEditingNote({
      title: 'New Note',
      content: '',
      tags: [],
    });
    setSelectedNote(null);
  };

  const handleEditNote = (note) => {
    setIsEditing(true);
    setEditingNote({
      title: note.title,
      content: note.content,
      tags: note.tags,
    });
    setSelectedNote(note);
  };

  const handleSaveNote = () => {
    if (!editingNote.title.trim()) return;

    if (selectedNote) {
      // Update existing note
      dispatch({
        type: 'UPDATE_NOTE',
        payload: {
          noteId: selectedNote.noteId,
          ...editingNote,
          updatedAt: new Date().toISOString(),
        }
      });
    } else {
      // Create new note
      dispatch({
        type: 'ADD_NOTE',
        payload: {
          userId: state.user.userId,
          projectId: state.activeProject,
          ...editingNote,
          sourceUrl: '',
          createdAt: new Date().toISOString(),
        }
      });
    }

    setIsEditing(false);
    setEditingNote({ title: '', content: '', tags: [] });
  };

  const handleDeleteNote = (noteId) => {
    if (confirm('Delete this note?')) {
      dispatch({ type: 'DELETE_NOTE', payload: noteId });
      if (selectedNote?.noteId === noteId) {
        setSelectedNote(null);
      }
    }
  };

  const handleTagInput = (value) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    setEditingNote(prev => ({ ...prev, tags }));
  };

  return (
    <div className="h-full flex">
      {/* Notes List */}
      <div className="w-1/3 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-textPrimary">Notes</h2>
            <button
              onClick={handleCreateNote}
              className="p-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textSecondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {projectNotes.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-textSecondary">No notes found</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {projectNotes.map((note) => (
                <div
                  key={note.noteId}
                  onClick={() => setSelectedNote(note)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedNote?.noteId === note.noteId
                      ? 'bg-primary text-white'
                      : 'hover:bg-bg'
                  }`}
                >
                  <h3 className={`font-medium text-sm mb-1 truncate ${
                    selectedNote?.noteId === note.noteId ? 'text-white' : 'text-textPrimary'
                  }`}>
                    {note.title}
                  </h3>
                  <p className={`text-xs truncate mb-2 ${
                    selectedNote?.noteId === note.noteId ? 'text-blue-100' : 'text-textSecondary'
                  }`}>
                    {note.content || 'No content'}
                  </p>
                  
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className={`text-xs px-2 py-1 rounded ${
                            selectedNote?.noteId === note.noteId
                              ? 'bg-blue-500 text-white'
                              : 'bg-border text-textSecondary'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className={`text-xs ${
                          selectedNote?.noteId === note.noteId ? 'text-blue-100' : 'text-textSecondary'
                        }`}>
                          +{note.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className={`flex items-center justify-between mt-2 text-xs ${
                    selectedNote?.noteId === note.noteId ? 'text-blue-100' : 'text-textSecondary'
                  }`}>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note Content */}
      <div className="flex-1 flex flex-col">
        {isEditing ? (
          /* Edit Mode */
          <div className="h-full flex flex-col">
            {/* Edit Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-textPrimary">
                  {selectedNote ? 'Edit Note' : 'New Note'}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-textSecondary border border-border rounded-lg hover:bg-bg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
              
              {/* Title Input */}
              <input
                type="text"
                value={editingNote.title}
                onChange={(e) => setEditingNote(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Note title..."
                className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors mb-3"
              />
              
              {/* Tags Input */}
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-textSecondary" />
                <input
                  type="text"
                  value={editingNote.tags.join(', ')}
                  onChange={(e) => handleTagInput(e.target.value)}
                  placeholder="Tags (comma separated)..."
                  className="flex-1 p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Content Editor */}
            <div className="flex-1 p-4">
              <textarea
                value={editingNote.content}
                onChange={(e) => setEditingNote(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Start writing your note..."
                className="w-full h-full p-4 border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>
          </div>
        ) : selectedNote ? (
          /* View Mode */
          <div className="h-full flex flex-col">
            {/* View Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-textPrimary">{selectedNote.title}</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditNote(selectedNote)}
                    className="p-2 hover:bg-border rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-textSecondary" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(selectedNote.noteId)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              
              {/* Metadata */}
              <div className="flex items-center space-x-4 text-sm text-textSecondary mb-3">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(selectedNote.createdAt).toLocaleDateString()}</span>
                </div>
                {selectedNote.updatedAt && selectedNote.updatedAt !== selectedNote.createdAt && (
                  <span>Updated {new Date(selectedNote.updatedAt).toLocaleDateString()}</span>
                )}
              </div>
              
              {/* Tags */}
              {selectedNote.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedNote.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-border text-textSecondary text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <div className="text-textPrimary whitespace-pre-wrap leading-relaxed">
                  {selectedNote.content || 'No content'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-border rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit3 className="w-8 h-8 text-textSecondary" />
              </div>
              <h3 className="text-lg font-medium text-textPrimary mb-2">Select a Note</h3>
              <p className="text-textSecondary mb-4">Choose a note from the list or create a new one</p>
              <button
                onClick={handleCreateNote}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Create New Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}