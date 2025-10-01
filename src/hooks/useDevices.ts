import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

// Define the interface for a single device variant
export interface Device {
  id: number;
  model: string;
  variant: string;
  storage: string;
  color: string;
  basePrice: number;
}

// Fetch function to get all devices
const fetchAllDevices = async (): Promise<Device[]> => {
  const response = await fetch('/api/devices/all');
  if (!response.ok) {
    throw new Error('Failed to fetch devices');
  }
  const data = await response.json();
  return data.devices; // Return the 'devices' property from the response
};

export const useDevices = () => {
  const [selectedOptions, setSelectedOptions] = useState<{
    model: string | null;
    variant: string | null;
    storage: string | null;
    color: string | null;
  }>({ model: null, variant: null, storage: null, color: null });

  // Fetch all devices once and cache them indefinitely
  const { data: allDevices = [], isLoading, error } = useQuery<Device[]>({ 
    queryKey: ['allDevices'], 
    queryFn: fetchAllDevices, 
    staleTime: Infinity 
  });

  // Memoize derived lists to prevent re-computation on every render
  const models = useMemo(() => {
    return [...new Set(allDevices.map(d => d.model))].sort();
  }, [allDevices]);

  const variants = useMemo(() => {
    if (!selectedOptions.model) return [];
    return [...new Set(allDevices.filter(d => d.model === selectedOptions.model).map(d => d.variant))].sort();
  }, [allDevices, selectedOptions.model]);

  const storages = useMemo(() => {
    if (!selectedOptions.model || !selectedOptions.variant) return [];
    return [...new Set(allDevices.filter(d => d.model === selectedOptions.model && d.variant === selectedOptions.variant).map(d => d.storage))].sort((a, b) => parseInt(a) - parseInt(b));
  }, [allDevices, selectedOptions.model, selectedOptions.variant]);

  const colors = useMemo(() => {
    if (!selectedOptions.model || !selectedOptions.variant || !selectedOptions.storage) return [];
    return [...new Set(allDevices.filter(d => d.model === selectedOptions.model && d.variant === selectedOptions.variant && d.storage === selectedOptions.storage).map(d => d.color))];
  }, [allDevices, selectedOptions.model, selectedOptions.variant, selectedOptions.storage]);

  const selectedDevice = useMemo(() => {
    if (!selectedOptions.model || !selectedOptions.variant || !selectedOptions.storage || !selectedOptions.color) return null;
    return allDevices.find(d => 
      d.model === selectedOptions.model &&
      d.variant === selectedOptions.variant &&
      d.storage === selectedOptions.storage &&
      d.color === selectedOptions.color
    ) || null;
  }, [allDevices, selectedOptions]);

  const handleOptionSelect = (type: keyof typeof selectedOptions, value: string) => {
    setSelectedOptions(prev => {
      const newOptions = { ...prev, [type]: value };
      // Reset dependent options
      if (type === 'model') {
        newOptions.variant = null;
        newOptions.storage = null;
        newOptions.color = null;
      } else if (type === 'variant') {
        newOptions.storage = null;
        newOptions.color = null;
      } else if (type === 'storage') {
        newOptions.color = null;
      }
      return newOptions;
    });
  };

  return {
    // Data
    models,
    variants,
    storages,
    colors,
    selectedDevice,
    // State
    selectedOptions,
    // Actions
    handleOptionSelect,
    // Status
    isLoading,
    error,
  };
};