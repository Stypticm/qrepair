export type FormState = {
  username: string | null
  brandname: string | null
  modelname: string
  brandModelText: string
  setBrand: (value: string | null) => void
  setModel: (value: string) => void
  setBrandModelText: (value: string) => void
  setUsername: (value: string | null) => void

  // crash info
  crash: string[]
  crashDescription: string
  setCrash: (value: string[]) => void
  setCrashDescription: (value: string) => void

  // uploaded photo
  photoUrls: string[]
  setPhotoUrls: (files: string[]) => void

  // telegram id
  telegramId: string | null
  setTelegramId: (id: string | null) => void

  onNext?: () => Promise<void>
  setOnNext: (cb?: () => Promise<void>) => void
}

export interface RepairRequest {
  id: number
  telegramId: string | null
  brandname?: string | null
  modelname?: string
  brandModelText?: string
  crash?: string[]
  crashDescription?: string
  photoUrls?: string[]
  status?: string
}
