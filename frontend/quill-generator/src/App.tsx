import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";

import "./axios-config";

import { Header } from "@/components/layout/Header";
import Landing from "./pages/Landing";
import CreateQuiz from "./pages/CreateQuiz";
import QuizPreview from "./pages/QuizPreview";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PrivateRoute } from "./components/PrivateRoute";
import { DashboardPage } from "./pages/DashboardPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/create" element={<PrivateRoute><CreateQuiz /></PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                
                {/* Dynamic routes for viewing and editing quizzes */}
                <Route path="/quiz/:id" element={<PrivateRoute><QuizPreview /></PrivateRoute>} />
                <Route path="/edit/:id" element={<PrivateRoute><QuizPreview /></PrivateRoute>} />
                
                <Route path="/preview" element={<QuizPreview />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;