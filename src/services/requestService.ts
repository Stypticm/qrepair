export const requestService = {
  saveDraft: async (data: {
    telegramId: string
    requestId: string | null
    modelname: string
    deviceConditions: any
    wearValues: any
    imei: string | null
    sn: string | null
    price: number | null
    priceRange: any
    currentStep: string
  }) => {
    const response = await fetch('/api/request/saveDraft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to save draft')
    }

    return response.json()
  },

  getDraft: async () => {
    const response = await fetch('/api/request/getDraft', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch draft')
    }

    return response.json()
  },
}
