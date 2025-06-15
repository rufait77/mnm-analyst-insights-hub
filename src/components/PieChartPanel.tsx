
import React from "react";
import { ChartContainer } from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type PieChartPanelProps = {
  data: { name: string; value: number }[];
  title?: string;
};

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#d4a7fc", "#aeeaff", "#ffab95", "#ffd66e"];

const PieChartPanel: React.FC<PieChartPanelProps> = ({ data, title }) => (
  <div className="bg-white p-4 rounded shadow mb-4">
    {title && <div className="font-semibold mb-2">{title}</div>}
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="value"
            nameKey="name"
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default PieChartPanel;
