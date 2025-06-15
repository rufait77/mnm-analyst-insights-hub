
import React from "react";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type TrendChartPanelProps = {
  data: { x: string; y: number }[];
  title?: string;
};

const TrendChartPanel: React.FC<TrendChartPanelProps> = ({ data, title }) => (
  <div className="bg-white p-4 rounded shadow mb-4">
    {title && <div className="font-semibold mb-2">{title}</div>}
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="y" stroke="#82ca9d" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default TrendChartPanel;
