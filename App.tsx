
import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator as CalcIcon, 
  BrainCircuit, 
  History as HistoryIcon, 
  Trash2, 
  Camera,
  X,
  Send,
  Loader2,
  Delete,
  Sun,
  Moon,
  FlaskConical
} from 'lucide-react';
import CalcButton from './components/CalcButton';
import { Mode, HistoryItem, AIResponse, Theme } from './types';
import { solveWithAI } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [mode, setMode] = useState<Mode>('standard');
  const [theme, setTheme] = useState<Theme>('dark');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // AI State
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history and theme from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('gemini_calc_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedTheme = localStorage.getItem('gemini_calc_theme') as Theme;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem('gemini_calc_history', JSON.stringify(history));
  }, [history]);

  // Save theme
  useEffect(() => {
    localStorage.setItem('gemini_calc_theme', theme);
  }, [theme]);

  // Core Calc Logic
  const handleNumber = (num: string) => {
    setDisplay(prev => (prev === '0' || prev === 'Error' ? num : prev + num));
  };

  const handleOperator = (op: string) => {
    if (display === 'Error') return;
    setExpression(prev => prev + display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleBackspace = () => {
    if (display === 'Error') {
      setDisplay('0');
      return;
    }
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  const handleSciFunction = (func: string) => {
    const currentVal = parseFloat(display);
    let result: number;
    
    try {
      switch (func) {
        case 'sin': result = Math.sin(currentVal); break;
        case 'cos': result = Math.cos(currentVal); break;
        case 'tan': result = Math.tan(currentVal); break;
        case 'log': result = Math.log10(currentVal); break;
        case 'ln': result = Math.log(currentVal); break;
        case 'sqrt': result = Math.sqrt(currentVal); break;
        case 'pow': setExpression(prev => prev + display + ' ^ '); setDisplay('0'); return;
        case 'pi': setDisplay(Math.PI.toString()); return;
        case 'e': setDisplay(Math.E.toString()); return;
        default: return;
      }
      setDisplay(result.toString());
    } catch (e) {
      setDisplay('Error');
    }
  };

  const calculate = () => {
    try {
      const fullExpression = expression + display;
      // Handle exponents first
      let cleanExpression = fullExpression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**');
      
      const result = eval(cleanExpression).toString();
      
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        expression: fullExpression,
        result,
        timestamp: Date.now()
      };
      
      setHistory([newItem, ...history].slice(0, 20));
      setDisplay(result);
      setExpression('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const handleAIQuery = async () => {
    if (!aiInput && !capturedImage) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await solveWithAI(aiInput || "Solve the problem in this image.", capturedImage || undefined);
      setAiResult(res);
    } catch (e) {
      setAiResult({ answer: "Error", explanation: "Could not connect to AI Lab. Please check your connection." });
    } finally {
      setAiLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col h-screen overflow-hidden safe-area-inset theme-transition ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      
      {/* Top Header / Mode Selector */}
      <header className={`px-6 pt-10 pb-4 flex justify-between items-center z-30 backdrop-blur-md theme-transition ${isDark ? 'bg-zinc-950/80 border-b border-zinc-900/50' : 'bg-white/80 border-b border-zinc-200'}`}>
        <div className="flex space-x-2 bg-zinc-200/20 dark:bg-zinc-800/20 p-1 rounded-2xl">
          <button 
            onClick={() => setMode('standard')}
            className={`p-2 px-3 rounded-xl transition-all flex items-center gap-2 ${mode === 'standard' ? (isDark ? 'bg-zinc-800 text-indigo-400 shadow-xl shadow-black/20' : 'bg-white text-indigo-600 shadow-md') : 'text-zinc-500 hover:text-zinc-400'}`}
          >
            <CalcIcon size={18} />
            <span className="text-xs font-bold uppercase hidden sm:inline">Basic</span>
          </button>
          <button 
            onClick={() => setMode('scientific')}
            className={`p-2 px-3 rounded-xl transition-all flex items-center gap-2 ${mode === 'scientific' ? (isDark ? 'bg-zinc-800 text-indigo-400 shadow-xl shadow-black/20' : 'bg-white text-indigo-600 shadow-md') : 'text-zinc-500 hover:text-zinc-400'}`}
          >
            <FlaskConical size={18} />
            <span className="text-xs font-bold uppercase hidden sm:inline">Sci</span>
          </button>
          <button 
            onClick={() => setMode('ai')}
            className={`p-2 px-3 rounded-xl transition-all flex items-center gap-2 ${mode === 'ai' ? (isDark ? 'bg-zinc-800 text-indigo-400 shadow-xl shadow-black/20' : 'bg-white text-indigo-600 shadow-md') : 'text-zinc-500 hover:text-zinc-400'}`}
          >
            <BrainCircuit size={18} />
            <span className="text-xs font-bold uppercase hidden sm:inline">AI</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2.5 rounded-2xl theme-transition ${isDark ? 'bg-zinc-900 text-zinc-400 hover:text-white' : 'bg-zinc-200 text-zinc-600 hover:text-zinc-900 shadow-sm'}`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`p-2.5 rounded-2xl theme-transition ${isDark ? 'bg-zinc-900 text-zinc-400 hover:text-white' : 'bg-zinc-200 text-zinc-600 hover:text-zinc-900 shadow-sm'}`}
          >
            <HistoryIcon size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        
        {/* History Sidebar/Overlay */}
        <div className={`absolute inset-0 z-40 theme-transition ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'} ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-500 ease-out`}>
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <HistoryIcon className="text-indigo-500" size={24} /> History
              </h2>
              <button onClick={() => setIsHistoryOpen(false)} className={`p-2 rounded-full ${isDark ? 'hover:bg-zinc-900' : 'hover:bg-zinc-200'}`}>
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-zinc-500 opacity-50">
                   <HistoryIcon size={48} className="mb-4" />
                   <p>Your history is empty</p>
                </div>
              ) : (
                history.map(item => (
                  <div key={item.id} className={`p-5 rounded-3xl border theme-transition animate-in fade-in slide-in-from-right-4 ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                    <div className="text-zinc-500 text-sm mono mb-2 truncate opacity-70">{item.expression}</div>
                    <div className={`text-2xl font-bold mono ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>{item.result}</div>
                  </div>
                ))
              )}
            </div>
            {history.length > 0 && (
              <button 
                onClick={() => setHistory([])}
                className="mt-6 flex items-center justify-center gap-2 text-red-500 p-5 rounded-3xl font-bold bg-red-500/10 border border-red-500/20 active:scale-95 transition-transform"
              >
                <Trash2 size={20} /> Clear Memory
              </button>
            )}
          </div>
        </div>

        {/* Standard & Scientific Modes */}
        {(mode === 'standard' || mode === 'scientific') && (
          <div className="h-full flex flex-col animate-in fade-in duration-500">
            {/* Display Screen */}
            <div className="flex-1 flex flex-col justify-end items-end px-8 py-10">
              <div className="text-zinc-500 text-2xl mono min-h-[1.5em] mb-4 truncate max-w-full opacity-60">
                {expression}
              </div>
              <div className={`text-6xl sm:text-7xl font-light mono break-all text-right leading-tight theme-transition ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {display}
              </div>
            </div>

            {/* Keypad Container */}
            <div className={`p-6 pb-12 rounded-t-[40px] border-t theme-transition ${isDark ? 'bg-zinc-900/30 border-zinc-800/50' : 'bg-zinc-100/50 border-zinc-200'}`}>
              
              {/* Scientific Panel Toggle Content */}
              {mode === 'scientific' && (
                <div className="grid grid-cols-5 gap-2 mb-4 animate-in slide-in-from-top-4 fade-in duration-300">
                  <CalcButton theme={theme} label="sin" variant="sci" onClick={() => handleSciFunction('sin')} />
                  <CalcButton theme={theme} label="cos" variant="sci" onClick={() => handleSciFunction('cos')} />
                  <CalcButton theme={theme} label="tan" variant="sci" onClick={() => handleSciFunction('tan')} />
                  <CalcButton theme={theme} label="π" variant="sci" onClick={() => handleSciFunction('pi')} />
                  <CalcButton theme={theme} label="e" variant="sci" onClick={() => handleSciFunction('e')} />
                  
                  <CalcButton theme={theme} label="log" variant="sci" onClick={() => handleSciFunction('log')} />
                  <CalcButton theme={theme} label="ln" variant="sci" onClick={() => handleSciFunction('ln')} />
                  <CalcButton theme={theme} label="√" variant="sci" onClick={() => handleSciFunction('sqrt')} />
                  <CalcButton theme={theme} label="^" variant="sci" onClick={() => handleSciFunction('pow')} />
                  <CalcButton theme={theme} label="!" variant="sci" onClick={() => {}} />
                </div>
              )}

              {/* Standard Keypad */}
              <div className="grid grid-cols-4 gap-3">
                <CalcButton theme={theme} label="AC" variant="action" onClick={handleClear} />
                <CalcButton theme={theme} label={<Delete size={20} />} variant="action" onClick={handleBackspace} />
                <CalcButton theme={theme} label="%" variant="action" onClick={() => setDisplay(prev => (parseFloat(prev)/100).toString())} />
                <CalcButton theme={theme} label="÷" variant="operator" onClick={() => handleOperator('/')} />
                
                <CalcButton theme={theme} label="7" onClick={() => handleNumber('7')} />
                <CalcButton theme={theme} label="8" onClick={() => handleNumber('8')} />
                <CalcButton theme={theme} label="9" onClick={() => handleNumber('9')} />
                <CalcButton theme={theme} label="×" variant="operator" onClick={() => handleOperator('*')} />
                
                <CalcButton theme={theme} label="4" onClick={() => handleNumber('4')} />
                <CalcButton theme={theme} label="5" onClick={() => handleNumber('5')} />
                <CalcButton theme={theme} label="6" onClick={() => handleNumber('6')} />
                <CalcButton theme={theme} label="-" variant="operator" onClick={() => handleOperator('-')} />
                
                <CalcButton theme={theme} label="1" onClick={() => handleNumber('1')} />
                <CalcButton theme={theme} label="2" onClick={() => handleNumber('2')} />
                <CalcButton theme={theme} label="3" onClick={() => handleNumber('3')} />
                <CalcButton theme={theme} label="+" variant="operator" onClick={() => handleOperator('+')} />
                
                <CalcButton theme={theme} label="0" span={2} onClick={() => handleNumber('0')} />
                <CalcButton theme={theme} label="." onClick={() => handleNumber('.')} />
                <CalcButton theme={theme} label="=" variant="special" onClick={calculate} />
              </div>
            </div>
          </div>
        )}

        {/* AI Lab Mode */}
        {mode === 'ai' && (
          <div className="h-full flex flex-col p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-500">
            <div className="space-y-6 pb-20 max-w-2xl mx-auto w-full">
              <div className={`border rounded-[32px] p-6 theme-transition ${isDark ? 'bg-indigo-600/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                <h3 className={`text-lg font-bold flex items-center gap-3 mb-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  <BrainCircuit size={24} /> AI Math Lab
                </h3>
                <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Type a complex problem or upload a photo of your homework. Gemini AI will solve it step-by-step.
                </p>
              </div>

              {/* AI Output Area */}
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                  <div className="relative">
                     <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse"></div>
                     <Loader2 className="animate-spin text-indigo-500 relative" size={56} />
                  </div>
                  <p className="text-zinc-500 font-medium animate-pulse">Thinking with Gemini...</p>
                </div>
              ) : aiResult ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className={`p-8 rounded-[32px] border theme-transition ${isDark ? 'bg-zinc-900 border-zinc-800 shadow-2xl shadow-black/50' : 'bg-white border-zinc-200 shadow-xl'}`}>
                    <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">Final Answer</div>
                    <div className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{aiResult.answer}</div>
                    
                    <div className="h-px bg-zinc-800/50 mb-6"></div>
                    
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Explanation</div>
                    <div className={`text-base leading-relaxed mb-8 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      {aiResult.explanation}
                    </div>
                    
                    {aiResult.steps && aiResult.steps.length > 0 && (
                      <div className="space-y-4">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Breakdown</div>
                        {aiResult.steps.map((step, idx) => (
                          <div key={idx} className={`flex gap-5 items-start p-4 rounded-2xl ${isDark ? 'bg-zinc-950/50' : 'bg-zinc-50'}`}>
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-indigo-500/30">
                              {idx + 1}
                            </span>
                            <p className={`text-sm leading-relaxed pt-1 font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{step}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => {setAiResult(null); setAiInput(''); setCapturedImage(null);}}
                    className={`w-full py-5 rounded-[24px] font-bold theme-transition ${isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200'}`}
                  >
                    Ask Another Question
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative group">
                    <textarea 
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="e.g., Solve: 3x + 5 = 20, or ask about derivatives, integrals, etc."
                      className={`w-full h-48 border rounded-[32px] p-8 text-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none theme-transition ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-700' : 'bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 shadow-sm'}`}
                    />
                    <div className="absolute bottom-6 right-6 flex gap-3">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-4 rounded-[20px] transition-all shadow-xl active:scale-90 ${capturedImage ? 'bg-green-500 text-white' : (isDark ? 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200')}`}
                      >
                        <Camera size={24} />
                      </button>
                    </div>
                  </div>

                  {capturedImage && (
                    <div className="relative inline-block mt-2 group animate-in zoom-in-95 duration-300">
                      <img src={capturedImage} alt="Preview" className={`h-32 w-32 rounded-[24px] border-4 object-cover shadow-2xl ${isDark ? 'border-zinc-800' : 'border-white'}`} />
                      <button 
                        onClick={() => setCapturedImage(null)}
                        className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-400 p-1.5 rounded-full text-white shadow-lg shadow-red-500/40 active:scale-90 transition-transform"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}

                  <button 
                    disabled={!aiInput && !capturedImage}
                    onClick={handleAIQuery}
                    className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:grayscale rounded-[32px] text-xl font-black flex items-center justify-center gap-4 transition-all text-white shadow-2xl shadow-indigo-600/30 active:scale-[0.98]"
                  >
                    <Send size={24} /> Generate Solution
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Bottom Padding for navigation */}
      <div className="h-6"></div>
    </div>
  );
};

export default App;
