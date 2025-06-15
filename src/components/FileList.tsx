
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";

type FileRow = {
  id: string;
  original_filename: string;
  storage_path: string;
  uploaded_at: string;
};

const BUCKET = "uploads";

const FileList = () => {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchFiles = () => {
    setLoading(true);
    supabase
      .from("files")
      .select("id, original_filename, storage_path, uploaded_at")
      .order("uploaded_at", { ascending: false })
      .then(({ data }) => {
        setFiles((data as FileRow[]) || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (file: FileRow) => {
    setDeletingId(file.id);

    // Delete from storage
    const { error: storageError } = await supabase.storage.from(BUCKET).remove([file.storage_path]);
    if (storageError) {
      toast({ title: "Failed to delete file from storage", description: storageError.message, variant: "destructive" });
      setDeletingId(null);
      return;
    }

    // Delete from files table
    const { error: dbError } = await supabase.from("files").delete().eq("id", file.id);
    if (dbError) {
      toast({ title: "Failed to delete record", description: dbError.message, variant: "destructive" });
      setDeletingId(null);
      return;
    }

    toast({ title: "File deleted" });
    setDeletingId(null);
    fetchFiles();
  };

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
              <TableHead>Delete</TableHead>
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
                <TableCell>
                  <Button
                    variant="destructive"
                    size="icon"
                    disabled={deletingId === f.id}
                    onClick={() => handleDelete(f)}
                    aria-label="Delete file"
                  >
                    <Trash2 size={16} />
                  </Button>
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
