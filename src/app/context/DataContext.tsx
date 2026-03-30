import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Family, Settings, RainfallData, WaterDelivery, Person } from '../types';

interface DataContextType {
  families: Family[];
  settings: Settings;
  addFamily: (family: Omit<Family, 'id' | 'createdAt'>) => void;
  updateFamily: (id: string, family: Partial<Family>) => void;
  deleteFamily: (id: string) => void;
  addWaterDelivery: (familyId: string, delivery: Omit<WaterDelivery, 'id'>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  addRainfallData: (data: RainfallData) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultSettings: Settings = {
  dailyConsumptionPerPerson: 50, // Recomendação ONU
  rainfallData: [],
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [families, setFamilies] = useState<Family[]>(() => {
    const stored = localStorage.getItem('water-families');
    return stored ? JSON.parse(stored) : [];
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem('water-settings');
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('water-families', JSON.stringify(families));
  }, [families]);

  useEffect(() => {
    localStorage.setItem('water-settings', JSON.stringify(settings));
  }, [settings]);

  const addFamily = (family: Omit<Family, 'id' | 'createdAt'>) => {
    const newFamily: Family = {
      ...family,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setFamilies((prev) => [...prev, newFamily]);
  };

  const updateFamily = (id: string, updates: Partial<Family>) => {
    setFamilies((prev) =>
      prev.map((family) => (family.id === id ? { ...family, ...updates } : family))
    );
  };

  const deleteFamily = (id: string) => {
    setFamilies((prev) => prev.filter((family) => family.id !== id));
  };

  const addWaterDelivery = (familyId: string, delivery: Omit<WaterDelivery, 'id'>) => {
    const newDelivery: WaterDelivery = {
      ...delivery,
      id: crypto.randomUUID(),
      // Garantir compatibilidade: se volumeSent não foi fornecido, usar volumeDelivered
      volumeSent: delivery.volumeSent ?? delivery.volumeDelivered,
    };
    
    setFamilies((prev) =>
      prev.map((family) =>
        family.id === familyId
          ? { ...family, deliveries: [...family.deliveries, newDelivery] }
          : family
      )
    );
  };

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const addRainfallData = (data: RainfallData) => {
    setSettings((prev) => {
      const existingIndex = prev.rainfallData.findIndex(
        (rd) => rd.year === data.year && rd.month === data.month
      );
      
      const newRainfallData = [...prev.rainfallData];
      if (existingIndex >= 0) {
        newRainfallData[existingIndex] = data;
      } else {
        newRainfallData.push(data);
      }
      
      return { ...prev, rainfallData: newRainfallData };
    });
  };

  return (
    <DataContext.Provider
      value={{
        families,
        settings,
        addFamily,
        updateFamily,
        deleteFamily,
        addWaterDelivery,
        updateSettings,
        addRainfallData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}