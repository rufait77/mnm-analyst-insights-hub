
import React from "react";
import { analyzeCsvIssues, CsvIssue } from "@/utils/analyzeCsvIssues";

/** 
 * Shows a preview of a parsed CSV and (optionally) its cleaning report.
 * Used for new uploads.
 */
interface CsvPreviewWithGuidanceProps {
  headers: string[];
  rows: string[][];
  cleaningReport: CsvIssue[] | null;
}

const CsvPreviewWithGuidance: React.FC<CsvPreviewWithGuidanceProps> = ({
  headers,
  rows,
  cleaningReport,
}) => (
  <div className="mt-6 w-full max-w-xl">
    <div className="font-bold mb-2 text-accent-foreground">CSV Preview:</div>
    <div className="overflow-auto border rounded bg-white shadow">
      <table className="min-w-full text-xs">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th className="px-2 py-1 border-b" key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => <td className="px-2 py-1" key={j}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {/* Data cleaning guidance – always below preview */}
    {cleaningReport && (
      <div className="mt-2 w-full border-l-4 border-yellow-400 bg-yellow-50/70 p-4 rounded shadow-sm">
        <div className="font-semibold mb-1 text-yellow-800">CSV Data Cleaning Suggestions:</div>
        <ul className="list-disc list-inside text-sm text-yellow-900 space-y-1">
          {cleaningReport.map((issue, i) => (
            <li key={i}>
              <b>{issue.message}</b>
              {issue.suggestions && (
                <ul className="list-[circle] list-inside ml-5 mt-1 space-y-0.5">
                  {issue.suggestions.map((s, j) => <li key={j}>{s}</li>)}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export default CsvPreviewWithGuidance;
