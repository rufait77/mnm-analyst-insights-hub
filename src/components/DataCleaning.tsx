
import { Card } from "@/components/ui/card";
import { PieChart } from "lucide-react";

const DataCleaning = () => (
  <Card className="flex gap-4 items-center px-6 py-7 bg-muted/40 border-muted shadow-none">
    <PieChart size={32} className="text-primary" />
    <div>
      <div className="font-semibold text-lg text-primary tracking-tight mb-1">Data Cleaning Guidance</div>
      <div className="text-muted-foreground text-sm max-w-xl">
        We’ll walk you through cleaning your data: fixing missing values, standardizing columns, and more. (Feature placeholder)
      </div>
    </div>
  </Card>
);

export default DataCleaning;
