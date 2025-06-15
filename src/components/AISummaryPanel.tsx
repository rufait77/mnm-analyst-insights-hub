
import React from "react";

type AISummaryPanelProps = {
  summary: string;
  loading: boolean;
};

const AISummaryPanel: React.FC<AISummaryPanelProps> = ({ summary, loading }) => (
  <div className="bg-accent/10 p-4 rounded shadow mb-4">
    <div className="font-semibold mb-1 text-accent-foreground">AI Analysis Summary:</div>
    {loading ? (
      <div className="text-muted-foreground text-sm">Analyzing...</div>
    ) : (
      <div className="text-base text-muted-foreground">{summary}</div>
    )}
  </div>
);

export default AISummaryPanel;
