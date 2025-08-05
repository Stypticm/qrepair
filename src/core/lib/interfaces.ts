export type FormState = {
  username: string | null
  setUsername: (value: string | null) => void

  modelname: string
  setModel: (value: string) => void

  condition: ConditionStatus[]
  setCondition: (value: ConditionStatus[]) => void

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

  onNext?: () => Promise<void>
  setOnNext: (cb?: () => Promise<void>) => void
}

export interface SkupkaRequest {
  id: number
  telegramId: string | null
  modelname?: string
  condition?: ConditionStatus[]
  photoUrls?: string[]
  videoUrl?: string
  status?: string
  comment?: string
  imei?: string
  contractUrl?: string
}

export type ConditionStatus =
  | 'display'
  | 'display_with_damage'
  | 'body'
  | 'body_with_damage'
