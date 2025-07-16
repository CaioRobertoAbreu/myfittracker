import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, Target, ArrowLeft, Plus, AlertTriangle, Trash2, CheckCircle, XCircle, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { updateTrainingExpiredStatus, deleteTrainingPlan } from '@/services/trainingService';
import { useToast } from '@/hooks/use-toast';

interface TrainingPlan {
  id: string;
  name: string;
  description: string | null;
  total_weeks: number;
  current_week: number;
  start_date: string;
  end_date: string;
  is_expired: boolean;
  created_at: string;
}

export default function TrainingList() {
  const navigate = useNavigate();
  const { toast } = useToast();
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
      
      // Verificar e atualizar automaticamente treinos vencidos
      const currentDate = new Date().toISOString().split('T')[0];
      const updatedPlans = data || [];
      
      for (const plan of updatedPlans) {
        if (plan.end_date < currentDate && !plan.is_expired) {
          await updateTrainingExpiredStatus(plan.id, true);
          plan.is_expired = true;
        }
      }
      
      setTrainingPlans(updatedPlans);
    } catch (error) {
      console.error('Erro ao carregar planos de treino:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainingClick = (planId: string) => {
    navigate(`/treinos/${planId}`);
  };

  const handleToggleExpired = async (planId: string, currentStatus: boolean) => {
    try {
      await updateTrainingExpiredStatus(planId, !currentStatus);
      setTrainingPlans(plans => 
        plans.map(plan => 
          plan.id === planId ? { ...plan, is_expired: !currentStatus } : plan
        )
      );
      toast({
        title: "Status atualizado",
        description: `Treino marcado como ${!currentStatus ? 'vencido' : 'ativo'}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deleteTrainingPlan(planId);
      setTrainingPlans(plans => plans.filter(plan => plan.id !== planId));
      toast({
        title: "Treino excluído",
        description: "O treino foi removido com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o treino",
        variant: "destructive"
      });
    }
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
                className={`group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 ${
                  plan.is_expired ? 'opacity-75' : ''
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => handleTrainingClick(plan.id)}>
                      <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground mt-1">
                        {plan.description || "Sem descrição"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {plan.is_expired ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Vencido
                        </Badge>
                      ) : (
                        <Badge 
                          variant="secondary" 
                          className="bg-primary/10 text-primary border-primary/20"
                        >
                          Ativo
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Início:</p>
                      <p className="font-medium">{new Date(plan.start_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fim:</p>
                      <p className="font-medium">{new Date(plan.end_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

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
                        className={`h-full transition-all duration-300 ease-out ${
                          plan.is_expired 
                            ? 'bg-gradient-to-r from-destructive to-destructive/80' 
                            : 'bg-gradient-to-r from-primary to-primary/80'
                        }`}
                        style={{ width: `${(plan.current_week / plan.total_weeks) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrainingClick(plan.id);
                      }}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      {plan.is_expired ? 'Ver Treino' : 'Continuar'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleExpired(plan.id, plan.is_expired);
                      }}
                      className="flex items-center gap-1"
                    >
                      {plan.is_expired ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/treinos/${plan.id}/editar`);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirmar Exclusão</DialogTitle>
                          <DialogDescription>
                            Tem certeza que deseja excluir o treino "{plan.name}"? 
                            Esta ação não pode ser desfeita e todos os dados do treino serão permanentemente removidos.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogTrigger asChild>
                            <Button variant="outline">Cancelar</Button>
                          </DialogTrigger>
                          <DialogTrigger asChild>
                            <Button 
                              variant="destructive"
                              onClick={() => handleDeletePlan(plan.id)}
                            >
                              Excluir Treino
                            </Button>
                          </DialogTrigger>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}