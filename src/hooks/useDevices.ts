import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

type DeviceResponse = {
  id: number;
  model: string;
  variant: string;
  storage: string;
  color: string;
  basePrice: number;
};

const fetchJSON = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }
  return response.json();
};

const fetchModels = () => fetchJSON<string[]>('/api/devices/models');

const fetchVariants = (model: string) =>
  fetchJSON<string[]>(`/api/devices/variants?model=${encodeURIComponent(model)}`);

const fetchStorages = (model: string, variant: string | null) => {
  const params = new URLSearchParams({ model });
  if (variant !== null && variant !== undefined) {
    params.set('variant', variant);
  }
  return fetchJSON<string[]>(`/api/devices/storages?${params.toString()}`);
};

const fetchColors = (
  model: string,
  variant: string | null,
  storage: string | null
) => {
  const params = new URLSearchParams({ model });
  if (variant !== null && variant !== undefined) {
    params.set('variant', variant);
  }
  if (storage) {
    params.set('storage', storage);
  }
  return fetchJSON<string[]>(`/api/devices/colors?${params.toString()}`);
};

const fetchDevice = (
  model: string,
  variant: string | null,
  storage: string,
  color: string
) => {
  const params = new URLSearchParams({
    model,
    storage,
    color,
  });
  if (variant !== null && variant !== undefined) {
    params.set('variant', variant);
  }
  return fetchJSON<DeviceResponse>(`/api/devices/device?${params.toString()}`);
};

export const useDevices = () => {
  const [selectedOptions, setSelectedOptions] = useState<{
    model: string | null;
    variant: string | null;
    storage: string | null;
    color: string | null;
  }>({ model: null, variant: null, storage: null, color: null });

  const modelsQuery = useQuery<string[]>({
    queryKey: ['device-models'],
    queryFn: fetchModels,
    staleTime: Infinity,
  });

  const variantsQuery = useQuery<string[]>({
    queryKey: ['device-variants', selectedOptions.model],
    queryFn: () => fetchVariants(selectedOptions.model as string),
    enabled: Boolean(selectedOptions.model),
    staleTime: Infinity,
  });

  const storagesQuery = useQuery<string[]>({
    queryKey: [
      'device-storages',
      selectedOptions.model,
      selectedOptions.variant ?? '',
    ],
    queryFn: () =>
      fetchStorages(
        selectedOptions.model as string,
        selectedOptions.variant
      ),
    enabled: Boolean(selectedOptions.model),
    staleTime: Infinity,
  });

  const colorsQuery = useQuery<string[]>({
    queryKey: [
      'device-colors',
      selectedOptions.model,
      selectedOptions.variant ?? '',
      selectedOptions.storage ?? '',
    ],
    queryFn: () =>
      fetchColors(
        selectedOptions.model as string,
        selectedOptions.variant,
        selectedOptions.storage
      ),
    enabled: Boolean(
      selectedOptions.model && selectedOptions.storage
    ),
    staleTime: Infinity,
  });

  const deviceQuery = useQuery<DeviceResponse>({
    queryKey: [
      'device-detail',
      selectedOptions.model,
      selectedOptions.variant ?? '',
      selectedOptions.storage ?? '',
      selectedOptions.color ?? '',
    ],
    queryFn: () =>
      fetchDevice(
        selectedOptions.model as string,
        selectedOptions.variant,
        selectedOptions.storage as string,
        selectedOptions.color as string
      ),
    enabled: Boolean(
      selectedOptions.model &&
        selectedOptions.storage &&
        selectedOptions.color
    ),
    staleTime: Infinity,
  });

  useEffect(() => {
    const variantList = variantsQuery.data ?? [];
    if (!selectedOptions.model) return;

    if (
      selectedOptions.variant &&
      !variantList.includes(selectedOptions.variant)
    ) {
      setSelectedOptions((prev) => ({
        ...prev,
        variant: variantList[0] ?? null,
        storage: null,
        color: null,
      }));
      return;
    }

    if (
      !selectedOptions.variant &&
      variantList.length === 1
    ) {
      setSelectedOptions((prev) => ({
        ...prev,
        variant: variantList[0] ?? null,
      }));
    }
  }, [selectedOptions.model, selectedOptions.variant, variantsQuery.data]);

  useEffect(() => {
    const storageList = storagesQuery.data ?? [];
    if (!selectedOptions.model) return;

    if (
      selectedOptions.storage &&
      !storageList.includes(selectedOptions.storage)
    ) {
      setSelectedOptions((prev) => ({
        ...prev,
        storage: storageList[0] ?? null,
        color: null,
      }));
      return;
    }

    if (
      !selectedOptions.storage &&
      storageList.length === 1
    ) {
      setSelectedOptions((prev) => ({
        ...prev,
        storage: storageList[0] ?? null,
      }));
    }
  }, [
    selectedOptions.model,
    selectedOptions.variant,
    selectedOptions.storage,
    storagesQuery.data,
  ]);

  useEffect(() => {
    const colorList = colorsQuery.data ?? [];
    if (!selectedOptions.model || !selectedOptions.storage) return;

    if (
      selectedOptions.color &&
      !colorList.includes(selectedOptions.color)
    ) {
      setSelectedOptions((prev) => ({
        ...prev,
        color: colorList[0] ?? null,
      }));
      return;
    }

    if (!selectedOptions.color && colorList.length === 1) {
      setSelectedOptions((prev) => ({
        ...prev,
        color: colorList[0] ?? null,
      }));
    }
  }, [
    selectedOptions.model,
    selectedOptions.variant,
    selectedOptions.storage,
    selectedOptions.color,
    colorsQuery.data,
  ]);

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
    models: modelsQuery.data ?? [],
    variants: variantsQuery.data ?? [],
    storages: storagesQuery.data ?? [],
    colors: colorsQuery.data ?? [],
    selectedDevice: deviceQuery.data ?? null,
    // State
    selectedOptions,
    // Actions
    handleOptionSelect,
    // Status
    isLoading:
      modelsQuery.isLoading ||
      variantsQuery.isLoading ||
      storagesQuery.isLoading ||
      colorsQuery.isLoading ||
      deviceQuery.isLoading,
    error:
      modelsQuery.error ||
      variantsQuery.error ||
      storagesQuery.error ||
      colorsQuery.error ||
      deviceQuery.error,
  };
};
