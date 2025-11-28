import { Header } from "@/components/Header";
import { EstimatorChat } from "@/components/EstimatorChat";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <EstimatorChat />
      </main>
    </div>
  );
};

export default Index;
