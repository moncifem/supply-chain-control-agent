/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import CSVUploader from "../_components/csv-uploader";
import { api } from "~/trpc/react";

export default function OnBoarding() {
  const [csvData, setCsvData] = useState<any[] | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const handleCSVSuccess = (data: any[]) => {
    console.log("CSV data received:", data);
    setCsvData(data);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setCsvData(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-slate-800">
              {/* Configuration des Données */}
              Data Schema Configuration
            </h1>
            <p className="text-lg text-slate-600">
              {/* Importez votre fichier CSV pour commencer */}
              Import a sample CSV file from your database for the data schema setting.
            </p>
          </div>

          {/* CSV Upload */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            <CSVUploader
              onSuccess={handleCSVSuccess}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onError={(error: any) => console.error("Erreur CSV:", error)}
              isFormOpen={isFormOpen}
              csvData={csvData}
              onFormClose={handleFormClose}
            />
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              {/* Glissez-déposez votre fichier CSV ou cliquez pour le sélectionner */}
              Drag and drop your CSV file or click to select it
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
