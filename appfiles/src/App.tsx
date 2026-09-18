/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, User, Info, AlertCircle, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm the **Dowlin Forge HOA Assistant**. How can I help you understand our community bylaws today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load the PDF file on mount
  useEffect(() => {
    async function loadPdf() {
      try {
        const response = await fetch("/documents/bylaws.pdf");
        if (!response.ok) {
          throw new Error("Bylaws PDF not found. Please upload 'bylaws.pdf' to the /documents directory.");
        }
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          setPdfBase64(base64);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        setPdfError(err instanceof Error ? err.message : "Failed to load bylaws.");
      }
    }
    loadPdf();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!pdfBase64) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Please upload the 'bylaws.pdf' file to the /documents directory before we begin." }]);
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: pdfBase64,
                },
              },
              {
                text: userMessage,
              },
            ],
          },
        ],
        config: {
          systemInstruction: `You are the "Dowlin Forge HOA Assistant". Your purpose is to help homeowners understand the Dowlin Forge Station Planned Community Association bylaws in plain English.

BEHAVIOR RULES:
1. Answer ONLY from the provided bylaws document.
2. Do NOT use general knowledge or make assumptions about HOAs.
3. Cite the relevant Article, Section, or Page number for every answer.
4. If the answer is NOT in the document, say: "This information is not specified in the bylaws."
5. Do NOT provide legal advice. Only summarize what the document says.
6. Translate legal/HOA jargon into simple, clear, homeowner-friendly explanations.
7. Be concise but informative.
8. If multiple sections apply, combine them into one clear answer.
9. If a user's question is unclear, ask a clarifying question.
10. Tone: Professional, neutral, and helpful.

SCOPE:
- Allowed: HOA rules, membership, fees, meetings, board powers, enforcement.
- Prohibited: Legal advice, state laws, personal disputes, tax questions.`,
        },
      });

      const assistantMessage = response.text || "I'm sorry, I couldn't process that request.";
      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I encountered an error while processing your request. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-200 shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Dowlin Forge HOA Assistant</h1>
            <p className="text-xs text-slate-500 font-medium">Bylaws Knowledge Base</p>
          </div>
        </div>
        {pdfError && (
          <div className="hidden md:flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-medium border border-amber-100">
            <AlertCircle className="w-4 h-4" />
            <span>Missing bylaws.pdf</span>
          </div>
        )}
      </header>

      {/* Main Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-4xl mx-auto w-full"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                    msg.role === "user" ? "bg-indigo-100" : "bg-white border border-slate-200"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Bot className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                  }`}
                >
                  <div className="prose prose-sm max-w-none prose-indigo">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-3 items-center text-slate-400 ml-11">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-medium italic">Assistant is reading bylaws...</span>
            </div>
          </motion.div>
        )}
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-200 p-4 md:p-6 sticky bottom-0">
        <div className="max-w-4xl mx-auto relative">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about fees, rules, or board powers..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-3 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 px-1">
            <Info className="w-3 h-3" />
            <span>Answers are based strictly on the Dowlin Forge Bylaws. Not legal advice.</span>
          </div>
        </div>
      </footer>

      {/* Missing PDF Overlay */}
      {pdfError && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-100"
          >
            <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Bylaws Document Required</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              To function, this assistant needs the **Dowlin Forge By Laws PDF**. 
              Please upload it to the <code className="bg-slate-100 px-1 rounded text-indigo-600 font-mono">/documents</code> folder and name it <code className="bg-slate-100 px-1 rounded text-indigo-600 font-mono">bylaws.pdf</code>.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Instructions:</p>
              <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                <li>Locate your bylaws PDF file.</li>
                <li>Rename it to <span className="font-mono font-bold">bylaws.pdf</span>.</li>
                <li>Upload it to the <span className="font-mono font-bold">/documents</span> folder via the file explorer.</li>
                <li>Refresh the application.</li>
              </ol>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
