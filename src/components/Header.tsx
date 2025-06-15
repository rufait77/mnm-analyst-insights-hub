
import { BarChart } from "lucide-react";

const Header = () => (
  <header className="w-full flex items-center gap-4 px-8 py-6 bg-background border-b">
    <BarChart size={32} className="text-primary" />
    <h1 className="text-3xl font-extrabold tracking-tight text-primary select-none">MnM Analyst</h1>
    <div className="ml-auto text-muted-foreground font-medium text-base hidden md:block">AI-powered Business Insights for Everyone</div>
  </header>
);

export default Header;
