import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ChatPage from "./pages/ChatPage";
import { SessionContextProvider } from "./contexts/SessionContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AdminProtectedRoute from "./components/layout/AdminProtectedRoute";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserDetail from "./pages/AdminUserDetail";
import { ThemeProvider } from "./components/theme/theme-provider";
import LandingPage from "./pages/Index"; // Manter import para outras rotas se necessário
import N8nTestPage from "./pages/N8nTestPage";
import FaqPage from "./pages/FaqPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import Index from "./pages/Index"; // Importar o novo componente Index

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <SessionContextProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              {/* <Route path="/payment-simulation" element={<PaymentSimulationPage />} /> REMOVIDO */}
              <Route path="/n8n-test" element={<N8nTestPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/faq" element={<FaqPage />} />
              
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/chat/:projectId" element={<ChatPage />} />
                  <Route path="/profile" element={<Profile />} />

                  {/* Admin Routes */}
                  <Route element={<AdminProtectedRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/user/:userId" element={<AdminUserDetail />} />
                  </Route>
                </Route>
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </SessionContextProvider>
  </ThemeProvider>
);

export default App;