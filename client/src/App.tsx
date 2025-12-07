import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import HistoryPage from "./pages/HistoryPage";
import ContractsPage from "./pages/ContractsPage";
import SecurityPage from "./pages/SecurityPage";
import DocsPage from "./pages/DocsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

import ResearchPage from "./pages/ResearchPage";
import GeneratePage from "./pages/GeneratePage";
import AuditPage from "./pages/AuditPage";
import SwapPage from "./pages/SwapPage";
import TransferPage from "./pages/TransferPage";
import StakePage from "./pages/StakePage";
import DeployPage from "./pages/DeployPage";
import InteractPage from "./pages/InteractPage";
import PremiumPage from "./pages/PremiumPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/audit" element={<AuditPage />} />
          {/* ... other routes */}
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/contracts" element={<ContractsPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/swap" element={<SwapPage />} />
          <Route path="/transfer" element={<TransferPage />} />
          <Route path="/stake" element={<StakePage />} />
          <Route path="/deploy" element={<DeployPage />} />
          <Route path="/interact" element={<InteractPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
