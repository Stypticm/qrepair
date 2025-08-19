export const fetchApplication = async (id: string) => {
  const res = await fetch(`/api/requestById/${id}`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(
      errorData.error || 'Не удалось загрузить заявку'
    )
  }
  const data = await res.json()
  return data
}

export const acceptRequest = async (
  id: string,
  price?: number | null
) => {
  const res = await fetch(`/api/acceptRequest/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      price !== undefined ? { price } : {}
    ),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(
      errorData.error || 'Не удалось обновить статус заявки'
    )
  }
  const data = await res.json()
  return data.application
}

export const reviewRequest = async (
  id: string,
  price?: number | null
) => {
  const res = await fetch(`/api/reviewRequest/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      price !== undefined ? { price } : {}
    ),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(
      errorData.error || 'Не удалось обновить статус заявки'
    )
  }
  const data = await res.json()
  return data.application
}

export const courierReceived = async (id: string) => {
  const res = await fetch(`/api/courierReceived/${id}`, {
    method: 'PATCH',
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(
      errorData.error || 'Не удалось обновить статус заявки'
    )
  }
  const data = await res.json()
  return data.application
}

export const markPaid = async (id: string) => {
  const res = await fetch(`/api/markPaid/${id}`, {
    method: 'PATCH',
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(
      errorData.error || 'Не удалось обновить статус заявки'
    )
  }
  const data = await res.json()
  return data.application
}
