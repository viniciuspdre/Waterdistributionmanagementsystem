import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../context/DataContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Users, Droplets, MapPin, Plus, AlertCircle, Calendar, Search, ArrowUpDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { calculateCurrentWaterLevel, calculateNextDeliveryDate } from '../utils/waterCalculations';

export function FamilyList() {
  const navigate = useNavigate();
  const { families, settings } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'urgency' | 'name' | 'level-asc' | 'level-desc'>('urgency');

  const getFamilyStatus = (familyId: string) => {
    const family = families.find((f) => f.id === familyId);
    if (!family) return null;

    const { percentageFull } = calculateCurrentWaterLevel(family, settings);
    const { shouldDeliver } = calculateNextDeliveryDate(family, settings);

    if (shouldDeliver || percentageFull < 20) {
      return { label: 'Urgente', variant: 'destructive' as const };
    } else if (percentageFull < 50) {
      return { label: 'Atenção', variant: 'default' as const };
    }
    return { label: 'Normal', variant: 'secondary' as const };
  };

  const filteredAndSortedFamilies = useMemo(() => {
    // Filtrar por nome
    let filtered = families.filter((family) =>
      family.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Ordenar
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === 'level-asc' || sortBy === 'level-desc') {
        const levelA = calculateCurrentWaterLevel(a, settings).percentageFull;
        const levelB = calculateCurrentWaterLevel(b, settings).percentageFull;
        return sortBy === 'level-asc' ? levelA - levelB : levelB - levelA;
      }

      // Ordenação por urgência (padrão)
      const statusA = getFamilyStatus(a.id);
      const statusB = getFamilyStatus(b.id);

      if (statusA?.variant === 'destructive' && statusB?.variant !== 'destructive') return -1;
      if (statusA?.variant !== 'destructive' && statusB?.variant === 'destructive') return 1;

      return a.name.localeCompare(b.name);
    });

    return sorted;
  }, [families, searchTerm, sortBy, settings]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciamento de Água</h1>
          <p className="text-muted-foreground">
            Sistema de distribuição de água para famílias com cisternas
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/configuracoes')}>
            Configurações
          </Button>
          <Button onClick={() => navigate('/nova-familia')}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Família
          </Button>
        </div>
      </div>

      {families.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <Droplets className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma família cadastrada</h3>
            <p className="text-muted-foreground mb-6">
              Comece cadastrando a primeira família no sistema
            </p>
            <Button onClick={() => navigate('/nova-familia')}>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Primeira Família
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Barra de Filtros */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar família por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2 sm:w-64">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgency">Urgência</SelectItem>
                  <SelectItem value="name">Nome (A-Z)</SelectItem>
                  <SelectItem value="level-desc">Nível (Maior)</SelectItem>
                  <SelectItem value="level-asc">Nível (Menor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contador de resultados */}
          {searchTerm && (
            <div className="mb-4 text-sm text-muted-foreground">
              {filteredAndSortedFamilies.length === 0 ? (
                'Nenhuma família encontrada'
              ) : filteredAndSortedFamilies.length === 1 ? (
                '1 família encontrada'
              ) : (
                `${filteredAndSortedFamilies.length} famílias encontradas`
              )}
            </div>
          )}

          {/* Grid de Famílias */}
          {filteredAndSortedFamilies.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma família encontrada</h3>
                <p className="text-muted-foreground mb-6">
                  Tente ajustar os filtros de busca
                </p>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Limpar Busca
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedFamilies.map((family) => {
                const status = getFamilyStatus(family.id);
                const { percentageFull, daysUntilEmpty } = calculateCurrentWaterLevel(
                  family,
                  settings
                );
                const { daysUntilDelivery } = calculateNextDeliveryDate(family, settings);

                // Verificar se a entrega está próxima (7 dias ou menos)
                const deliverySoon = daysUntilDelivery > 0 && daysUntilDelivery <= 7 && daysUntilEmpty > 3;

                return (
                  <Card
                    key={family.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/familia/${family.id}`)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl">{family.name}</CardTitle>
                        {status && <Badge variant={status.variant}>{status.label}</Badge>}
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {family.coordinates.latitude.toFixed(4)},{' '}
                        {family.coordinates.longitude.toFixed(4)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{family.members.length} pessoas</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <p className="text-xs text-muted-foreground">Capacidade</p>
                            <div className="flex items-center gap-2 text-sm">
                              <Droplets className="h-4 w-4 text-muted-foreground" />
                              <span>{family.cisterns.reduce((sum, c) => sum + c.capacity, 0)}L</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Nível da cisterna</span>
                            <span className="font-medium">{percentageFull}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                percentageFull < 20
                                  ? 'bg-red-500'
                                  : percentageFull < 50
                                  ? 'bg-yellow-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(100, percentageFull)}%` }}
                            />
                          </div>
                        </div>

                        {daysUntilEmpty <= 7 && daysUntilEmpty > 0 && (
                          <div className="flex items-center gap-2 text-sm text-orange-600">
                            <AlertCircle className="h-4 w-4" />
                            <span>{daysUntilEmpty} dias restantes</span>
                          </div>
                        )}

                        {deliverySoon && (
                          <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-700 font-medium">
                              Entrega em {daysUntilDelivery} {daysUntilDelivery === 1 ? 'dia' : 'dias'}
                            </span>
                          </div>
                        )}

                        {family.hasRainGutter && (
                          <Badge variant="outline" className="text-xs">
                            Sistema de captação
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}