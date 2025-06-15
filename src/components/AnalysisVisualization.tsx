
import { Card } from "@/components/ui/card";
import { BarChart } from "lucide-react";

const AnalysisVisualization = () => (
  <Card className="min-h-[200px] flex items-center gap-5 px-6 py-7 border-secondary bg-background animate-fade-in shadow-none">
    <BarChart size={32} className="text-secondary" />
    <div>
      <div className="font-semibold text-lg text-secondary tracking-tight mb-1">
        AI-Powered Insights & Visualizations
      </div>
      <div className="text-muted-foreground text-sm max-w-xl">
        Get instant analysis and clear visual charts powered by AI. (Charts and insights will appear here after analyzing your data!)
      </div>
    </div>
  </Card>
);

export default AnalysisVisualization;
