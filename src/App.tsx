import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import { AuthProvider } from '@/contexts/AuthContext';
import { Navigation } from "@/components/Navigation";
import Index from "./pages/Index";
import QuestList from "./pages/QuestList";
import QuestDetail from "./pages/QuestDetail";
import Profile from "./pages/Profile";
import CreateQuest from "./pages/CreateQuest";
import QuestTest from "./pages/QuestTest";
import Guide from "./pages/Guide";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

const App = () => {
  // Enable dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen bg-background">
                  <Navigation />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/quests" element={<QuestList />} />
                    <Route path="/quest/:id" element={<QuestDetail />} />
                    <Route path="/guide" element={<Guide />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/create" element={<CreateQuest />} />
                    <Route path="/test" element={<QuestTest />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
