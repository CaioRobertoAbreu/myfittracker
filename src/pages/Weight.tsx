import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addWeightEntry, getWeightEntries, WeightEntry } from "@/services/weightService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AuthGuard from "@/components/AuthGuard";
import {
  LineChart as ReLineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";

const WeightPage: React.FC = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [weight, setWeight] = React.useState<string>("");
  const [date, setDate] = React.useState<string>(() => new Date().toISOString().slice(0, 10));

  React.useEffect(() => {
    document.title = "Peso | Acompanhe seu peso";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Registre e acompanhe seu peso ao longo do tempo.");
    } else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = "Registre e acompanhe seu peso ao longo do tempo.";
      document.head.appendChild(m);
    }
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = window.location.href;
  }, []);

  const { data, isLoading } = useQuery<WeightEntry[]>({
    queryKey: ["weight_entries"],
    queryFn: getWeightEntries,
  });

  const mutation = useMutation({
    mutationFn: ({ w, d }: { w: number; d: string }) => addWeightEntry(w, d),
    onSuccess: () => {
      setWeight("");
      qc.invalidateQueries({ queryKey: ["weight_entries"] });
      toast({ title: "Peso adicionado", description: "Registro salvo com sucesso." });
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err?.message || "Não foi possível salvar.", variant: "destructive" });
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight.replace(",", "."));
    if (!w || isNaN(w)) {
      toast({ title: "Informe um peso válido", variant: "destructive" });
      return;
    }
    mutation.mutate({ w, d: date });
  };

  const chartData = (data || []).map((it) => ({
    date: it.recorded_at,
    weight: Number(it.weight),
  }));

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-3xl mx-auto grid gap-6">
          <header>
            <h1 className="text-3xl font-semibold">Acompanhar Peso</h1>
            <p className="text-muted-foreground">Adicione seu peso diário e visualize a evolução.</p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Novo registro</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2 sm:col-span-1">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder="Ex.: 72.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2 sm:col-span-1">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-end sm:col-span-1">
                  <Button type="submit" className="w-full" disabled={mutation.isPending}>
                    {mutation.isPending ? "Salvando..." : "Adicionar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evolução do peso</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Carregando...</div>
              ) : chartData.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sem dados ainda. Adicione seu primeiro registro.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => {
                        try { return format(parseISO(d as string), "dd/MM"); } catch { return d as string; }
                      }}
                    />
                    <YAxis domain={["dataMin - 2", "dataMax + 2"]} tickFormatter={(v) => `${v}kg`} />
                    <Tooltip
                      labelFormatter={(d) => {
                        try { return format(parseISO(String(d)), "dd/MM/yyyy"); } catch { return String(d); }
                      }}
                      formatter={(v) => [`${v} kg`, "Peso"]}
                    />
                    <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </ReLineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </AuthGuard>
  );
};

export default WeightPage;
