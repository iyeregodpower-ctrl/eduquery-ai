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
        text: "I am fully connected to the Gemini AI backend! How can I help you with your studies today?",
      },
    ],
  },
];

const transport = new DefaultChatTransport({
  api: "/api/chat",
});

function StudyCardView({ card }: { card: StudyCard }) {
  return (
    <div className="my-1 w-full rounded-xl border border-blue-100 bg-blue-50 p-4">
      <h3 className="text-base font-bold text-blue-900">{card.title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-gray-800">
        {card.summary}
      </p>
      {card.keyPoints?.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[15px] text-gray-800">
          {card.keyPoints.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    id: "eduquery-chat", // fixed ID, so no Math.random() runs during prerender
    transport,
    messages: initialMessages,
  });

  const isLoading = status === "submitted" || status === "streaming";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const lastMessage = messages[messages.length - 1];
  const showTyping = isLoading && lastMessage?.role === "user";

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
                        className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm"
                      >
                        Creating study card...
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

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-0 w-full bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-6 pb-6 px-4">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center shadow-lg bg-white rounded-full border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all"
          >
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
          <div className="text-center mt-2">
            <span className="text-[11px] text-gray-400">
              EduQuery AI can make mistakes. Check important info.
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}