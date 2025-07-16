import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, Target, ArrowLeft, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TrainingPlan {
  id: string;
  name: string;
  description: string | null;
  total_weeks: number;
  current_week: number;
  created_at: string;
}

export default function TrainingList() {
  const navigate = useNavigate();
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrainingPlans();
  }, []);

  const loadTrainingPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrainingPlans(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos de treino:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainingClick = (planId: string) => {
    navigate(`/treinos/${planId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando treinos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Meus Treinos</h1>
              <p className="text-muted-foreground">Selecione um plano de treino para começar</p>
            </div>
          </div>
          
          <Button 
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            onClick={() => navigate('/treinos/novo')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Treino
          </Button>
        </div>

        {/* Training Plans Grid */}
        {trainingPlans.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">Nenhum treino encontrado</h3>
            <p className="text-muted-foreground mb-6">Crie seu primeiro plano de treino para começar</p>
            <Button 
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              onClick={() => navigate('/treinos/novo')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Treino
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingPlans.map((plan) => (
              <Card 
                key={plan.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30 hover:scale-[1.02]"
                onClick={() => handleTrainingClick(plan.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground mt-1">
                        {plan.description || "Sem descrição"}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="ml-2 bg-primary/10 text-primary border-primary/20"
                    >
                      Ativo
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{plan.total_weeks} semanas</p>
                        <p className="text-xs text-muted-foreground">Duração total</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-secondary" />
                      <div>
                        <p className="text-sm font-medium">Semana {plan.current_week}</p>
                        <p className="text-xs text-muted-foreground">Atual</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{Math.round((plan.current_week / plan.total_weeks) * 100)}%</span>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out"
                        style={{ width: `${(plan.current_week / plan.total_weeks) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTrainingClick(plan.id);
                    }}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Continuar Treino
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}