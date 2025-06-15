import Header from "@/components/Header";
import ConversationalAI from "@/components/ConversationalAI";
import DataIngestion from "@/components/DataIngestion";
import DataCleaning from "@/components/DataCleaning";
import AnalysisVisualization from "@/components/AnalysisVisualization";
import ReportGeneration from "@/components/ReportGeneration";
import AuthGuard from "@/components/AuthGuard";
import LogoutButton from "@/components/LogoutButton";
import ProfileBadge from "@/components/ProfileBadge";

const Index = () => {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <div className="flex justify-end items-center px-8 py-2 gap-4">
          <ProfileBadge />
          <LogoutButton />
        </div>

        <main className="flex-1 flex flex-col xl:flex-row gap-8 px-8 py-8 max-w-[1600px] w-full mx-auto">
          {/* Main process area */}
          <section className="w-full xl:w-2/3 flex flex-col gap-6">
            <div className="mb-2">
              <div className="text-2xl font-bold text-primary mb-1">Welcome to MnM Analyst</div>
              <div className="text-base text-muted-foreground max-w-2xl">
                Instantly analyze your messy data, get AI-generated insights, and export clear business reports — no analyst required. Get started below:
              </div>
            </div>

            <DataIngestion />
            <DataCleaning />
            <AnalysisVisualization />
            <ReportGeneration />

            <div className="mt-6 text-xs text-muted-foreground">
              <b className="text-accent">Unique Advantage:</b> MnM Analyst is built for non-technical business teams who need quick answers from real-world data. Even incomplete or messy spreadsheets are welcome!
            </div>
          </section>

          {/* Conversational AI sidebar */}
          <aside className="xl:w-1/3 w-full flex flex-col">
            <div className="sticky top-8">
              <ConversationalAI />
            </div>
          </aside>
        </main>
      </div>
    </AuthGuard>
  );
};

export default Index;
