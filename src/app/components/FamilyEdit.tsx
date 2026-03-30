import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useData } from '../context/DataContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Plus, Trash2, ArrowLeft, AlertCircle, Droplets } from 'lucide-react';
import { Person, Cistern } from '../types';
import { toast } from 'sonner';

export function FamilyEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { families, updateFamily } = useData();

  const family = families.find((f) => f.id === id);

  const [familyName, setFamilyName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [hasRainGutter, setHasRainGutter] = useState(false);
  const [rainCaptureEfficiency, setRainCaptureEfficiency] = useState('80');
  const [cisternCaptureArea, setCisternCaptureArea] = useState('50');
  const [members, setMembers] = useState<Person[]>([]);
  const [cisterns, setCisterns] = useState<Cistern[]>([]);

  useEffect(() => {
    if (family) {
      setFamilyName(family.name);
      setLatitude(family.coordinates.latitude.toString());
      setLongitude(family.coordinates.longitude.toString());
      setHasRainGutter(family.hasRainGutter);
      setRainCaptureEfficiency(family.rainCaptureEfficiency?.toString() || '80');
      setCisternCaptureArea(family.cisternCaptureArea?.toString() || '50');
      setMembers([...family.members]);
      setCisterns([...family.cisterns]);
    }
  }, [family]);

  if (!family) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Família não encontrada</h3>
            <Button onClick={() => navigate('/')}>Voltar para lista</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const addMember = () => {
    setMembers([
      ...members,
      { id: crypto.randomUUID(), name: '', age: 0, bedridden: false },
    ]);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof Person, value: any) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const addCistern = () => {
    setCisterns([
      ...cisterns,
      { id: crypto.randomUUID(), capacity: 0, currentVolume: 0 },
    ]);
  };

  const removeCistern = (index: number) => {
    if (cisterns.length > 1) {
      setCisterns(cisterns.filter((_, i) => i !== index));
    }
  };

  const updateCistern = (index: number, field: keyof Cistern, value: number) => {
    const updated = [...cisterns];
    updated[index] = { ...updated[index], [field]: value };
    setCisterns(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!familyName.trim()) {
      toast.error('Digite o nome da família');
      return;
    }

    if (!latitude || !longitude) {
      toast.error('Digite as coordenadas geográficas');
      return;
    }

    const validMembers = members.filter((m) => m.name.trim() && m.age > 0);
    if (validMembers.length === 0) {
      toast.error('Deve haver pelo menos um membro da família');
      return;
    }

    const validCisterns = cisterns.filter((c) => c.capacity > 0);
    if (validCisterns.length === 0) {
      toast.error('Deve haver pelo menos uma cisterna');
      return;
    }

    updateFamily(family.id, {
      name: familyName,
      hasRainGutter,
      rainCaptureEfficiency: hasRainGutter ? parseFloat(rainCaptureEfficiency) : undefined,
      cisternCaptureArea: hasRainGutter ? parseFloat(cisternCaptureArea) : undefined,
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      members: validMembers,
      cisterns: validCisterns,
    });

    toast.success('Dados atualizados com sucesso!');
    navigate(`/familia/${family.id}`);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate(`/familia/${family.id}`)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Editar Família</CardTitle>
          <CardDescription>Atualize os dados da família e seus membros</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados da Família */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados da Família</h3>

              <div className="space-y-2">
                <Label htmlFor="familyName">Nome da Família *</Label>
                <Input
                  id="familyName"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Ex: Família Silva"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="hasRainGutter"
                    checked={hasRainGutter}
                    onCheckedChange={setHasRainGutter}
                  />
                  <Label htmlFor="hasRainGutter">Possui sistema de captação por calhas</Label>
                </div>
              </div>

              {/* Campos de captação de chuva - aparecem apenas se hasRainGutter = true */}
              {hasRainGutter && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                  <h4 className="font-medium text-blue-900">Configurações de Captação de Chuva</h4>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="rainCaptureEfficiency">Eficiência de Captação (%)</Label>
                      <Input
                        id="rainCaptureEfficiency"
                        type="number"
                        value={rainCaptureEfficiency}
                        onChange={(e) => setRainCaptureEfficiency(e.target.value)}
                        placeholder="Ex: 80"
                        min="0"
                        max="100"
                      />
                      <p className="text-xs text-blue-700">
                        Porcentagem da chuva que é captada (padrão: 80%)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cisternCaptureArea">Área de Captação (m²)</Label>
                      <Input
                        id="cisternCaptureArea"
                        type="number"
                        value={cisternCaptureArea}
                        onChange={(e) => setCisternCaptureArea(e.target.value)}
                        placeholder="Ex: 50"
                        min="1"
                      />
                      <p className="text-xs text-blue-700">
                        Área do telhado/superfície de captação
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Ex: -8.0476"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Ex: -34.8770"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Membros da Família */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Membros da Família</h3>
                <Button type="button" variant="outline" size="sm" onClick={addMember}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Membro
                </Button>
              </div>

              {members.map((member, index) => (
                <Card key={member.id}>
                  <CardContent className="pt-6">
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`member-name-${index}`}>Nome *</Label>
                          <Input
                            id={`member-name-${index}`}
                            value={member.name}
                            onChange={(e) => updateMember(index, 'name', e.target.value)}
                            placeholder="Nome completo"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`member-age-${index}`}>Idade *</Label>
                          <Input
                            id={`member-age-${index}`}
                            type="number"
                            value={member.age || ''}
                            onChange={(e) =>
                              updateMember(index, 'age', parseInt(e.target.value) || 0)
                            }
                            placeholder="Idade"
                            min="0"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`member-bedridden-${index}`}
                            checked={member.bedridden}
                            onCheckedChange={(checked) =>
                              updateMember(index, 'bedridden', checked)
                            }
                          />
                          <Label htmlFor={`member-bedridden-${index}`}>Acamado</Label>
                        </div>

                        {members.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cisternas */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Cisternas
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={addCistern}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Cisterna
                </Button>
              </div>

              {cisterns.map((cistern, index) => (
                <div key={cistern.id} className="p-4 border rounded-lg space-y-4 bg-blue-50/50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Cisterna {index + 1}</h4>
                    {cisterns.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCistern(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`cistern-capacity-${index}`}>
                        Capacidade da Cisterna (litros) *
                      </Label>
                      <Input
                        id={`cistern-capacity-${index}`}
                        type="number"
                        value={cistern.capacity || ''}
                        onChange={(e) =>
                          updateCistern(index, 'capacity', parseFloat(e.target.value) || 0)
                        }
                        placeholder="Ex: 16000"
                        min="1"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`cistern-volume-${index}`}>
                        Volume Atual de Água (litros) *
                      </Label>
                      <Input
                        id={`cistern-volume-${index}`}
                        type="number"
                        value={cistern.currentVolume || ''}
                        onChange={(e) =>
                          updateCistern(index, 'currentVolume', parseFloat(e.target.value) || 0)
                        }
                        placeholder="Ex: 8000"
                        min="0"
                        max={cistern.capacity}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/familia/${family.id}`)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}