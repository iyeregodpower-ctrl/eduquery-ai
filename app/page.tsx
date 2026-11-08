"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";

const transport = new DefaultChatTransport({
  api: "/api/chat",
});

const initialMessages: UIMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "I am fully connected to the Gemini AI backend! How can I help you with your studies today?",
      },
    ],
  },
];

export default function Home() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    id: "eduquery-chat",
    transport,
    messages: initialMessages,
  });
  const isLoading = status === "submitted" || status === "streaming";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <main className="flex flex-col h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="sticky top-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          EduQuery <span className="text-blue-600">AI</span>
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto w-full scroll-smooth">
        <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6 pb-32">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${msg.role === "user" ? "bg-blue-600" : "bg-gradient-to-br from-gray-700 to-gray-900"}`}>
                {msg.role === "user" ? "U" : "AI"}
              </div>
              
              <div className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-3 shadow-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm" : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm"}`}>
                  <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                    {msg.parts?.map((part, idx) =>
                      part.type === "text" ? <span key={idx}>{part.text}</span> : null
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white font-bold text-sm">
                AI
              </div>
              <div className="px-4 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm rounded-tl-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <strong className="font-semibold">Chat error:</strong> {error.message}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-0 w-full bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-6 pb-6 px-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-center shadow-lg bg-white rounded-full border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="Message EduQuery AI..."
              className="flex-1 px-6 py-4 outline-none text-[15px] bg-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="mr-2 p-2 w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[11px] text-gray-400">EduQuery AI can make mistakes. Check important info.</span>
          </div>
        </div>
      </div>
    </main>
  );
}
