import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Timer, Volume2, VolumeX, Settings } from 'lucide-react';

export default function FocusModeToggle({ variant = 'on', onToggle, isActive = false }) {
  const [focusSettings, setFocusSettings] = useState({
    hideNotifications: true,
    enableTimer: false,
    timerDuration: 25, // Pomodoro default
    enableSounds: false,
    dimBackground: true,
    hideUI: false,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let interval = null;
    
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsTimerActive(false);
            if (focusSettings.enableSounds) {
              // Play completion sound (in production, use actual audio)
              console.log('🔔 Focus session completed!');
            }
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (!isTimerActive) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining, focusSettings.enableSounds]);

  const startTimer = () => {
    setTimeRemaining(focusSettings.timerDuration * 60);
    setIsTimerActive(true);
  };

  const stopTimer = () => {
    setIsTimerActive(false);
    setTimeRemaining(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleFocus = () => {
    if (isActive && isTimerActive) {
      stopTimer();
    }
    onToggle?.();
  };

  if (variant === 'off') {
    return (
      <button
        onClick={handleToggleFocus}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
        title="Enter Focus Mode"
      >
        <EyeOff className="w-4 h-4" />
        <span className="hidden sm:inline">Focus Mode</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Timer Display */}
      {isActive && focusSettings.enableTimer && timeRemaining !== null && (
        <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-md text-accent">
          <Timer className="w-4 h-4" />
          <span className="font-mono text-sm">{formatTime(timeRemaining)}</span>
        </div>
      )}

      {/* Focus Toggle Button */}
      <button
        onClick={handleToggleFocus}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
          isActive
            ? 'bg-accent text-white hover:bg-accent/90'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title={isActive ? 'Exit Focus Mode' : 'Enter Focus Mode'}
      >
        {isActive ? (
          <>
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Focus</span>
          </>
        ) : (
          <>
            <EyeOff className="w-4 h-4" />
            <span className="hidden sm:inline">Focus Mode</span>
          </>
        )}
      </button>

      {/* Timer Controls */}
      {isActive && focusSettings.enableTimer && (
        <div className="flex items-center gap-1">
          {!isTimerActive ? (
            <button
              onClick={startTimer}
              className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
              title="Start Focus Timer"
            >
              <Timer className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={stopTimer}
              className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
              title="Stop Timer"
            >
              <Timer className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
        title="Focus Settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-surface border border-border rounded-lg shadow-card p-4 z-50">
          <h3 className="font-medium text-textPrimary mb-4">Focus Mode Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-textPrimary">Hide Notifications</label>
              <input
                type="checkbox"
                checked={focusSettings.hideNotifications}
                onChange={(e) => setFocusSettings(prev => ({
                  ...prev,
                  hideNotifications: e.target.checked
                }))}
                className="rounded border-border focus:ring-accent"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-textPrimary">Enable Timer</label>
              <input
                type="checkbox"
                checked={focusSettings.enableTimer}
                onChange={(e) => setFocusSettings(prev => ({
                  ...prev,
                  enableTimer: e.target.checked
                }))}
                className="rounded border-border focus:ring-accent"
              />
            </div>

            {focusSettings.enableTimer && (
              <div className="flex items-center justify-between">
                <label className="text-sm text-textPrimary">Timer Duration (minutes)</label>
                <select
                  value={focusSettings.timerDuration}
                  onChange={(e) => setFocusSettings(prev => ({
                    ...prev,
                    timerDuration: parseInt(e.target.value)
                  }))}
                  className="px-2 py-1 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value={15}>15 min</option>
                  <option value={25}>25 min (Pomodoro)</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="text-sm text-textPrimary">Enable Sounds</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={focusSettings.enableSounds}
                  onChange={(e) => setFocusSettings(prev => ({
                    ...prev,
                    enableSounds: e.target.checked
                  }))}
                  className="rounded border-border focus:ring-accent"
                />
                {focusSettings.enableSounds ? (
                  <Volume2 className="w-4 h-4 text-textSecondary" />
                ) : (
                  <VolumeX className="w-4 h-4 text-textSecondary" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-textPrimary">Dim Background</label>
              <input
                type="checkbox"
                checked={focusSettings.dimBackground}
                onChange={(e) => setFocusSettings(prev => ({
                  ...prev,
                  dimBackground: e.target.checked
                }))}
                className="rounded border-border focus:ring-accent"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-textPrimary">Minimal UI</label>
              <input
                type="checkbox"
                checked={focusSettings.hideUI}
                onChange={(e) => setFocusSettings(prev => ({
                  ...prev,
                  hideUI: e.target.checked
                }))}
                className="rounded border-border focus:ring-accent"
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-textSecondary">Quick Presets:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFocusSettings({
                    hideNotifications: true,
                    enableTimer: true,
                    timerDuration: 25,
                    enableSounds: true,
                    dimBackground: true,
                    hideUI: false,
                  })}
                  className="px-2 py-1 text-xs bg-accent/10 text-accent rounded hover:bg-accent/20 transition-colors"
                >
                  Pomodoro
                </button>
                <button
                  onClick={() => setFocusSettings({
                    hideNotifications: true,
                    enableTimer: false,
                    timerDuration: 25,
                    enableSounds: false,
                    dimBackground: true,
                    hideUI: true,
                  })}
                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                >
                  Deep Work
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
