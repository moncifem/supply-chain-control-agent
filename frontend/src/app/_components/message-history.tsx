"use client";

import { api } from "~/trpc/react";

export function MessageHistory() {
  const {
    data: messages,
    isLoading,
    error,
  } = api.message.getMessages.useQuery();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold text-slate-800">
          Historique des messages
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500"></div>
          <span className="ml-2 text-slate-600">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold text-slate-800">
          Historique des messages
        </h2>
        <p className="text-center text-red-500">Erreur: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {/* Conversation avec l&apos;Agent IA */}
              Converation with AI Agent
            </h2>
            <p className="text-sm text-slate-500">
              {/* Assistant spécialisé en Supply Chain */}
              Supply Chain Specialist Assistant
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!messages || messages.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg
                className="h-6 w-6 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <p className="font-medium text-slate-500">
              {/* Démarrez une conversation */}
              Start a conversation
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {/* Posez vos questions sur la gestion de votre chaîne */}
              {/* d&apos;approvisionnement */}
              Ask your questions about supply chain management
            </p>
          </div>
        ) : (
          <div className="max-h-96 space-y-6 overflow-y-auto scroll-smooth">
            {messages.map((message) => (
              <div key={message.id}>
                {/* Message de l'utilisateur */}
                <div className="flex justify-end">
                  <div className="max-w-xs rounded-2xl bg-blue-500 px-4 py-3 text-white shadow-sm lg:max-w-md">
                    <p className="text-sm">{message.text}</p>
                    <p className="mt-1 text-xs text-blue-100">
                      {new Date(message.createdAt).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Réponse de l'agent */}
                {message.response && (
                  <div className="mt-3 flex justify-start">
                    <div className="max-w-xs rounded-2xl bg-slate-100 px-4 py-3 text-slate-700 shadow-sm lg:max-w-md">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                          <svg
                            className="h-3 w-3 text-white"
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
                        <span className="text-xs font-medium text-slate-500">
                          {/* Agent Supply Chain{" "} */}
                          Supply Chain Agent{" "}
                          {message.response.model && (
                            <span className="text-slate-400">
                              ({message.response.model})
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {message.response.text}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(message.response.createdAt).toLocaleString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
