/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import CSVFormModal from "./CSVFormModal";

interface CSVUploaderProps {
  onSuccess?: (data: any[]) => void;
  onError?: (error: any) => void;
  isFormOpen: boolean;
  csvData: any[] | null;
  onFormClose: () => void;
}

export default function CSVUploader({
  onSuccess,
  onError,
  isFormOpen,
  csvData,
  onFormClose,
}: CSVUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      onError?.("Veuillez sélectionner un fichier CSV");
      return;
    }

    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log("CSV parsed:", results);
        if (results.errors.length > 0) {
          console.error("Parse errors:", results.errors);
          onError?.(results.errors);
        } else {
          onSuccess?.(results.data as any[]);
        }
        setIsUploading(false);
      },
      error: (error) => {
        console.error("Parse error:", error);
        onError?.(error);
        setIsUploading(false);
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]!);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]!);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (isFormOpen && csvData) {
    return (
      <CSVFormModal
        isOpen={isFormOpen}
        onClose={onFormClose}
        csvData={csvData}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors duration-200 ${
          isDragOver
            ? "border-blue-400 bg-blue-50"
            : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
        } ${isUploading ? "pointer-events-none opacity-50" : ""} `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="space-y-4">
          {/* Upload Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
            <svg
              className="h-8 w-8 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {/* Upload Text */}
          <div>
            <p className="text-lg font-semibold text-slate-700">
              {isUploading
                ? "Traitement en cours..."
                : "Importer un fichier CSV"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Glissez-déposez votre fichier ici ou cliquez pour le sélectionner
            </p>
          </div>

          {/* Upload Button */}
          {!isUploading && (
            <button
              type="button"
              className="rounded-xl bg-blue-600 px-6 py-2 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-blue-700"
            >
              Parcourir les fichiers
            </button>
          )}

          {isUploading && (
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm text-slate-600">
                Lecture du fichier...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* File Format Info */}
      <div className="rounded-lg bg-blue-50 p-4">
        <h4 className="font-semibold text-blue-800">Format attendu :</h4>
        <ul className="mt-2 space-y-1 text-sm text-blue-700">
          <li>• Fichier au format CSV</li>
          <li>• Première ligne contenant les en-têtes</li>
          <li>• Encodage UTF-8 recommandé</li>
        </ul>
      </div>
    </div>
  );
}
