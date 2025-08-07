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

export const takeRequest = async (id: string) => {
  const res = await fetch(`/api/takeRequest/${id}`, {
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

export const completeRequest = async (id: string) => {
  const res = await fetch(`/api/completeRequest/${id}`, {
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

export const checkRequest = async (id: string) => {
  const res = await fetch(`/api/checkRequest/${id}`, {
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

export const payRequest = async (id: string) => {
  const res = await fetch(`/api/payRequest/${id}`, {
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
