
import { useRef } from "react";
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

const DataIngestion = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  // Placeholder upload event
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Actual file handling will come with backend.
    const files = e.target.files;
    if (files && files.length > 0) {
      alert("Data received — actual parsing & cleaning will follow soon!");
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
      <button
        className="px-5 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow"
        onClick={handleClick}
      >
        Select File
      </button>
      <input
        type="file"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        className="hidden"
        ref={inputRef}
        onChange={handleFileChange}
      />
    </Card>
  );
};

export default DataIngestion;
