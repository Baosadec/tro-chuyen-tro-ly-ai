import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// ==========================================
// 1. TYPES & CONFIG
// ==========================================

enum Sender {
  User = 'User',
  Bot = 'Bot',
  System = 'System'
}

interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  isLoading?: boolean;
}

enum AppMode {
  Chat = 'chat',
  Vision = 'vision'
}

// ==========================================
// 2. SERVICES (Gemini API)
// ==========================================

const getApiKey = () => {
  // @ts-ignore
  const key = window.process?.env?.API_KEY;
  return key;
};

const generateTextResponse = async (prompt: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "⚠️ Lỗi: Chưa cấu hình API Key. Vui lòng mở file index.html và điền API Key vào dòng window.process.";
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Không có phản hồi.";
  } catch (error: any) {
    console.error("API Error:", error);
    return `Lỗi API: ${error.message || "Không xác định"}`;
  }
};

const generateVisionResponse = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "⚠️ Lỗi: Chưa cấu hình API Key.";

  const ai = new GoogleGenAI({ apiKey });

  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });

    return response.text || "Không thể phân tích hình ảnh.";
  } catch (error: any) {
    console.error("Vision API Error:", error);
    return `Lỗi API: ${error.message || "Không xác định"}`;
  }
};

const fileToGenerativePart = async (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const matches = base64String.match(/^data:(.+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        resolve({ mimeType: matches[1], data: matches[2] });
      } else {
        reject(new Error("File không hợp lệ"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// ==========================================
// 3. COMPONENTS
// ==========================================

// --- Chat Interface ---
const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Xin chào! Tôi là Gemini (phiên bản 2.5 Flash). Bạn cần giúp gì?',
      sender: Sender.Bot,
      timestamp: Date.now(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: userText,
      sender: Sender.User,
      timestamp: Date.now(),
    }]);

    setIsLoading(true);

    try {
      const responseText = await generateTextResponse(userText);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: Sender.Bot,
        timestamp: Date.now(),
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Có lỗi xảy ra khi kết nối.",
        sender: Sender.System,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === Sender.User ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 whitespace-pre-wrap leading-relaxed shadow-sm ${
                msg.sender === Sender.User
                  ? 'bg-brand-600 text-white rounded-br-none'
                  : 'bg-slate-700 text-slate-100 rounded-bl-none'
              }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-slate-400 rounded-2xl rounded-bl-none px-4 py-3 animate-pulse flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-slate-900 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-slate-800 text-white border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 sm:px-6 transition-colors"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Vision Interface ---
const VisionInterface: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Mô tả chi tiết hình ảnh này.');
  const [result, setResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult('');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !prompt.trim()) return;
    setIsAnalyzing(true);
    setResult('');
    try {
      const { data, mimeType } = await fileToGenerativePart(selectedFile);
      const res = await generateVisionResponse(data, mimeType, prompt);
      setResult(res);
    } catch (e) {
      setResult("Lỗi khi xử lý ảnh.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full overflow-y-auto p-1">
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-brand-100">1. Chọn ảnh</h3>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 hover:border-brand-500 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/30 min-h-[200px]"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-60 rounded object-contain" />
            ) : (
              <div className="text-center text-slate-400">
                <span className="text-4xl block mb-2">+</span>
                <span>Nhấn để tải ảnh lên</span>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg flex-1">
          <h3 className="text-lg font-semibold mb-4 text-brand-100">2. Yêu cầu</h3>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-brand-500 resize-none mb-4"
          />
          <button
            onClick={handleAnalyze}
            disabled={!selectedFile || isAnalyzing}
            className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all"
          >
            {isAnalyzing ? 'Đang phân tích...' : 'Gửi yêu cầu'}
          </button>
        </div>
      </div>

      <div className="w-full lg:w-2/3 bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg flex flex-col min-h-[400px]">
        <h3 className="text-lg font-semibold mb-4 text-brand-100">Kết quả</h3>
        <div className="flex-1 bg-slate-900/50 rounded-lg p-6 overflow-y-auto border border-slate-800">
          {isAnalyzing ? (
            <div className="h-full flex items-center justify-center text-brand-400 animate-pulse">
              Đang đọc hình ảnh...
            </div>
          ) : result ? (
            <div className="prose prose-invert max-w-none whitespace-pre-wrap">{result}</div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-600">
              Kết quả sẽ hiện ở đây
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. MAIN APP
// ==========================================

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.Chat);

  return (
    <div className="h-full flex flex-col">
      <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">VN</span>
            </div>
            <h1 className="text-xl font-bold text-white hidden sm:block">
              Gemini <span className="text-brand-400">Playground</span>
            </h1>
          </div>
          
          <div className="flex bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setMode(AppMode.Chat)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === AppMode.Chat ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Chat
            </button>
            <button
              onClick={() => setMode(AppMode.Vision)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === AppMode.Vision ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Vision
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-2 sm:p-4 overflow-hidden">
        {mode === AppMode.Chat ? <ChatInterface /> : <VisionInterface />}
      </main>
    </div>
  );
};

// ==========================================
// 5. RENDER
// ==========================================

// Ensure root exists before rendering
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
} else {
  console.error("Không tìm thấy thẻ div với id='root'");
}
