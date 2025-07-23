import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check URL parameters for password recovery
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    
    if (type === 'recovery') {
      setResetPassword(true);
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if user needs to change password
        if (session?.user?.user_metadata?.needs_password_change) {
          setNeedsPasswordChange(true);
          return; // Don't redirect if password change is needed
        }
        
        // Redirect authenticated users to home (only if not in recovery mode)
        if (session?.user && !resetPassword && !needsPasswordChange) {
          navigate("/");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check if user needs to change password
      if (session?.user?.user_metadata?.needs_password_change) {
        setNeedsPasswordChange(true);
        return;
      }
      
      // Redirect if already authenticated (but not during password recovery)
      if (session?.user && !type && !needsPasswordChange) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const cleanupAuthState = () => {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = "Erro ao fazer login";
        
        switch (error.message) {
          case "Invalid login credentials":
            errorMessage = "Email ou senha incorretos";
            break;
          case "Email not confirmed":
            errorMessage = "Email não confirmado. Verifique sua caixa de entrada";
            break;
          case "Too many requests":
            errorMessage = "Muitas tentativas. Tente novamente mais tarde";
            break;
          default:
            errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }

      if (data.user) {
        // Check if user needs to change password
        if (data.user.user_metadata?.needs_password_change) {
          setNeedsPasswordChange(true);
          toast({
            title: "Alteração de senha obrigatória",
            description: "Por favor, altere sua senha temporária",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso",
        });
        
        // Force page reload for a clean state
        window.location.href = '/';
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeycloakSignIn = async () => {
    setLoading(true);
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'keycloak',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        throw error;
      }

      // OAuth will redirect, so we don't need to handle success here
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao fazer login com Keycloak",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Erro",
        description: "Digite seu email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Call our edge function to generate temporary password
      const response = await fetch('https://hhxtbsqhaihgvjpulnjl.supabase.co/functions/v1/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoeHRic3FoYWloZ3ZqcHVsbmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzYzNDcsImV4cCI6MjA2ODAxMjM0N30.3VqDU8d20qET04yJ_2-Mcq60Er_fIXtbc_UnZZ6q-LQ',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar senha temporária');
      }

      toast({
        title: "Senha temporária enviada!",
        description: result.message,
      });
      setForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar senha temporária",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ 
        password,
        data: {
          needs_password_change: false // Remove the flag after password change
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Senha alterada com sucesso",
      });
      
      setNeedsPasswordChange(false);
      // Redirect to home after successful password reset
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar senha",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if user is already authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Bem-vindo ao FitTracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          {resetPassword || needsPasswordChange ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {needsPasswordChange ? "Alterar Senha Temporária" : "Nova Senha"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {needsPasswordChange 
                    ? "Você está usando uma senha temporária. Por favor, defina uma nova senha." 
                    : "Digite sua nova senha"
                  }
                </p>
                {needsPasswordChange && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800">
                      ⚠️ Por segurança, você deve alterar sua senha temporária antes de continuar
                    </p>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite a senha novamente"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Alterando..." : "Alterar Senha"}
                </Button>
                {needsPasswordChange && (
                  <p className="text-xs text-center text-muted-foreground">
                    Você não pode acessar o aplicativo até alterar sua senha
                  </p>
                )}
              </form>
            </div>
          ) : forgotPassword ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Esqueci minha senha</h3>
                <p className="text-sm text-muted-foreground">
                  Digite seu email para receber uma senha temporária
                </p>
              </div>
              
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar senha temporária"}
                </Button>
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    💡 Você receberá uma senha temporária por email que deverá ser alterada no primeiro login
                  </p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setForgotPassword(false)}
                >
                  Voltar ao login
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Keycloak Login Button */}
              <Button 
                type="button"
                onClick={handleKeycloakSignIn}
                disabled={loading}
                className="w-full flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                {loading ? "Conectando..." : "Criar conta / Entrar com Keycloak"}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou entre com email e senha
                  </span>
                </div>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm"
                    onClick={() => setForgotPassword(true)}
                  >
                    Esqueci minha senha
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;