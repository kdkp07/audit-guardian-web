import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import AgentLogs from "./pages/AgentLogs";
import ComplianceStandards from "./pages/ComplianceStandards";
import AuditReports from "./pages/AuditReports";
import NotFound from "./pages/NotFound";
import { AgentLogsProvider } from "./context/AgentLogsContext.js";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AgentLogsProvider> 
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/upload" element={<Layout><Upload /></Layout>} />
          <Route path="/logs" element={<Layout><AgentLogs /></Layout>} />
          <Route path="/standards" element={<Layout><ComplianceStandards /></Layout>} />
          <Route path="/reports" element={<Layout><AuditReports /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AgentLogsProvider> 
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
