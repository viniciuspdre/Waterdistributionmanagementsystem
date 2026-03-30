// Tipos do sistema de gerenciamento de água

export interface Person {
  id: string;
  name: string;
  age: number;
  bedridden: boolean; // acamado
}

export interface Cistern {
  id: string;
  capacity: number; // capacidade em litros
  currentVolume: number; // volume atual em litros
}

export interface WaterDelivery {
  id: string;
  date: string; // ISO date string
  volumeDelivered: number; // litros efetivamente entregues
  volumeSent: number; // litros enviados/disponibilizados
}

export interface Family {
  id: string;
  name: string;
  cisterns: Cistern[]; // array de cisternas
  hasRainGutter: boolean; // sistema de captação por calhas
  rainCaptureEfficiency?: number; // porcentagem (0-100) - apenas se hasRainGutter = true
  cisternCaptureArea?: number; // m² área de captação - apenas se hasRainGutter = true
  coordinates: {
    latitude: number;
    longitude: number;
  };
  members: Person[];
  deliveries: WaterDelivery[];
  createdAt: string;
}

export interface RainfallData {
  year: number;
  month: number;
  precipitation: number; // mm
}

export interface Settings {
  dailyConsumptionPerPerson: number; // litros
  rainfallData: RainfallData[];
}