
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type FileRow = {
  id: string;
  original_filename: string;
  storage_path: string;
  uploaded_at: string;
};

const FileList = () => {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("files")
      .select("id, original_filename, storage_path, uploaded_at")
      .order("uploaded_at", { ascending: false })
      .then(({ data }) => {
        setFiles((data as FileRow[]) || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-muted-foreground text-sm">Loading files...</div>;
  if (!files.length) return <div className="text-muted-foreground text-sm">No files uploaded yet.</div>;

  return (
    <div>
      <div className="font-semibold text-accent-foreground mb-2">Previously Uploaded Files</div>
      <div className="border rounded bg-white shadow-sm overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Uploaded At</TableHead>
              <TableHead>Download</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map(f => (
              <TableRow key={f.id}>
                <TableCell>{f.original_filename}</TableCell>
                <TableCell>{new Date(f.uploaded_at).toLocaleString()}</TableCell>
                <TableCell>
                  <a
                    href={`https://izigohixbhppyyoueutp.supabase.co/storage/v1/object/public/uploads/${f.storage_path}`}
                    className="text-primary underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FileList;
