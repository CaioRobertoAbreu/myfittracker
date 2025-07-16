import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TrainingList from "./pages/TrainingList";
import Training from "./pages/Training";
import CreateTraining from "./pages/CreateTraining";
import EditTraining from "./pages/EditTraining";
import DietList from "./pages/DietList";
import CreateDiet from "./pages/CreateDiet";
import EditDiet from "./pages/EditDiet";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/treinos" element={<TrainingList />} />
          <Route path="/treinos/novo" element={<CreateTraining />} />
          <Route path="/treinos/:planId/editar" element={<EditTraining />} />
          <Route path="/treinos/:planId" element={<Training />} />
          <Route path="/dietas" element={<DietList />} />
          <Route path="/dietas/nova" element={<CreateDiet />} />
          <Route path="/dietas/:dietId/editar" element={<EditDiet />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
