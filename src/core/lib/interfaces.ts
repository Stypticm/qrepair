export type FormState = {
  username: string | null
  setUsername: (value: string | null) => void

  modelname: string
  setModel: (value: string) => void

  // uploaded photo
  photoUrls: (string | null)[]
  setPhotoUrls: (files: (string | null)[]) => void

  // uploaded video
  videoUrl: string | null
  setVideoUrl: (url: string | null) => void

  // telegram id
  telegramId: string | null
  setTelegramId: (id: string | null) => void

  // user photo url
  userPhotoUrl: string | null
  setUserPhotoUrl: (url: string | null) => void

  // comment
  comment: string
  setComment: (value: string) => void

  // contract url
  contractUrl: string | null
  setContractUrl: (url: string | null) => void

  // imei
  imei: string | null
  setImei: (imei: string | null) => void

  // answers
  answers: number[]
  setAnswers: (answers: number[]) => void

  // price
  price: number | null
  setPrice: (price: number | null) => void

  onNext?: () => Promise<void>
  setOnNext: (cb?: () => Promise<void>) => void
}

export interface SkupkaRequest {
  id: number
  telegramId: string | null
  modelname?: string
  photoUrls?: string[]
  videoUrl?: string
  status?: string
  comment?: string
  imei?: string
  contractUrl?: string
  answers?: number[]
  price?: number
}
