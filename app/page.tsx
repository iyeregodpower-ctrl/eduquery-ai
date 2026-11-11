"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";

type StudyCard = {
  title: string;
  summary: string;
  keyPoints: string[];
};

const initialMessages: UIMessage[] = [
  {
    id: "welcome-message",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Welcome to EduQuery AI! Upload a study PDF or ask a question to get started.",
      },
    ],
  },
];

const transport = new DefaultChatTransport({
  api: "/api/chat",
});

function StudyCardView({ card }: { card: StudyCard }) {
  return (
    <div className="mt-1 w-full p-5 bg-blue-50 border-l-4 border-blue-600 rounded-r-xl shadow-sm text-left">
      <h4 className="font-bold text-blue-900 text-lg mb-2">
        📘 {card.title || "Study Card"}
      </h4>
      <p className="text-sm text-gray-700 mb-3 leading-relaxed">
        {card.summary}
      </p>
      {card.keyPoints?.length > 0 && (
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1.5">
          {card.keyPoints.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { messages, sendMessage, status, error } = useChat({
    id: "eduquery-chat",
    transport,
    messages: initialMessages,
  });

  const isLoading = status === "submitted" || status === "streaming";
  const hasFiles = !!files && files.length > 0;

  useEffect(() => {
    if (mounted) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, mounted]);

  if (!mounted) {
    return null; // Prevents server/client hydration mismatch entirely
  }

  const clearFiles = () => {
    setFiles(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmitWithFiles = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    if (!input.trim() && !hasFiles) return;

    sendMessage({
      text: input.trim() || "Please summarize the attached document.",
      files,
    });

    setInput("");
    clearFiles();
  };

  const lastMessage = messages[messages.length - 1];
  const showTyping = isLoading && lastMessage?.role === "user";

  return (
    <main className="flex flex-col h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      <header className="flex-shrink-0 flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          EduQuery <span className="text-blue-600">AI</span>
        </h1>
        <span className="text-xs font-medium px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          RAG & Citations Mode Active
        </span>
      </header>

      <div className="flex-1 overflow-y-auto w-full scroll-smooth">
        <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6 pb-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${
                  msg.role === "user"
                    ? "bg-blue-600"
                    : "bg-gradient-to-br from-gray-700 to-gray-900"
                }`}
              >
                {msg.role === "user" ? "U" : "AI"}
              </div>

              <div
                className={`flex flex-col gap-2 max-w-[80%] ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {msg.parts.map((part, idx) => {
                  if (part.type === "file") {
                    return (
                      <div
                        key={idx}
                        className="text-xs bg-blue-700 text-white px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm"
                      >
                        📎 {part.filename || "Attached Study Document"}
                      </div>
                    );
                  }

                  if (part.type === "text") {
                    if (!part.text) return null;
                    return (
                      <div
                        key={idx}
                        className={`px-4 py-3 shadow-sm ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                            : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm"
                        }`}
                      >
                        <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                          {part.text}
                        </div>
                        
                        {msg.role === "assistant" && (
                          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-gray-400">
                            <span>🔍 Verified RAG Source</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (part.type === "tool-generateStudyCard") {
                    const toolPart = part as any;
                    if (toolPart.state === "output-available") {
                      return (
                        <StudyCardView
                          key={idx}
                          card={toolPart.output as StudyCard}
                        />
                      );
                    }
                    if (toolPart.state === "output-error") {
                      return (
                        <div
                          key={idx}
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                          Could not create the study card.
                        </div>
                      );
                    }
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm flex items-center gap-2"
                      >
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Creating structured study card from document...
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          ))}

          {showTyping && (
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
              Something went wrong. The AI may be busy, so please try again in a moment.
            </div>
          )}

          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      <div className="flex-shrink-0 w-full bg-gray-50 pt-2 pb-6 px-4 border-t border-gray-200/50">
        <div className="max-w-3xl mx-auto">
          {hasFiles && (
            <div className="mb-2 px-4 py-2 bg-white border border-blue-200 rounded-xl shadow-sm flex items-center justify-between text-sm text-blue-800">
              <span className="flex items-center gap-2 truncate">
                📎 <strong>{files![0].name}</strong> ready for RAG analysis
              </span>
              <button
                type="button"
                onClick={clearFiles}
                className="text-gray-400 hover:text-red-600 font-bold px-2"
              >
                ✕
              </button>
            </div>
          )}

          <form
            onSubmit={onSubmitWithFiles}
            className="relative flex items-center shadow-lg bg-white rounded-full border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setFiles(e.target.files ?? undefined)}
              accept=".pdf,.txt"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Study Document"
              className="ml-3 p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                />
              </svg>
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Ask a question or upload a study PDF..."
              className="flex-1 px-4 py-4 outline-none text-[15px] bg-transparent disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={(!input.trim() && !hasFiles) || isLoading}
              className="mr-2 p-2 w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 ml-0.5"
              >
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}