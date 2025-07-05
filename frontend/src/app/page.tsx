"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { MessageHistory } from "./_components/message-history";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const utils = api.useUtils();

  const sendMessage = api.gemini.sendMessage.useMutation({
    onMutate: () => {
      setSending(true);
    },
    onSuccess: (data) => {
      console.log("Message sent successfully:", data);
      setPrompt(""); // Clear the prompt after sending
      // Invalider la query pour forcer le rechargement
      void utils.gemini.getMessages.invalidate();
    },
    onError: (error) => {
      console.error("Error sending message:", error);
    },
    onSettled: () => {
      setSending(false);
    },
  });

  const handleSubmit = () => {
    if (prompt.trim() && !sending) {
      sendMessage.mutate({ content: prompt.trim() });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-slate-800">
              Dashboard Hackathon
            </h1>
            <p className="text-lg text-slate-600">
              Entrez votre prompt pour commencer
            </p>
          </div>

          {/* Prompt Input */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre prompt ici..."
                  className="h-32 w-full resize-none rounded-xl border border-slate-300 p-4 text-slate-700 placeholder-slate-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={!prompt.trim() || sending}
                  className="rounded-xl bg-slate-800 px-8 py-3 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {sending ? "Envoi..." : "Valider"}
                </button>
              </div>
            </form>
          </div>

          {/* Instruction */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Appuyez sur{" "}
              <kbd className="rounded bg-slate-200 px-2 py-1 text-xs">
                Entrée
              </kbd>{" "}
              ou cliquez sur le bouton pour valider
            </p>
          </div>

          {/* Message History */}
          <div className="mt-12">
            <MessageHistory />
          </div>
        </div>
      </div>
    </main>
  );
}
