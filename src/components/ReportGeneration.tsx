
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

const ReportGeneration = () => (
  <Card className="min-h-[120px] flex items-center gap-5 px-6 py-6 border-accent bg-white animate-fade-in shadow">
    <FileText size={28} className="text-accent" />
    <div className="flex-1">
      <div className="font-semibold text-base text-accent tracking-tight mb-1">
        Export a Business Report
      </div>
      <div className="text-muted-foreground text-sm max-w-xl">
        MnM Analyst can generate a downloadable report packed with your data’s key findings. (Export feature coming soon!)
      </div>
    </div>
    <button
      className="px-4 py-2 bg-accent text-accent-foreground rounded font-medium shadow hover:bg-accent/80 transition"
      disabled
    >
      Export Report
    </button>
  </Card>
);

export default ReportGeneration;
