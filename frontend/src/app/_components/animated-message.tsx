"use client";

import { useEffect, useState } from "react";

type AnimatedMessageProps = {
  message: {
    id: number;
    text: string;
    createdAt: Date;
    updatedAt: Date;
    response?: {
      id: number;
      text: string;
      messageId: number;
      createdAt: Date;
      updatedAt: Date;
      model?: string | null;
    } | null;
  };
  isNew?: boolean;
};

export function AnimatedMessage({
  message,
  isNew = false,
}: AnimatedMessageProps) {
  const [isVisible, setIsVisible] = useState(!isNew);

  useEffect(() => {
    if (isNew) {
      // Simple délai pour l'effet fade-in
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  return (
    <div
      className={`transition-opacity duration-500 ease-out`}
    >
      <div className="space-y-4">
        {/* Message utilisateur */}
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-700">
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-700">Vous</p>
              <time className="text-xs text-slate-400">
                {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>
            <div className="rounded-2xl rounded-tl-md bg-slate-50 px-4 py-3 transition-all duration-300">
              <p className="leading-relaxed text-slate-700">{message.text}</p>
            </div>
          </div>
        </div>

        {/* Réponse IA */}
        {message.response && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-700">
                  Agent Supply Chain IA
                </p>
                <time className="text-xs text-slate-400">
                  {new Date(message.response.createdAt).toLocaleTimeString(
                    "fr-FR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </time>
                {message.response.model && (
                  <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                    {message.response.model}
                  </span>
                )}
              </div>
              <div className="rounded-2xl rounded-tl-md border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-3 transition-all duration-300">
                <p className="leading-relaxed whitespace-pre-wrap text-slate-700">
                  {message.response.text}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
