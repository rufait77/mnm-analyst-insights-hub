
import React from "react";
import { CsvIssue } from "@/utils/analyzeCsvIssues";

interface SelectedFilePreviewWithGuidanceProps {
  filename: string;
  loading: boolean;
  headers: string[] | null;
  rows: string[][] | null;
  cleaningReport: CsvIssue[] | null;
}

const SelectedFilePreviewWithGuidance: React.FC<SelectedFilePreviewWithGuidanceProps> = ({
  filename,
  loading,
  headers,
  rows,
  cleaningReport,
}) => (
  <div className="mt-8 w-full max-w-xl border rounded bg-muted/10 p-4 shadow-sm">
    <div className="font-medium text-accent-foreground flex flex-wrap items-center gap-2 mb-2">
      <span>Selected file:</span>
      <span className="font-mono text-xs bg-accent px-2 py-0.5 rounded">{filename}</span>
    </div>
    {loading ? (
      <div className="text-muted-foreground text-xs">Loading preview...</div>
    ) : headers && rows ? (
      <div>
        <div className="overflow-auto border rounded bg-white">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                {headers.map((h, i) => <th className="px-2 py-1 border-b" key={i}>{h}</th>)}
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
        {/* Data cleaning guidance */}
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
    ) : (
      <div className="text-muted-foreground text-xs">No preview available for this file type.</div>
    )}
  </div>
);

export default SelectedFilePreviewWithGuidance;
