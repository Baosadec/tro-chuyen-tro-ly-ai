import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface.tsx';
import VisionInterface from './components/VisionInterface.tsx';
import { AppMode } from './types.ts';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.Chat);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Gemini <span className="text-brand-400">Playground VN</span>
            </h1>
          </div>
          
          <nav className="flex space-x-2 bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setMode(AppMode.Chat)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === AppMode.Chat 
                ? 'bg-brand-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              Trò chuyện
            </button>
            <button
              onClick={() => setMode(AppMode.Vision)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === AppMode.Vision 
                ? 'bg-brand-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              Hình ảnh
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 overflow-hidden h-[calc(100vh-64px)]">
        {mode === AppMode.Chat ? <ChatInterface /> : <VisionInterface />}
      </main>
    </div>
  );
};

export default App;