/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import tempsData from "../OnBoarding/temp.json";

export type tempData = {
  description: string;
  type: string;
};

// Add an index signature to allow string indexing
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
const temps: { [key: string]: tempData } = tempsData;
interface ColumnConfig {
  name: string;
  description: string;
  type: string;
  included: boolean;
}

interface CSVFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  csvData: any[];
}

// Types de données disponibles
const DATA_TYPES = [
  { value: "Shipment IDs (only one per line)", label: "ID" },
  { value: "Time", label: "Timestamp" },
  { value: "Date", label: "Date" },
  {
    value:
      "Locations that can be the departure or destination (warehouse, store, ...)",
    label: "Location",
  },
  { value: "Boolean that can be TRUE or FALSE", label: "Flag" },
  {
    value:
      "Quantity of goods in (Pcs, Boxes, Pallets) or Amount in (Euros, Dollars)",
    label: "Quantity",
  },
];



export default function CSVFormModal({
  isOpen,
  onClose,
  csvData,
}: CSVFormModalProps) {
  const [tableName, setTableName] = useState("");
  const [showTypeTooltip, setShowTypeTooltip] = useState(false);
  const sendForm = api.agent.sendForm.useMutation({
    onSuccess: (data) => {
      console.log("Form sent successfully:", data);
      onClose();
    },
    onError: (error) => {
      console.error("Error sending form:", error);
    },
  });
  const columns =
    csvData.length > 0
      ? Object.keys((csvData[0] ?? {}) as Record<string, unknown>)
      : [];

  const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>(
    columns.map((col) => ({
      name: col,
      description: "",
      type: "Shipment IDs (only one per line)",
      included: true,
    })),
  );

  useEffect(() => {
    columnConfigs.forEach((col, index) => {
      if (!col.description) {
        const tempEntry = temps[col.name] as tempData | undefined;
        if (tempEntry) {
          updateColumn(index, "description", tempEntry.description);
          updateColumn(index, "type", tempEntry.type);
        }
      }
    });
  }, []);

  if (!isOpen) return null;

  const generateFormData = () => {
    const result: Record<string, { description: string; type: string }> = {};

    columnConfigs
      .filter((col) => col.included)
      .forEach((col) => {
        result[col.name] = {
          description: col.description,
          type: col.type,
        };
      });

    return result;
  };
  const updateColumn = (
    index: number,
    field: keyof ColumnConfig,
    value: string | boolean,
  ) => {
    setColumnConfigs((prev) =>
      prev.map((col, i) => (i === index ? { ...col, [field]: value } : col)),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const includedColumns = columnConfigs.filter((col) => col.included);
    const csvPart = csvData.slice(0, 3);
    const formData = generateFormData();
    sendForm.mutate({
      dataset: JSON.stringify(csvPart),
      jsonSchema: JSON.stringify({
        title: tableName,
        type: "object",
        properties: formData,
      }),
    });
    console.log("Configuration finale:", {
      tableName,
      columns: includedColumns,
      totalRows: csvData.length,
    });

    onClose();
  };

  const includedCount = columnConfigs.filter((col) => col.included).length;

  // Placeholder quand aucun CSV n'est chargé
  if (!csvData || csvData.length === 0) {
    return (
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="max-h-[90vh] w-full max-w-5xl overflow-visible overflow-y-auto rounded-2xl bg-white p-8 shadow-xl">
          {/* <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-8 shadow-xl"> */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <svg
                className="h-8 w-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
              {/* Aucun fichier CSV chargé */}
              No CSV file loaded
            </h3>
            <p className="mt-2 text-slate-600">
              {/* Veuillez d&apos;abord importer un fichier CSV pour continuer. */}
              Please upload a CSV file first to continue.
            </p>
            <button
              onClick={onClose}
              className="mt-4 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {/* Configuration des colonnes CSV */}
              Database Schema Configuration
            </h2>
            <p className="text-slate-600">
              {/* {csvData.length} lignes • {includedCount}/{columns.length}{" "} */}
              {/* colonnes sélectionnées */}
              {csvData.length} rows • {includedCount}/{columns.length}{" "}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Introduction */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-800">
            {/* Pourquoi cette étape ? */}
            Why this step?
          </h3>
          <p className="mt-2 text-sm text-blue-700">
            {/* Avant d&apos;importer vos données, nous devons comprendre la */}
            {/* structure de votre fichier CSV. Configurez chaque colonne en */}
            {/* précisant son type de données et en ajoutant une description. Vous */}
            {/* pouvez également exclure les colonnes qui ne vous intéressent pas. */}
            The agent needs to understand the structure of your database to answer your questions. Configure each column by specifying its data type and adding a description. You can also exclude columns that are not relevant to you. The results will be used to generate the system prompt.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Table Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              {/* Nom de la table */}
              Table Name
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Ex: inventory_data, supply_chain_data, products..."
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              {/* Choisissez un nom descriptif pour identifier facilement vos */}
              {/* données */}
              Choose a descriptive name to easily identify your data
            </p>
          </div>

          {/* Column Configuration */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              {/* Configuration des colonnes */}
              Column Configuration
            </h3>

            {/* Table Header */}
            <div className="overflow-visible overflow-x-auto rounded-lg border border-slate-200">
              {/* <div className="overflow-x-auto rounded-lg border border-slate-200"> */}
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="border-b border-slate-200 p-4 text-left font-semibold text-slate-700">
                      <div className="flex items-center space-x-2">
                        <span>Keep</span>
                        <div className="group relative">
                          <svg
                            className="h-4 w-4 cursor-help text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div className="z-100 absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded-lg bg-slate-800 px-3 py-2 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {/* Décochez pour exclure la colonne de l&apos;import */}
                            Uncheck to exclude the column from import
                          </div>
                        </div>
                      </div>
                    </th>
                    <th className="border-b border-slate-200 p-4 text-left font-semibold text-slate-700">
                      {/* Nom de la colonne */}
                      Column Name
                    </th>
                    <th className="border-b border-slate-200 p-4 text-left font-semibold text-slate-700">
                      {/* Description */}
                      Description
                    </th>
                    <th className="border-b border-slate-200 p-4 text-left font-semibold text-slate-700">
                      <div className="flex items-center space-x-2">
                        {/* <span>Type de données</span> */}
                        <span>Data Type</span>
                        <div className="group relative">
                          <button
                            type="button"
                            onMouseEnter={() => setShowTypeTooltip(true)}
                            onMouseLeave={() => setShowTypeTooltip(false)}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          {showTypeTooltip && (
                            <div className="absolute top-full left-1/2 z-50 mt-2 w-80 -translate-x-1/2 transform rounded-lg bg-slate-800 p-4 text-xs text-white opacity-100 shadow-2xl transition-opacity">
                              <h4 className="mb-2 font-semibold text-white">
                                {/* Types de données disponibles : */}
                                Available Data Types:
                              </h4>
                              <div className="space-y-2">
                                {DATA_TYPES.map((type) => (
                                  <div
                                    key={type.value}
                                    className="border-b border-slate-600 pb-1 last:border-b-0"
                                  >
                                    <div className="font-medium text-blue-300">
                                      {type.label}
                                    </div>
                                    <div className="text-xs text-slate-300">
                                      {type.value}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                    <th className="border-b border-slate-200 p-4 text-left font-semibold text-slate-700">
                      {/* Aperçu */}
                      Preview
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {columnConfigs.map((config, index) => (
                    <tr
                      key={config.name}
                      className={`transition-colors hover:bg-slate-50 ${!config.included ? "bg-red-50 opacity-60" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="border-b border-slate-100 p-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={config.included}
                            onChange={(e) =>
                              updateColumn(index, "included", e.target.checked)
                            }
                            className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                          />
                          {config.included ? (
                            <span className="text-xs font-medium text-green-600">
                              {/* ✓ Oui */}
                              ✓ Yes
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-red-600">
                              {/* ✗ Non */}
                              ✗ No
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column Name */}
                      <td className="border-b border-slate-100 p-4">
                        <span
                          className={`font-mono text-sm font-medium ${config.included ? "text-slate-800" : "text-slate-400 line-through"}`}
                        >
                          {config.name}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="border-b border-slate-100 p-4">
                        <input
                          type="text"
                          value={config.description}
                          onChange={(e) =>
                            updateColumn(index, "description", e.target.value)
                          }
                          // placeholder={
                          //   config.included
                          //     ? "Ex: Identifiant produit, quantité en stock..."
                          //     : "Colonne exclue"
                          // }
                          placeholder={
                            config.included
                              ? "Ex: Product ID, stock quantity..."
                              : "Column excluded"
                          }
                          className={`w-full rounded-lg border p-2 text-sm focus:outline-none ${config.included
                            ? "border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            : "border-slate-200 bg-slate-100 text-slate-400"
                            }`}
                          disabled={!config.included}
                        />
                      </td>

                      {/* Type */}
                      <td className="border-b border-slate-100 p-4">
                        <select
                          value={config.type}
                          onChange={(e) =>
                            updateColumn(index, "type", e.target.value)
                          }
                          className={`w-full rounded-lg border p-2 text-sm focus:outline-none ${config.included
                            ? "border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            : "border-slate-200 bg-slate-100 text-slate-400"
                            }`}
                          disabled={!config.included}
                        >
                          {DATA_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Preview */}
                      <td className="border-b border-slate-100 p-4">
                        <span
                          className={`text-xs ${config.included ? "text-slate-500" : "text-slate-400"}`}
                        >
                          {csvData[0] &&
                            String(csvData[0][config.name]).slice(0, 30)}
                          {csvData[0] &&
                            String(csvData[0][config.name]).length > 30 &&
                            "..."}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-green-50 p-4">
            <h4 className="font-semibold text-green-800">
              {/* Résumé de l&apos;import : */}
              Import Summary:
            </h4>
            <ul className="mt-2 space-y-1 text-sm text-green-700">
              <li>
                {/* • <strong>{includedCount}</strong> colonne(s) sera/seront importées */}
                • <strong>{includedCount}</strong> column(s) will be imported
              </li>
              <li>
                {/* • <strong>{csvData.length}</strong> lignes de données */}
                • <strong>{csvData.length}</strong> rows of data
              </li>
              <li>
                {/* • Table : <strong>{tableName || "Non défini"}</strong> */}
                Table: <strong>{tableName || "Not defined"}</strong>
              </li>
              {columns.length - includedCount > 0 && (
                <li className="text-red-600">
                  {/* • <strong>{columns.length - includedCount}</strong> colonnes
                  seront ignorées */}
                  • <strong>{columns.length - includedCount}</strong> columns will be ignored
                </li>
              )}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-500 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-slate-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={includedCount === 0 || !tableName}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {/* Importer {includedCount} colonnes */}
              Upload {includedCount} column(s)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
