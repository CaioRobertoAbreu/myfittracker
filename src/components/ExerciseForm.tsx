import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rpe: number;
  progressionType: string;
  technique?: string;
  techniqueDescription?: string;
}

interface ExerciseFormProps {
  onAddExercise: (exercise: Exercise) => void;
}

export function ExerciseForm({ onAddExercise }: ExerciseFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sets: 3,
    reps: '8-12',
    rpe: 8,
    progressionType: 'Progressão Dupla',
    technique: '',
    techniqueDescription: ''
  });

  const progressionTypes = [
    'Progressão Dupla',
    'Progressão Linear',
    'Ondulação',
    'Cluster',
    'Rest-Pause',
    'Drop Set'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    const exercise: Exercise = {
      id: crypto.randomUUID(),
      name: formData.name.trim(),
      sets: formData.sets,
      reps: formData.reps,
      rpe: formData.rpe,
      progressionType: formData.progressionType,
      technique: formData.technique.trim() || undefined,
      techniqueDescription: formData.techniqueDescription.trim() || undefined
    };

    onAddExercise(exercise);
    
    // Reset form
    setFormData({
      name: '',
      sets: 3,
      reps: '8-12',
      rpe: 8,
      progressionType: 'Progressão Dupla',
      technique: '',
      techniqueDescription: ''
    });
    
    setIsOpen(false);
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      sets: 3,
      reps: '8-12',
      rpe: 8,
      progressionType: 'Progressão Dupla',
      technique: '',
      techniqueDescription: ''
    });
    setIsOpen(false);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full flex items-center gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" />
          Adicionar Exercício
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <Card className="mt-3">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Novo Exercício</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="exerciseName">Nome do Exercício *</Label>
                  <Input
                    id="exerciseName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Agachamento (com pausa de 2 segundos)"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sets">Séries</Label>
                  <Input
                    id="sets"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.sets}
                    onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value) || 3 })}
                  />
                </div>

                <div>
                  <Label htmlFor="reps">Repetições</Label>
                  <Input
                    id="reps"
                    value={formData.reps}
                    onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                    placeholder="Ex: 8-12, 5, 10-15"
                  />
                </div>

                <div>
                  <Label htmlFor="rpe">RPE (Esforço)</Label>
                  <Input
                    id="rpe"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.rpe}
                    onChange={(e) => setFormData({ ...formData, rpe: parseInt(e.target.value) || 8 })}
                  />
                </div>

                <div>
                  <Label htmlFor="progressionType">Tipo de Progressão</Label>
                  <Select
                    value={formData.progressionType}
                    onValueChange={(value) => setFormData({ ...formData, progressionType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {progressionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="technique">Técnica Avançada (opcional)</Label>
                  <Input
                    id="technique"
                    value={formData.technique}
                    onChange={(e) => setFormData({ ...formData, technique: e.target.value })}
                    placeholder="Ex: Progressão Dupla, Rest-Pause, etc."
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="techniqueDescription">Descrição da Técnica (opcional)</Label>
                  <Textarea
                    id="techniqueDescription"
                    value={formData.techniqueDescription}
                    onChange={(e) => setFormData({ ...formData, techniqueDescription: e.target.value })}
                    placeholder="Descreva como executar a técnica..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}