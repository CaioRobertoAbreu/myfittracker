import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Target, Calendar, TrendingUp, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-training-primary/20 via-background to-training-accent/20"></div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo/Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-training-primary/20 mb-8 animate-glow">
              <Dumbbell className="h-10 w-10 text-training-primary" />
            </div>
            
            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-training-primary to-training-accent bg-clip-text text-transparent animate-fade-in">
              Gestor de Treinos
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in">
              Organize, acompanhe e evolua seus treinos com precisão
            </p>
            
            {/* Description */}
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in">
              Sistema completo para gerenciar seus planos de treinamento, acompanhar o progresso 
              semanal e otimizar seus resultados com técnicas avançadas de progressão.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex gap-4 flex-col sm:flex-row justify-center">
              <Button
                onClick={() => navigate("/treinos")}
                size="lg"
                className="text-lg px-8 py-4 gap-3 animate-scale-in hover:shadow-lg hover:shadow-training-primary/30 transition-all duration-300"
              >
                <Target className="h-5 w-5" />
                Meus Treinos
              </Button>
              <Button
                onClick={() => navigate("/dietas")}
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 gap-3 animate-scale-in hover:shadow-lg hover:shadow-training-accent/30 transition-all duration-300"
              >
                <Calendar className="h-5 w-5" />
                Minhas Dietas
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Funcionalidades Principais
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa para gerenciar seus treinos de forma profissional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="group hover:shadow-lg hover:shadow-training-primary/20 transition-all duration-300 animate-fade-in">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-training-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-training-primary" />
              </div>
              <CardTitle>Progressão Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Acompanhe seu progresso ao longo de 8 semanas com períodos de deload programados 
                para otimizar sua recuperação e crescimento.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="group hover:shadow-lg hover:shadow-training-accent/20 transition-all duration-300 animate-fade-in">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-training-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-training-accent" />
              </div>
              <CardTitle>Técnicas Avançadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Instruções detalhadas para cada exercício, incluindo técnicas especiais como 
                pausas controladas e progressão dupla.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="group hover:shadow-lg hover:shadow-training-success/20 transition-all duration-300 animate-fade-in">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-training-success/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-training-success" />
              </div>
              <CardTitle>RPE & Progressão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sistema de RPE (Rate of Perceived Exertion) integrado com diferentes tipos de 
                progressão para maximizar seus ganhos.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-card/50 backdrop-blur border-y border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-3xl md:text-4xl font-bold text-training-primary mb-2">8</div>
              <div className="text-muted-foreground">Semanas de Treino</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-3xl md:text-4xl font-bold text-training-accent mb-2">5</div>
              <div className="text-muted-foreground">Dias por Semana</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-3xl md:text-4xl font-bold text-training-success mb-2">20+</div>
              <div className="text-muted-foreground">Exercícios Únicos</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-3xl md:text-4xl font-bold text-training-warning mb-2">100%</div>
              <div className="text-muted-foreground">Personalizável</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-training-primary/20 mb-6 animate-glow">
            <Star className="h-8 w-8 text-training-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para Começar?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Acesse seus treinos e comece sua jornada de transformação hoje mesmo.
          </p>
          <div className="flex gap-4 flex-col sm:flex-row justify-center">
            <Button
              onClick={() => navigate("/treinos")}
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 gap-3 hover:bg-training-primary hover:text-primary-foreground transition-all duration-300"
            >
              <Dumbbell className="h-5 w-5" />
              Meus Treinos
            </Button>
            <Button
              onClick={() => navigate("/dietas")}
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 gap-3 hover:bg-training-accent hover:text-primary-foreground transition-all duration-300"
            >
              <Calendar className="h-5 w-5" />
              Minhas Dietas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
