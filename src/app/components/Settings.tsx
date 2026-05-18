import React, {useState} from 'react';
import {useNavigate} from 'react-router';
import {useData} from '../context/DataContext';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Label} from './ui/label';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from './ui/card';
import {ArrowLeft, Droplets} from 'lucide-react';
import {toast} from 'sonner';

export function Settings() {
  const navigate = useNavigate();
  const { settings,  updateSettings } = useData();
  const [isSubmittingSettings, setIsSubmittingSettings] = useState(false);

  const [dailyConsumption, setDailyConsumption] = useState(
    settings?.dailyWaterConsumption?.toString() || '50'
  );

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
      </div>
    </div>
  );
}