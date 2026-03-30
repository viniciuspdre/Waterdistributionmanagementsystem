import { Family, Settings, RainfallData } from '../types';

/**
 * Calcula o consumo diário de água de uma família
 */
export function calculateDailyConsumption(
  numberOfPeople: number,
  dailyConsumptionPerPerson: number
): number {
  return numberOfPeople * dailyConsumptionPerPerson;
}

/**
 * Calcula quanto de água foi captado pela chuva em um período
 */
export function calculateRainWaterCaptured(
  rainfallMm: number,
  captureAreaM2: number,
  efficiency: number
): number {
  // 1mm de chuva em 1m² = 1 litro
  // Aplicar eficiência de captação
  return rainfallMm * captureAreaM2 * (efficiency / 100);
}

/**
 * Obtém dados de precipitação para um período
 */
export function getRainfallForPeriod(
  rainfallData: RainfallData[],
  startDate: Date,
  endDate: Date
): number {
  let totalRainfall = 0;

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const data = rainfallData.find((rd) => rd.year === year && rd.month === month);
    if (data) {
      totalRainfall += data.precipitation;
    }

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return totalRainfall;
}

/**
 * Calcula o nível atual da cisterna
 */
export function calculateCurrentWaterLevel(
  family: Family,
  settings: Settings,
  currentDate: Date = new Date()
): {
  currentLevel: number;
  daysUntilEmpty: number;
  percentageFull: number;
} {
  // Calcular capacidade total e volume atual de todas as cisternas
  const totalCapacity = family.cisterns.reduce((sum, c) => sum + c.capacity, 0);
  let totalCurrentVolume = family.cisterns.reduce((sum, c) => sum + c.currentVolume, 0);

  const dailyConsumption = calculateDailyConsumption(
    family.members.length,
    settings.dailyConsumptionPerPerson
  );

  // Pegar a última entrega
  const sortedDeliveries = [...family.deliveries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let currentLevel = totalCurrentVolume;
  let lastDeliveryDate = new Date(currentDate);

  if (sortedDeliveries.length > 0) {
    const lastDelivery = sortedDeliveries[0];
    lastDeliveryDate = new Date(lastDelivery.date);

    // Calcular dias desde a última entrega
    const daysSinceDelivery = Math.floor(
      (currentDate.getTime() - lastDeliveryDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Subtrair consumo diário
    currentLevel -= daysSinceDelivery * dailyConsumption;

    // Se tem sistema de captação de chuva, adicionar água captada
    if (family.hasRainGutter && family.cisternCaptureArea && family.rainCaptureEfficiency) {
      const rainfallMm = getRainfallForPeriod(
        settings.rainfallData,
        lastDeliveryDate,
        currentDate
      );
      const capturedWater = calculateRainWaterCaptured(
        rainfallMm,
        family.cisternCaptureArea,
        family.rainCaptureEfficiency
      );
      currentLevel += capturedWater;
    }
  }

  // Garantir que não seja negativo nem exceda a capacidade total
  currentLevel = Math.max(0, Math.min(currentLevel, totalCapacity));

  const daysUntilEmpty = dailyConsumption > 0 ? Math.floor(currentLevel / dailyConsumption) : 0;
  const percentageFull = totalCapacity > 0 ? (currentLevel / totalCapacity) * 100 : 0;

  return {
    currentLevel: Math.round(currentLevel),
    daysUntilEmpty,
    percentageFull: Math.round(percentageFull),
  };
}

/**
 * Calcula a próxima data prevista para entrega de água
 */
export function calculateNextDeliveryDate(
  family: Family,
  settings: Settings,
  currentDate: Date = new Date()
): {
  nextDeliveryDate: Date | null;
  daysUntilDelivery: number;
  shouldDeliver: boolean;
} {
  const { currentLevel, daysUntilEmpty } = calculateCurrentWaterLevel(
    family,
    settings,
    currentDate
  );

  // Calcular capacidade total de todas as cisternas
  const totalCapacity = family.cisterns.reduce((sum, c) => sum + c.capacity, 0);

  // Se a cisterna estiver vazia ou com menos de 20% ou menos de 3 dias, precisa entregar já
  const shouldDeliver = currentLevel < totalCapacity * 0.2 || daysUntilEmpty <= 3;

  // Próxima entrega quando restar 20% ou 3 dias de água
  const deliveryThresholdDays = Math.max(3, daysUntilEmpty - 3);

  const nextDeliveryDate = new Date(currentDate);
  nextDeliveryDate.setDate(nextDeliveryDate.getDate() + deliveryThresholdDays);

  return {
    nextDeliveryDate: daysUntilEmpty > 0 ? nextDeliveryDate : null,
    daysUntilDelivery: deliveryThresholdDays,
    shouldDeliver,
  };
}

/**
 * Formata data para exibição
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formata volume de água
 */
export function formatVolume(liters: number): string {
  return `${liters.toLocaleString('pt-BR')} L`;
}