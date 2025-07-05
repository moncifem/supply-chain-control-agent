"use client";

import { useState, useEffect } from "react";

interface PromptEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PromptEditorModal({ isOpen, onClose }: PromptEditorModalProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch prompt when modal opens
  useEffect(() => {
    if (isOpen) {
      void fetchPrompt();
    }
  }, [isOpen]);

  const fetchPrompt = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("https://thesquad.fr/api/prompt");
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      const data = await response.json() as { prompt?: string };
      setPrompt(data.prompt ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      setPrompt("");
    } finally {
      setIsLoading(false);
    }
  };

  const savePrompt = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch("https://thesquad.fr/api/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Hide success message after 3s
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">Éditeur de Prompt</h2>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-600">Chargement du prompt...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <label htmlFor="prompt-textarea" className="block text-sm font-medium text-slate-700">
                Contenu du prompt
              </label>
              <textarea
                id="prompt-textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Entrez votre prompt ici..."
                className="w-full h-96 resize-none rounded-xl border border-slate-300 p-4 text-slate-700 placeholder-slate-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-green-700">Prompt sauvegardé avec succès !</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={savePrompt}
            disabled={isSaving || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
}
