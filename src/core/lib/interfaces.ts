export type FormState = {
  username: string | null
  setUsername: (value: string | null) => void

  modelname: string
  setModel: (value: string) => void

  // telegram id
  telegramId: string | null
  setTelegramId: (id: string | null) => void

  // user photo url
  userPhotoUrl: string | null
  setUserPhotoUrl: (url: string | null) => void

  // comment
  comment: string
  setComment: (value: string) => void

  // imei
  imei: string | null
  setImei: (value: string | null) => void

  // answers
  answers: number[]
  setAnswers: (answers: number[]) => void

  // price
  price: number | null
  setPrice: (value: number | null) => void

  onNext?: () => Promise<void>
  setOnNext: (cb?: () => Promise<void>) => void

  showQuestionsSuccess: boolean
  setShowQuestionsSuccess: (v: boolean) => void
}

export interface SkupkaRequest {
  id: string
  telegramId: string | null
  modelname?: string
  photoUrls?: string[]
  status?: string
  comment?: string
  imei?: string
  answers?: number[]
  price?: number
  priceConfirmed?: boolean
  courierTelegramId?: string
  courierScheduledAt?: string
  courierTimeSlot?: string
  courierUserConfirmed?: boolean
  courierReminderSent?: boolean
  finalPrice?: number
  inspectionCompleted?: boolean
}

// Новые интерфейсы для проверки устройств
export interface DeviceTest {
  id: string
  name: string
  description: string
  type: 'checkbox' | 'radio' | 'color' | 'input'
  options?: string[]
  required: boolean
  value?: any
}

export interface TestResult {
  testId: string
  passed: boolean
  value: any
  notes?: string
}

export interface DeviceInspection {
  id: string
  skupkaId: string
  masterUsername: string
  inspectionToken: string
  tokenExpiresAt: string
  testsResults: TestResult[]
  finalPrice?: number
  inspectionNotes?: string
  completedAt?: string
  createdAt: string
}

export interface InspectionFormData {
  masterUsername: string
  inspectionToken?: string
  testsResults: TestResult[]
  inspectionNotes?: string
}
