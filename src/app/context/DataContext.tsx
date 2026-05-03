import React, {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import {FamilyDTO, MonthlyRainfallDTO, SystemSettingsDTO, WaterDeliveryDTO} from '../types';
import {familyService} from '../services/familyService';
import {systemSettingsService} from '../services/systemSettingsService';
import {waterDeliveryService} from '../services/waterDeliveryService';

interface DataContextType {
    families: FamilyDTO[];
    settings: SystemSettingsDTO;
    rainfallData: MonthlyRainfallDTO[];
    loadingFamilies: boolean;
    fetchFamilies: () => Promise<void>;
    addFamily: (family: FamilyDTO) => Promise<void>;
    updateFamily: (id: number, family: FamilyDTO) => Promise<void>;
    deleteFamilyDataLocally: (id: number) => void;
    addWaterDelivery: (delivery: WaterDeliveryDTO) => Promise<void>;
    updateSettings: (settings: SystemSettingsDTO) => Promise<void>;
    addRainfallData: (data: MonthlyRainfallDTO) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultSettings: SystemSettingsDTO = {
    dailyWaterConsumption: 50, // Fallback se a API falhar
};

export function DataProvider({children}: { children: ReactNode }) {
    const [families, setFamilies] = useState<FamilyDTO[]>([]);
    const [settings, setSettings] = useState<SystemSettingsDTO>(defaultSettings);
    const [rainfallData, setRainfallData] = useState<MonthlyRainfallDTO[]>([]);
    const [loadingFamilies, setLoadingFamilies] = useState(false);

    const fetchFamilies = useCallback(async () => {
        setLoadingFamilies(true);
        try {
            const response = await familyService.findAllFamilies({size: 100, page: 0}); // Carregando mais para evitar paginação nos hooks iniciais
            setFamilies(response.content || []);
        } catch (error) {
            console.error('Failed to load families:', error);
        } finally {
            setLoadingFamilies(false);
        }
    }, []);

    const fetchSettings = useCallback(async () => {
        try {
            const response = await systemSettingsService.findSystemSettings();
            if (response) {
                setSettings(response);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    }, []);


    useEffect(() => {
        // Como a API usa AuthContext e precisa do Bearer token, podemos disparar carregar os dados se tivermos o token
        const token = localStorage.getItem('hf_token');
        if (token) {
            fetchFamilies();
            fetchSettings();
        }
    }, [fetchFamilies, fetchSettings]);

    const addFamily = async (family: FamilyDTO) => {
        const created = await familyService.createFamily(family);
        setFamilies((prev) => [...prev, created]);
    };

    const updateFamily = async (id: number, updates: FamilyDTO) => {
        const updated = await familyService.updateFamily(id, updates);
        setFamilies((prev) => prev.map((f) => (f.id === id ? updated : f)));
    };

    const deleteFamilyDataLocally = (id: number) => {
        setFamilies((prev) => prev.filter((family) => family.id !== id));
    };

    const addWaterDelivery = async (delivery: WaterDeliveryDTO) => {
        await waterDeliveryService.save(delivery);
        // Para atualizar a lista geral ou a UI da família, refaz a busca
        await fetchFamilies();
    };

    const updateSettings = async (updates: SystemSettingsDTO) => {
        const updated = await systemSettingsService.updateSystemSettings(updates);
        setSettings(updated);
    };


    return (
        <DataContext.Provider
            value={{
                families,
                settings,
                rainfallData,
                loadingFamilies,
                fetchFamilies,
                addFamily,
                updateFamily,
                deleteFamilyDataLocally,
                addWaterDelivery,
                updateSettings,
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