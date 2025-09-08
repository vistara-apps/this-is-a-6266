import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import AppShell from './components/AppShell';
import FocusMode from './components/FocusMode';

function App() {
  const [isFocusMode, setIsFocusMode] = useState(false);

  return (
    <AppProvider>
      <div className={`min-h-screen transition-all duration-400 ${isFocusMode ? 'focus-mode' : ''}`}>
        {isFocusMode ? (
          <FocusMode onExitFocus={() => setIsFocusMode(false)} />
        ) : (
          <AppShell onEnterFocus={() => setIsFocusMode(true)} />
        )}
      </div>
    </AppProvider>
  );
}

export default App;