import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deviceService } from '../deviceService'

describe('deviceService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('fetchModels should call correct URL', async () => {
    const mockResponse = ['11', '12', '16', '17']
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await deviceService.fetchModels()
    expect(fetch).toHaveBeenCalledWith('/api/devices/models')
    expect(result).toEqual(mockResponse)
  })

  it('fetchVariants should encode model name', async () => {
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    await deviceService.fetchVariants('14 Pro')
    expect(fetch).toHaveBeenCalledWith('/api/devices/variants?model=14%20Pro')
  })

  it('fetchStorages should include variant if provided', async () => {
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    await deviceService.fetchStorages('13', 'mini')
    expect(fetch).toHaveBeenCalledWith('/api/devices/storages?model=13&variant=mini')
  })

  it('fetchColors should include all params', async () => {
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    await deviceService.fetchColors('15', 'Pro', '128GB')
    expect(fetch).toHaveBeenCalledWith('/api/devices/colors?model=15&variant=Pro&storage=128GB')
  })

  it('fetchDevice should call correct URL', async () => {
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    })

    await deviceService.fetchDevice('XR', null, '64GB', 'Bl')
    expect(fetch).toHaveBeenCalledWith('/api/devices/device?model=XR&storage=64GB&color=Bl')
  })
})
