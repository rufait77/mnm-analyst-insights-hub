import { Card } from "@/components/ui/card";
import { BarChart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import BarChartPanel from "./BarChartPanel";
import PieChartPanel from "./PieChartPanel";
import TrendChartPanel from "./TrendChartPanel";
import AISummaryPanel from "./AISummaryPanel";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AnalysisVisualization = ({
  selectedRow,
  rowPreview, // assume this prop contains { headers: string[]; rows: string[][] } from DataIngestion
}) => {
  // Added state
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAISummary] = useState<string>("");
  const [barData, setBarData] = useState<{ x: string; y: number }[]>([]);
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const [trendData, setTrendData] = useState<{ x: string; y: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Whether there's a selected CSV with preview ready
  const canAnalyze = !!(selectedRow && rowPreview);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare minimal CSV for edge function (headers + up to 100 rows)
      const csvPayload = [
        rowPreview.headers,
        ...rowPreview.rows.slice(0, 100)
      ];

      const res = await fetch("/functions/v1/analyze-csv-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvPayload }),
      });

      if (!res.ok) throw new Error("Failed to analyze CSV");
      const json = await res.json();

      setAISummary(json.summary || "No summary returned.");
      setBarData(json.barData ?? []);
      setPieData(json.pieData ?? []);
      setTrendData(json.trendData ?? []);
    } catch (e: any) {
      setError(e.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[200px] flex flex-col items-center gap-5 px-6 py-7 border-secondary bg-background animate-fade-in shadow-none rounded">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg font-semibold text-secondary tracking-tight">
          AI-Powered Insights & Visualizations
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={!canAnalyze || loading}
          onClick={handleAnalyze}
          className="ml-2"
        >
          {loading ? (<Loader2 className="animate-spin mr-1" size={16} />) : "Analyze"}
        </Button>
      </div>
      <div className="text-muted-foreground text-sm max-w-xl mb-2">
        Get instant analysis and clear visual charts powered by AI. Select a file to analyze, then click "Analyze".
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {/* Show summary and charts when available */}
      {(aiSummary || loading) && (
        <AISummaryPanel summary={aiSummary} loading={loading} />
      )}
      {barData.length > 0 && <BarChartPanel data={barData} title="Bar Chart" />}
      {pieData.length > 0 && <PieChartPanel data={pieData} title="Pie Chart" />}
      {trendData.length > 0 && <TrendChartPanel data={trendData} title="Trend Chart" />}
    </div>
  );
};

export default AnalysisVisualization;
