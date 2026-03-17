const fetchJSON = async <T>(url: string): Promise<T> => {
  const response = await fetch(url)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed: ${response.status}`)
  }
  return response.json()
}

export const deviceService = {
  fetchModels: () => fetchJSON<string[]>('/api/devices/models'),

  fetchVariants: (model: string) =>
    fetchJSON<string[]>(`/api/devices/variants?model=${encodeURIComponent(model)}`),

  fetchStorages: (model: string, variant: string | null) => {
    const params = new URLSearchParams({ model })
    if (variant) params.set('variant', variant)
    return fetchJSON<string[]>(`/api/devices/storages?${params.toString()}`)
  },

  fetchColors: (model: string, variant: string | null, storage: string | null) => {
    const params = new URLSearchParams({ model })
    if (variant) params.set('variant', variant)
    if (storage) params.set('storage', storage)
    return fetchJSON<string[]>(`/api/devices/colors?${params.toString()}`)
  },

  fetchDevice: (model: string, variant: string | null, storage: string, color: string) => {
    const params = new URLSearchParams({ model, storage, color })
    if (variant) params.set('variant', variant)
    return fetchJSON<any>(`/api/devices/device?${params.toString()}`)
  },
}
