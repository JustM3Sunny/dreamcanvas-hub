
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import Styles from "./pages/Styles";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Features from "./pages/Features";
import Templates from "./pages/Templates";
import Community from "./pages/Community";
import Support from "./pages/Support";

// Create a new QueryClient
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
            <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
            <Route path="/styles" element={<Layout><Styles /></Layout>} />
            <Route path="/settings" element={<Layout><Settings /></Layout>} />
            <Route path="/admin" element={<Layout><Admin /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/features" element={<Layout><Features /></Layout>} />
            <Route path="/templates" element={<Layout><Templates /></Layout>} />
            <Route path="/community" element={<Layout><Community /></Layout>} />
            <Route path="/support" element={<Layout><Support /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
