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

  // serial number
  serialNumber: string | null
  setSerialNumber: (value: string | null) => void

  // price
  price: number | null
  setPrice: (value: number | null) => void

  onNext?: () => Promise<void>
  setOnNext: (cb?: () => Promise<void>) => void

  showQuestionsSuccess: boolean
  setShowQuestionsSuccess: (v: boolean) => void

  // Состояния устройства (объединённые)
  deviceConditions: {
    front: string | null
    back: string | null
    side: string | null
    faceId?: string | null
    touchId?: string | null
    backCamera?: string | null
    battery?: string | null
  }
  setDeviceConditions: (conditions: {
    front?: string | null
    back?: string | null
    side?: string | null
    faceId?: string | null
    touchId?: string | null
    backCamera?: string | null
    battery?: string | null
  }) => void

  // Сброс всех состояний
  resetAllStates: () => void

  // Загрузка сохраненных данных из БД
  loadSavedData: (telegramId: string) => Promise<void>

  // Отладочная информация
  debugInfo: string[]
  addDebugInfo: (message: string) => void
}

export interface SkupkaRequest {
  id: string
  telegramId: string
  username: string
  modelname?: string
  status?: string
  comment?: string
  imei?: string
  sn?: string
  price?: number
  finalPrice?: number
  priceAgreed?: boolean
  damagePercent?: number

  // Медиа
  photoUrls?: string[]
  videoUrls?: string[]

  // Данные и аналитика
  deviceData?: any
  aiAnalysis?: any
  priceRange?: any
  aiModelUsed?: string
  analysisConfidence?: number
  chatHistory?: any
  deviceConditions?: any
  additionalConditions?: any

  // Логистика
  deliveryMethod?: string
  pickupPoint?: string
  courier?: any
  courierReminderSent?: boolean
  courierUserConfirmed?: boolean

  // Статусы / метаданные
  currentStep?: string
  inspection?: any
  inspectionCompleted?: boolean
  inspectionToken?: string
  submittedAt?: string
  createdAt: string
  updatedAt: string
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
