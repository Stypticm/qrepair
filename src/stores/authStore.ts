import { create } from 'zustand'
import { shallow } from 'zustand/shallow'

interface FormData {
  sn: string
  model: string
  pointId: number
  requestId: string
}

interface DeviceConditions {
  front: string | null
  back: string | null
  side: string | null
}

interface AdditionalConditions {
  faceId: string | null
  touchId: string | null
  backCamera: string | null
  battery: string | null
}

interface AppState {
  // Auth
  role: 'master' | 'client'
  userId: number | null
  modalOpen: boolean

  // Form data
  formData: FormData

  // User data
  username: string | null
  telegramId: string | null
  userPhotoUrl: string | null

  // Device data
  modelname: string
  comment: string
  imei: string | null
  serialNumber: string | null
  price: number | null

  // Device conditions
  deviceConditions: DeviceConditions
  additionalConditions: AdditionalConditions
  showQuestionsSuccess: boolean

  // Navigation
  currentStep: string | null

  // Actions
  setRole: (
    role: 'master' | 'client',
    userId: number
  ) => void
  setModalOpen: (open: boolean) => void
  setFormData: (data: Partial<FormData>) => void
  generateRequestId: () => string

  // User actions
  setUsername: (username: string | null) => void
  setTelegramId: (telegramId: string | null) => void
  setUserPhotoUrl: (url: string | null) => void

  // Device actions
  setModel: (model: string) => void
  setComment: (comment: string) => void
  setImei: (imei: string | null) => void
  setSerialNumber: (sn: string | null) => void
  setPrice: (price: number | null) => void

  // Conditions actions
  setDeviceConditions: (
    conditions: Partial<DeviceConditions>
  ) => void
  setAdditionalConditions: (
    conditions: Partial<AdditionalConditions>
  ) => void
  setShowQuestionsSuccess: (show: boolean) => void

  // Navigation actions
  setCurrentStep: (step: string | null) => void
  goToPreviousStep: () => void
  goToNextStep: () => void
  clearCurrentStep: () => void

  // Reset
  resetAllStates: () => void
}

// ID админов из кода
const ADMIN_IDS = [1, 296925626, 531360988] // Реальные ID админов

// Порядок шагов
const stepOrder = [
  'device-info',
  'form',
  'condition',
  'additional-condition',
  'submit',
  'delivery-options',
  'pickup-points',
  'courier-booking',
  'final',
]

export const useAppStore = create<AppState>((set, get) => ({
  // Auth
  role: 'client',
  userId: null,
  modalOpen: false,

  // Form data
  formData: {
    sn: '',
    model: '',
    pointId: 1,
    requestId: '',
  },

  // User data
  username: null,
  telegramId: null,
  userPhotoUrl: null,

  // Device data
  modelname: 'Apple iPhone 11',
  comment: '',
  imei: null,
  serialNumber: null,
  price: null,

  // Device conditions
  deviceConditions: {
    front: null,
    back: null,
    side: null,
  },
  additionalConditions: {
    faceId: null,
    touchId: null,
    backCamera: null,
    battery: null,
  },
  showQuestionsSuccess: false,

  // Navigation
  currentStep: null,

  // Auth actions
  setRole: (role, userId) => set({ role, userId }),
  setModalOpen: (open) => set({ modalOpen: open }),

  // Form actions
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  generateRequestId: () => {
    const id = `#${Math.floor(Math.random() * 9000) + 1000}`
    set((state) => ({
      formData: { ...state.formData, requestId: id },
    }))
    return id
  },

  // User actions
  setUsername: (username) => set({ username }),
  setTelegramId: (telegramId) => {
    set({ telegramId })
    if (typeof window !== 'undefined' && telegramId) {
      sessionStorage.setItem('telegramId', telegramId)
    }
  },
  setUserPhotoUrl: (userPhotoUrl) => set({ userPhotoUrl }),

  // Device actions
  setModel: (modelname) => set({ modelname }),
  setComment: (comment) => set({ comment }),
  setImei: (imei) => set({ imei }),
  setSerialNumber: (serialNumber) => set({ serialNumber }),
  setPrice: (price) => set({ price }),

  // Conditions actions
  setDeviceConditions: (conditions) =>
    set((state) => ({
      deviceConditions: {
        ...state.deviceConditions,
        ...conditions,
      },
    })),
  setAdditionalConditions: (conditions) =>
    set((state) => ({
      additionalConditions: {
        ...state.additionalConditions,
        ...conditions,
      },
    })),
  setShowQuestionsSuccess: (showQuestionsSuccess) =>
    set({ showQuestionsSuccess }),

  // Navigation actions
  setCurrentStep: (currentStep) => {
    set({ currentStep })
    if (typeof window !== 'undefined' && currentStep) {
      sessionStorage.setItem('currentStep', currentStep)
    }
  },
  goToPreviousStep: () => {
    const { currentStep } = get()
    if (!currentStep) return

    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1]
      set({ currentStep: previousStep })
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('currentStep', previousStep)
      }
    }
  },
  goToNextStep: () => {
    const { currentStep } = get()
    if (!currentStep) return

    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1]
      set({ currentStep: nextStep })
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('currentStep', nextStep)
      }
    }
  },
  clearCurrentStep: () => {
    set({ currentStep: null })
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('currentStep')
    }
  },

  // Reset
  resetAllStates: () =>
    set({
      modelname: 'Apple iPhone 11',
      comment: '',
      imei: null,
      serialNumber: null,
      price: null,
      deviceConditions: {
        front: null,
        back: null,
        side: null,
      },
      additionalConditions: {
        faceId: null,
        touchId: null,
        backCamera: null,
        battery: null,
      },
      showQuestionsSuccess: false,
      currentStep: null,
      formData: {
        sn: '',
        model: '',
        pointId: 1,
        requestId: '',
      },
    }),
}))

// Функция для проверки роли мастера
export const isMaster = (
  userId: number | null
): boolean => {
  if (!userId) return false
  return ADMIN_IDS.includes(userId)
}

// Простые селекторы без shallow для избежания проблем
export const useUserData = () =>
  useAppStore((state) => state.telegramId)
export const useDeviceData = () =>
  useAppStore((state) => state.modelname)
export const useConditions = () =>
  useAppStore((state) => state.deviceConditions)
export const useNavigation = () =>
  useAppStore((state) => state.currentStep)

// Обратная совместимость
export const useAuthStore = useAppStore
