import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { Dumbbell, Apple, LogOut, User, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AuthGuard from "@/components/AuthGuard";

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  created_at: string;
  updated_at: string;
}

const Index = () => {
  const [user, setUser] = React.useState<SupabaseUser | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          loadProfile(session.user.id);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const cleanupAuthState = () => {
    localStorage.removeItem('supabase.auth.token');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleSignOut = async () => {
    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignore errors
      }
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
      
      window.location.href = '/auth';
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">FitTracker</h1>
              <p className="text-muted-foreground">
                Gerencie seus treinos e dietas de forma inteligente
              </p>
              {user && (
                <p className="text-sm text-muted-foreground mt-2">
                  Bem-vindo, {profile?.username || user.email}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate("/perfil")}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Perfil
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/treinos")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Dumbbell className="h-8 w-8 text-primary" />
                  Meus Treinos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Crie e gerencie seus planos de treino, acompanhe exercícios e evolua semana a semana.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/dietas")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Apple className="h-8 w-8 text-primary" />
                  Minhas Dietas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Organize suas refeições, controle macronutrientes e acompanhe seu progresso nutricional.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/peso")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <LineChart className="h-8 w-8 text-primary" />
                  Peso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Registre seu peso e acompanhe a evolução ao longo do tempo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Index;