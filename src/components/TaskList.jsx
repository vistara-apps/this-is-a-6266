import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { prioritizeTasks, generateTaskSuggestions } from '../services/aiService';
import { Plus, CheckSquare, Square, Calendar, AlertTriangle, Brain, Loader2 } from 'lucide-react';

export default function TaskList() {
  const { state, dispatch } = useApp();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    description: '',
    dueDate: '',
    priority: 'medium',
  });
  const [isOptimizing, setIsOptimizing] = useState(false);

  const projectTasks = state.tasks.filter(task => task.projectId === state.activeProject);
  const currentProject = state.projects.find(p => p.projectId === state.activeProject);

  const handleAddTask = () => {
    if (!newTask.description.trim()) return;

    dispatch({
      type: 'ADD_TASK',
      payload: {
        projectId: state.activeProject,
        description: newTask.description,
        isCompleted: false,
        dueDate: newTask.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: newTask.priority,
        dependencies: [],
        createdAt: new Date().toISOString(),
      }
    });

    setNewTask({ description: '', dueDate: '', priority: 'medium' });
    setIsAddingTask(false);
  };

  const handleToggleTask = (taskId) => {
    const task = projectTasks.find(t => t.taskId === taskId);
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        taskId,
        isCompleted: !task.isCompleted,
        updatedAt: new Date().toISOString(),
      }
    });
  };

  const handleOptimizeTasks = async () => {
    if (!currentProject || projectTasks.length === 0) return;

    setIsOptimizing(true);
    try {
      const suggestions = await prioritizeTasks(projectTasks, currentProject.goal || currentProject.description);
      
      // Show AI suggestions to user
      alert(`AI Task Optimization Suggestions:\n\n${suggestions}\n\nNote: Manual priority adjustment coming soon!`);
    } catch (error) {
      alert(`Failed to optimize tasks: ${error.message}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-yellow-500 bg-yellow-50';
      case 'low': return 'text-green-500 bg-green-50';
      default: return 'text-textSecondary bg-border';
    }
  };

  const sortedTasks = projectTasks.sort((a, b) => {
    // Sort by completion status first, then priority, then due date
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-textPrimary">Tasks</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleOptimizeTasks}
              disabled={isOptimizing || projectTasks.length === 0}
              className="flex items-center space-x-2 px-3 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-colors"
            >
              {isOptimizing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">AI Optimize</span>
            </button>
            
            <button
              onClick={() => setIsAddingTask(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </div>

        {/* Add Task Form */}
        {isAddingTask && (
          <div className="space-y-3 p-4 bg-bg rounded-lg">
            <input
              type="text"
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Task description..."
              className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              autoFocus
            />
            
            <div className="flex space-x-3">
              <input
                type="date"
                value={newTask.dueDate ? newTask.dueDate.split('T')[0] : ''}
                onChange={(e) => setNewTask(prev => ({ 
                  ...prev, 
                  dueDate: e.target.value ? new Date(e.target.value).toISOString() : ''
                }))}
                className="flex-1 p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
              
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                className="flex-1 p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Add Task
              </button>
              <button
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTask({ description: '', dueDate: '', priority: 'medium' });
                }}
                className="px-4 py-2 text-textSecondary border border-border rounded-lg hover:bg-bg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{projectTasks.length}</div>
            <div className="text-xs text-textSecondary">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {projectTasks.filter(t => t.isCompleted).length}
            </div>
            <div className="text-xs text-textSecondary">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {projectTasks.filter(t => !t.isCompleted && new Date(t.dueDate) < new Date()).length}
            </div>
            <div className="text-xs text-textSecondary">Overdue</div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-border rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-8 h-8 text-textSecondary" />
            </div>
            <h3 className="text-lg font-medium text-textPrimary mb-2">No Tasks Yet</h3>
            <p className="text-textSecondary mb-4">Add your first task to get started</p>
            <button
              onClick={() => setIsAddingTask(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Add Task
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTasks.map((task) => {
              const isOverdue = !task.isCompleted && new Date(task.dueDate) < new Date();
              
              return (
                <div
                  key={task.taskId}
                  className={`p-4 rounded-lg border transition-colors ${
                    task.isCompleted
                      ? 'bg-green-50 border-green-200 opacity-75'
                      : isOverdue
                      ? 'bg-red-50 border-red-200'
                      : 'bg-surface border-border hover:bg-bg'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => handleToggleTask(task.taskId)}
                      className="flex-shrink-0 mt-1"
                    >
                      {task.isCompleted ? (
                        <CheckSquare className="w-5 h-5 text-green-500" />
                      ) : (
                        <Square className="w-5 h-5 text-textSecondary hover:text-primary transition-colors" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${
                        task.isCompleted ? 'text-textSecondary line-through' : 'text-textPrimary'
                      }`}>
                        {task.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1 text-xs text-textSecondary">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          {isOverdue && <AlertTriangle className="w-3 h-3 text-red-500" />}
                        </div>
                        
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}