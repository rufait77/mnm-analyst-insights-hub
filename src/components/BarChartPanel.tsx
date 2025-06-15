
import React from "react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type BarChartPanelProps = {
  data: { x: string; y: number }[];
  title?: string;
};

const BarChartPanel: React.FC<BarChartPanelProps> = ({ data, title }) => (
  <div className="bg-white p-4 rounded shadow mb-4">
    {title && <div className="font-semibold mb-2">{title}</div>}
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="y" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default BarChartPanel;
