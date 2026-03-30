import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../context/DataContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { ArrowLeft, CloudRain, Droplets, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function Settings() {
  const navigate = useNavigate();
  const { settings, rainfallData, updateSettings, addRainfallData } = useData();
  const [isSubmittingSettings, setIsSubmittingSettings] = useState(false);
  const [isSubmittingRainfall, setIsSubmittingRainfall] = useState(false);

  const [dailyConsumption, setDailyConsumption] = useState(
    settings?.dailyWaterConsumption?.toString() || '50'
  );

  const [rainfallYear, setRainfallYear] = useState(new Date().getFullYear().toString());
  const [rainfallMonth, setRainfallMonth] = useState('1');
  const [rainfallAmount, setRainfallAmount] = useState('');

  const handleSaveSettings = async () => {
    setIsSubmittingSettings(true);
    try {
      await updateSettings({
        id: settings.id,
        dailyWaterConsumption: parseFloat(dailyConsumption),
      });
      toast.success('Configurações salvas!');
    } catch (e: any) {
      toast.error('Erro ao salvar configurações.');
    } finally {
      setIsSubmittingSettings(false);
    }
  };

  const handleAddRainfall = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rainfallAmount || parseFloat(rainfallAmount) < 0) {
      toast.error('Digite a precipitação em mm maior ou igual a 0');
      return;
    }

    setIsSubmittingRainfall(true);
    try {
      await addRainfallData({
        year: parseInt(rainfallYear),
        month: parseInt(rainfallMonth),
        rainfallMM: parseFloat(rainfallAmount),
      });

      toast.success('Dados de precipitação adicionados!');
      setRainfallAmount('');
    } catch (e: any) {
      toast.error('Erro ao adicionar precipitação');
    } finally {
      setIsSubmittingRainfall(false);
    }
  };

  const sortedRainfallData = [...rainfallData].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Sistema</CardTitle>
            <CardDescription>
              Configure os parâmetros de cálculo de consumo e captação de água
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Consumo de Água
              </h3>

              <div className="space-y-2">
                <Label htmlFor="dailyConsumption">
                  Consumo Diário por Pessoa (litros/dia)
                </Label>
                <Input
                  id="dailyConsumption"
                  type="number"
                  value={dailyConsumption}
                  onChange={(e) => setDailyConsumption(e.target.value)}
                  min="1"
                />
                <p className="text-sm text-muted-foreground">
                  ONU recomenda 50L/dia. ASA recomenda 13L/dia para regiões semiáridas.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDailyConsumption('50')}
                  >
                    Usar ONU (50L)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDailyConsumption('13')}
                  >
                    Usar ASA (13L)
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isSubmittingSettings}>
                {isSubmittingSettings ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados de Precipitação</CardTitle>
            <CardDescription>
              Registre a quantidade de chuva mensal para melhorar os cálculos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAddRainfall} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="rainfallYear">Ano</Label>
                  <Select value={rainfallYear} onValueChange={setRainfallYear}>
                    <SelectTrigger id="rainfallYear">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rainfallMonth">Mês</Label>
                  <Select value={rainfallMonth} onValueChange={setRainfallMonth}>
                    <SelectTrigger id="rainfallMonth">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={index} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rainfallAmount">Precipitação (mm)</Label>
                  <Input
                    id="rainfallAmount"
                    type="number"
                    value={rainfallAmount}
                    onChange={(e) => setRainfallAmount(e.target.value)}
                    placeholder="Ex: 45.5"
                    step="0.1"
                    min="0"
                    required
                  />
                </div>

                <div className="flex items-end">
                  <Button type="submit" className="w-full" disabled={isSubmittingRainfall}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </form>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Histórico de Precipitação</h4>
              {sortedRainfallData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum dado de precipitação registrado
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sortedRainfallData.map((data, index) => (
                    <div
                      key={`${data.year}-${data.month}-${index}`}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {months[data.month - 1]} {data.year}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{data.rainfallMM} mm</span>
                        <CloudRain className="h-4 w-4 text-blue-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}