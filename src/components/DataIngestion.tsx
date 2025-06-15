import { useRef, useState } from "react";
import { FileText, Loader2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Papa from "papaparse";
import FileList, { type FileRow } from "./FileList";
import { Button } from "@/components/ui/button";
import { analyzeCsvIssues, type CsvIssue } from "@/utils/analyzeCsvIssues";

const BUCKET = "uploads";

const DataIngestion = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [fileListKey, setFileListKey] = useState(0); // for forcing FileList to refresh

  // NEW: Track file row selection for preview (from FileList)
  const [selectedRow, setSelectedRow] = useState<FileRow | null>(null);
  const [rowPreview, setRowPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [loadingRowPreview, setLoadingRowPreview] = useState(false);

  // Add for cleaning diagnostics:
  const [cleaningReport, setCleaningReport] = useState<CsvIssue[] | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  // When file selected, just set file and preview, do NOT upload.
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;
    const file = files[0];
    setSelectedFile(file);
    setPreview(null);

    // Try to preview CSV client-side
    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      Papa.parse(file, {
        complete: (res: Papa.ParseResult<string[]>) => {
          const rows = res.data as string[][];
          if (rows.length) {
            setPreview({
              headers: rows[0],
              rows: rows.slice(1, 6) // first 5 rows
            });
            // Analyze file issues (for first 100 rows)
            setCleaningReport(analyzeCsvIssues(rows[0], rows.slice(1, 100)));
          }
        },
        error: () => {
          setPreview(null);
          setCleaningReport(null);
        }
      });
    } else {
      setPreview(null);
      setCleaningReport(null);
    }
  };

  // Now, upload only when user clicks Upload File
  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    // 1. Get the logged-in user
    const userResponse = await supabase.auth.getUser();
    const user = userResponse.data.user;
    if (!user) {
      toast({ title: "Not authenticated" });
      setUploading(false);
      return;
    }
    // Log user info for debugging RLS error
    console.log("DEBUG - Authenticated user object:", user);

    const storagePath = `${user.id}/${Date.now()}_${selectedFile.name}`;

    // 2. Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, selectedFile);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    // 3. Insert file record in DB
    console.log("DEBUG - Inserting into files with user_id:", user.id);

    const { error: insertError } = await supabase
      .from("files")
      .insert({
        user_id: user.id,
        original_filename: selectedFile.name,
        storage_path: storagePath,
      });

    if (insertError) {
      console.error("DEBUG - Failed to insert file record", insertError);
      toast({ title: "Error", description: insertError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    toast({ title: "File uploaded!" });

    // 4. Reset UI and force FileList refresh
    setSelectedFile(null);
    setPreview(null);
    inputRef.current!.value = "";
    setFileListKey(k => k + 1);
    setUploading(false);
  };

  // When a row in the FileList is selected, download and preview the CSV file (if a CSV)
  const handleSelectRow = async (fileRow: FileRow) => {
    setSelectedRow(fileRow);
    setRowPreview(null);
    setLoadingRowPreview(true);

    // Only handle if CSV for now
    if (fileRow.original_filename.endsWith(".csv")) {
      // Download file from storage
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .download(fileRow.storage_path);
      if (error || !data) {
        setRowPreview(null);
        setLoadingRowPreview(false);
        toast({ title: "Failed to load file", description: error?.message, variant: "destructive" });
        return;
      }
      // Parse CSV from Blob
      Papa.parse(data, {
        complete: (res: Papa.ParseResult<string[]>) => {
          const rows = res.data as string[][];
          if (rows.length) {
            setRowPreview({
              headers: rows[0],
              rows: rows.slice(1, 6) // first 5 rows
            });
            // Analyze for cleaning
            setCleaningReport(analyzeCsvIssues(rows[0], rows.slice(1, 100)));
          }
          setLoadingRowPreview(false);
        },
        error: () => {
          setRowPreview(null);
          setCleaningReport(null);
          setLoadingRowPreview(false);
        }
      });
    } else {
      setRowPreview(null);
      setCleaningReport(null);
      setLoadingRowPreview(false);
    }
  };

  return (
    <Card className="flex flex-col items-center justify-center gap-4 py-10 px-8 min-h-[220px] bg-accent/30 border-dashed border-2 border-accent hover:shadow-md transition-shadow">
      <FileText size={40} className="text-accent mb-2" />
      <div className="text-xl font-semibold text-accent-foreground">
        Upload Your Data
      </div>
      <div className="text-muted-foreground text-sm mb-1">
        Accepts CSV or Excel spreadsheets. Messy data welcome!
      </div>
      <Button
        onClick={handleClick}
        disabled={uploading}
        variant="default"
      >
        {uploading && !selectedFile ? (
          <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Loading...</span>
        ) : "Select File"}
      </Button>
      <input
        type="file"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        className="hidden"
        ref={inputRef}
        onChange={handleFileChange}
        disabled={uploading}
      />
      {/* Preview parsed table */}
      {preview && (
        <div className="mt-6 w-full max-w-xl">
          <div className="font-bold mb-2 text-accent-foreground">CSV Preview:</div>
          <div className="overflow-auto border rounded bg-white shadow">
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  {preview.headers.map((h, i) => <th className="px-2 py-1 border-b" key={i}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => <td className="px-2 py-1" key={j}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Data cleaning guidance: always immediately below preview */}
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
      )}
      {/* Show selected file name */}
      {selectedFile && (
        <div className="mt-3 flex flex-col items-center gap-2 w-full max-w-xl">
          <div className="text-accent-foreground text-sm">{selectedFile.name}</div>
          <Button
            variant="secondary"
            className="flex items-center gap-1"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="animate-spin mr-1" size={16} />
            ) : (
              <Upload className="mr-1" size={16} />
            )}
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      )}

      {/* --------- New: Show selected row preview -------- */}
      {selectedRow && (
        <div className="mt-8 w-full max-w-xl border rounded bg-muted/10 p-4 shadow-sm">
          <div className="font-medium text-accent-foreground flex flex-wrap items-center gap-2 mb-2">
            <span>Selected file:</span>
            <span className="font-mono text-xs bg-accent px-2 py-0.5 rounded">{selectedRow.original_filename}</span>
          </div>
          {loadingRowPreview ? (
            <div className="text-muted-foreground text-xs">Loading preview...</div>
          ) : rowPreview ? (
            <div className="overflow-auto border rounded bg-white">
              <table className="min-w-full text-xs">
                <thead>
                  <tr>
                    {rowPreview.headers.map((h, i) => <th className="px-2 py-1 border-b" key={i}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rowPreview.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => <td className="px-2 py-1" key={j}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted-foreground text-xs">No preview available for this file type.</div>
          )}
          {/* FUTURE: Add data cleaning or export actions here when implemented */}
        </div>
      )}

      {/* File list */}
      <div className="w-full mt-12">
        <FileList
          key={fileListKey}
          selectedFileId={selectedRow?.id}
          onSelectFile={handleSelectRow}
        />
      </div>
    </Card>
  );
};

export default DataIngestion;
