
import { useRef, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import Papa from "papaparse";
import FileList from "./FileList";

const BUCKET = "uploads";

const DataIngestion = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;
    const file = files[0];

    setUploading(true);
    setPreview(null);

    // 1. Upload file to Supabase Storage
    const userResponse = await supabase.auth.getUser();
    const user = userResponse.data.user;
    if (!user) {
      toast({ title: "Not authenticated" });
      setUploading(false);
      return;
    }
    const storagePath = `${user.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    // 2. Insert file record
    const { error: insertError } = await supabase
      .from("files")
      .insert({
        user_id: user.id,
        original_filename: file.name,
        storage_path: storagePath,
      });

    if (insertError) {
      toast({ title: "Error", description: insertError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    // 3. Try to preview CSV file client-side
    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      Papa.parse(file, {
        complete: (res: Papa.ParseResult<string[]>) => {
          const rows = res.data as string[][];
          if (rows.length) {
            setPreview({
              headers: rows[0],
              rows: rows.slice(1, 6) // first 5 rows
            });
          }
        },
        error: () => setPreview(null)
      });
    } else {
      setPreview(null);
    }

    toast({ title: "File uploaded!" });
    setUploading(false);
    // Refresh file list
    inputRef.current.value = "";
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
      <button
        className="px-5 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow relative"
        onClick={handleClick}
        disabled={uploading}
      >
        {uploading ? (
          <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Uploading...</span>
        ) : "Select File"}
      </button>
      <input
        type="file"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        className="hidden"
        ref={inputRef}
        onChange={handleFileChange}
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
        </div>
      )}
      {/* File list */}
      <div className="w-full mt-12">
        <FileList />
      </div>
    </Card>
  );
};

export default DataIngestion;
