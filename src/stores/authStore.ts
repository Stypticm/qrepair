import { create } from 'zustand'
import { shallow } from 'zustand/shallow'
import {
  persist,
  createJSONStorage,
} from 'zustand/middleware'
import {
  hasFeature,
  isTester,
  isAdmin,
  getActiveFeatures,
  type FeatureFlag,
} from '@/lib/featureFlags'
import {
  useSignal,
  initDataState as _initDataState,
} from '@telegram-apps/sdk-react'

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
  // Unified: moved from additionalConditions
  faceId?: string | null
  touchId?: string | null
  backCamera?: string | null
  battery?: string | null
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

  // Debug info
  debugInfo: string[]

  // Device data
  modelname: string
  comment: string
  imei: string | null
  serialNumber: string | null
  price: number | null
  userEvaluation: string | null
  damagePercent: number

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
  setUserEvaluation: (evaluation: string | null) => void
  setDamagePercent: (percent: number) => void

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
  goToPreviousStep: (router?: any) => void
  goToNextStep: () => void
  clearCurrentStep: () => void

  // Reset
  resetAllStates: () => void

  // Clear session storage
  clearSessionStorage: () => void

  // Debug functions
  addDebugInfo: (message: string) => void
  clearDebugInfo: () => void

  // Telegram initialization
  initializeTelegram: (initDataState?: any) => void
}

// ID админов из кода
const ADMIN_IDS = [1, 296925626, 531360988] // Реальные ID админов

// Порядок шагов (клиентская воронка)
const stepOrder = [
  'evaluation-mode',
  'device-info',
  'form',
  'evaluation',
  'device-functions',
  'submit',
  'delivery-options',
  'pickup-points',
  'courier',
  'courier-booking',
  'photos',
  'final',
]

// Создаем кастомное хранилище для sessionStorage
const sessionStorage = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') return null
    try {
      return window.sessionStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string) => {
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.setItem(name, value)
    } catch {
      // Игнорируем ошибки
    }
  },
  removeItem: (name: string) => {
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.removeItem(name)
    } catch {
      // Игнорируем ошибки
    }
  },
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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

      // Debug info
      debugInfo: [],

      // Device data
      modelname: '',
      comment: '',
      imei: null,
      serialNumber: null,
      price: null,
      userEvaluation: null,
      damagePercent: 0,

      // Device conditions
      deviceConditions: {
        front: null,
        back: null,
        side: null,
        faceId: null,
        touchId: null,
        backCamera: null,
        battery: null,
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
        const id = `#${
          Math.floor(Math.random() * 9000) + 1000
        }`
        set((state) => ({
          formData: { ...state.formData, requestId: id },
        }))
        return id
      },

      // User actions
      setUsername: (username) => set({ username }),
      setTelegramId: (telegramId) => {
        set({ telegramId })
        // В Telegram WebApp сохраняем в sessionStorage, в браузере/PWA — в localStorage
        if (typeof window !== 'undefined' && telegramId) {
          if (window.Telegram?.WebApp) {
            sessionStorage.setItem('telegramId', telegramId)
          } else {
            try {
              localStorage.setItem('telegramId', telegramId)
            } catch {}
          }
        }
      },
      setUserPhotoUrl: (userPhotoUrl) =>
        set({ userPhotoUrl }),

      // Device actions
      setModel: (modelname) => set({ modelname }),
      setComment: (comment) => set({ comment }),
      setImei: (imei) => set({ imei }),
      setSerialNumber: (serialNumber) =>
        set({ serialNumber }),
      setPrice: (price) => set({ price }),
      setUserEvaluation: (userEvaluation) =>
        set({ userEvaluation }),
      setDamagePercent: (damagePercent) =>
        set({ damagePercent }),

      // Conditions actions
      setDeviceConditions: (conditions) =>
        set((state) => ({
          deviceConditions: {
            ...state.deviceConditions,
            ...conditions,
          },
          // keep backward compatibility mirror
          additionalConditions: {
            ...state.additionalConditions,
            ...(conditions.faceId !== undefined
              ? { faceId: conditions.faceId }
              : {}),
            ...(conditions.touchId !== undefined
              ? { touchId: conditions.touchId }
              : {}),
            ...(conditions.backCamera !== undefined
              ? { backCamera: conditions.backCamera }
              : {}),
            ...(conditions.battery !== undefined
              ? { battery: conditions.battery }
              : {}),
          },
        })),
      setAdditionalConditions: (conditions) =>
        set((state) => ({
          // write-through into unified deviceConditions
          deviceConditions: {
            ...state.deviceConditions,
            ...(conditions.faceId !== undefined
              ? { faceId: conditions.faceId }
              : {}),
            ...(conditions.touchId !== undefined
              ? { touchId: conditions.touchId }
              : {}),
            ...(conditions.backCamera !== undefined
              ? { backCamera: conditions.backCamera }
              : {}),
            ...(conditions.battery !== undefined
              ? { battery: conditions.battery }
              : {}),
          },
          // keep legacy state for components still reading it
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
      goToPreviousStep: (router?: any) => {
        const { currentStep } = get()
        if (!currentStep) {
          // Если нет текущего шага, идем на главную
          if (typeof window !== 'undefined') {
            if (router) {
              router.push('/')
            } else {
              window.location.href = '/'
            }
          }
          return
        }

        // Специальная логика для разветвлений
        if (currentStep === 'courier-booking') {
          // Из courier-booking идем обратно к delivery-options
          set({ currentStep: 'delivery-options' })
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(
              'currentStep',
              'delivery-options'
            )
            if (router) {
              router.push('/request/delivery-options')
            } else {
              window.location.href =
                '/request/delivery-options'
            }
          }
          return
        }

        if (currentStep === 'pickup-points') {
          // Из pickup-points идем обратно к delivery-options
          set({ currentStep: 'delivery-options' })
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(
              'currentStep',
              'delivery-options'
            )
            if (router) {
              router.push('/request/delivery-options')
            } else {
              window.location.href =
                '/request/delivery-options'
            }
          }
          return
        }

        const currentIndex = stepOrder.indexOf(currentStep)
        if (currentIndex > 0) {
          const previousStep = stepOrder[currentIndex - 1]
          set({ currentStep: previousStep })
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(
              'currentStep',
              previousStep
            )
            // Используем переданный router или window.location как fallback
            if (router) {
              router.push(`/request/${previousStep}`)
            } else {
              window.location.href = `/request/${previousStep}`
            }
          }
        } else {
          // Если мы на первом шаге, идем на главную
          if (typeof window !== 'undefined') {
            if (router) {
              router.push('/')
            } else {
              window.location.href = '/'
            }
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
      resetAllStates: () => {
        set({
          modelname: '',
          comment: '',
          imei: null,
          serialNumber: null,
          price: null,
          userEvaluation: null,
          damagePercent: 0,
          deviceConditions: {
            front: null,
            back: null,
            side: null,
            faceId: null,
            touchId: null,
            backCamera: null,
            battery: null,
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
        })

        // Очищаем sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('phoneSelection')
          sessionStorage.removeItem('deviceConditions')
          sessionStorage.removeItem('additionalConditions')
          sessionStorage.removeItem('basePrice')
          sessionStorage.removeItem('price')
          sessionStorage.removeItem('userEvaluation')
          sessionStorage.removeItem('damagePercent')
          sessionStorage.removeItem('currentStep')
        }
      },

      // Clear session storage
      clearSessionStorage: () => {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('telegramId')
          sessionStorage.removeItem('telegramUsername')
          sessionStorage.removeItem('currentStep')
        }
      },

      // Debug functions
      addDebugInfo: (message: string) => {
        const timestamp = new Date().toLocaleTimeString()
        const debugMessage = `[${timestamp}] ${message}`
        set((state) => ({
          debugInfo: [
            ...state.debugInfo.slice(-9),
            debugMessage,
          ], // Показываем последние 10 сообщений
        }))
      },

      clearDebugInfo: () => {
        set({ debugInfo: [] })
      },

      // Telegram initialization
      initializeTelegram: (initDataState?: any) => {
        const { addDebugInfo } = get()

        addDebugInfo('Инициализация Telegram WebApp')

        if (typeof window === 'undefined') {
          addDebugInfo('❌ window не доступен')
          return
        }

        // Сначала пытаемся восстановить данные из sessionStorage/localStorage
        const savedTelegramId =
          sessionStorage.getItem('telegramId') ||
          (typeof window !== 'undefined'
            ? localStorage.getItem('telegramId')
            : null)
        const savedUsername =
          sessionStorage.getItem('telegramUsername') ||
          (typeof window !== 'undefined'
            ? localStorage.getItem('telegramUsername')
            : null)

        if (savedTelegramId && !get().telegramId) {
          addDebugInfo(
            `🔄 Восстановление из sessionStorage: telegramId=${savedTelegramId}, username=${savedUsername}`
          )
          set({
            telegramId: savedTelegramId,
            username: savedUsername,
            role: ADMIN_IDS.includes(
              parseInt(savedTelegramId)
            )
              ? 'master'
              : 'client',
            userId: parseInt(savedTelegramId),
          })
        }

        const hasTelegramWebApp = !!(window as any).Telegram
          ?.WebApp
        const hasTelegramWebviewProxy = !!(window as any)
          .TelegramWebviewProxy

        addDebugInfo(
          `hasTelegramWebApp: ${hasTelegramWebApp}`
        )
        addDebugInfo(
          `hasTelegramWebviewProxy: ${hasTelegramWebviewProxy}`
        )
        addDebugInfo(
          `initDataState?.user: ${
            initDataState?.user ? 'ЕСТЬ' : 'НЕТ'
          }`
        )

        // Сначала пробуем получить данные из initDataState (как в StartFormContext)
        if (initDataState?.user) {
          addDebugInfo(
            '✅ Получены данные из initDataState'
          )
          addDebugInfo(
            `Username: ${
              initDataState.user.first_name || 'НЕТ'
            }`
          )
          addDebugInfo(
            `ID: ${initDataState.user.id || 'НЕТ'}`
          )

          const tgId = initDataState.user.id.toString()
          const tgUsername =
            initDataState.user.username || null

          addDebugInfo(`✅ Получен telegramId: ${tgId}`)
          addDebugInfo(
            `✅ Получен username: ${tgUsername || 'НЕТ'}`
          )
          addDebugInfo(
            `🔍 initDataState.user.username: ${initDataState.user.username}`
          )
          addDebugInfo(
            `🔍 initDataState.user.first_name: ${initDataState.user.first_name}`
          )
          addDebugInfo(
            `🔍 initDataState.user.last_name: ${initDataState.user.last_name}`
          )

          set({
            telegramId: tgId,
            username: tgUsername,
            userPhotoUrl:
              initDataState.user.photo_url || null,
          })

          // Проверяем, является ли пользователь мастером
          const isMasterUser = ADMIN_IDS.includes(
            parseInt(tgId)
          )
          if (isMasterUser) {
            set({ role: 'master', userId: parseInt(tgId) })
          } else {
            set({ role: 'client', userId: parseInt(tgId) })
          }

          // Сохраняем в sessionStorage и продублируем в localStorage для PWA
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('telegramId', tgId)
            try {
              localStorage.setItem('telegramId', tgId)
            } catch {}
            if (tgUsername) {
              sessionStorage.setItem(
                'telegramUsername',
                tgUsername
              )
              try {
                localStorage.setItem(
                  'telegramUsername',
                  tgUsername
                )
              } catch {}
              addDebugInfo(
                `💾 Сохранен username: ${tgUsername}`
              )
            } else {
              addDebugInfo(`⚠️ Username не сохранен (null)`)
            }
          }
        } else if (hasTelegramWebApp) {
          // Fallback: пытаемся получить данные напрямую из window.Telegram.WebApp
          addDebugInfo(
            'Fallback - получаем данные из window.Telegram.WebApp'
          )
          const webApp = (window as any).Telegram.WebApp
          const userData = webApp.initDataUnsafe?.user

          addDebugInfo(
            `initDataUnsafe.user: ${JSON.stringify(
              userData
            )}`
          )

          if (userData?.id) {
            const tgId = userData.id.toString()
            const tgUsername = userData.username || null

            addDebugInfo(
              `✅ Fallback - Получен telegramId: ${tgId}`
            )
            addDebugInfo(
              `✅ Fallback - Получен username: ${
                tgUsername || 'НЕТ'
              }`
            )
            addDebugInfo(
              `🔍 Fallback - userData.username: ${userData.username}`
            )
            addDebugInfo(
              `🔍 Fallback - userData.first_name: ${userData.first_name}`
            )
            addDebugInfo(
              `🔍 Fallback - userData.last_name: ${userData.last_name}`
            )

            set({
              telegramId: tgId,
              username: tgUsername,
              userPhotoUrl: userData.photo_url || null,
            })

            // Проверяем, является ли пользователь мастером
            const isMasterUser = ADMIN_IDS.includes(
              parseInt(tgId)
            )
            if (isMasterUser) {
              set({
                role: 'master',
                userId: parseInt(tgId),
              })
            } else {
              set({
                role: 'client',
                userId: parseInt(tgId),
              })
            }

            // Сохраняем в sessionStorage и localStorage (для PWA повторных запусков)
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('telegramId', tgId)
              try {
                localStorage.setItem('telegramId', tgId)
              } catch {}
              if (tgUsername) {
                sessionStorage.setItem(
                  'telegramUsername',
                  tgUsername
                )
                try {
                  localStorage.setItem(
                    'telegramUsername',
                    tgUsername
                  )
                } catch {}
                addDebugInfo(
                  `💾 Fallback - Сохранен username: ${tgUsername}`
                )
              } else {
                addDebugInfo(
                  `⚠️ Fallback - Username не сохранен (null)`
                )
              }
            }
          } else {
            addDebugInfo('❌ Нет user.id в initDataUnsafe')
          }
        } else {
          addDebugInfo('❌ Telegram WebApp не доступен')
        }
      },
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        // Сохраняем только критически важные данные
        telegramId: state.telegramId,
        username: state.username,
        userPhotoUrl: state.userPhotoUrl,
        role: state.role,
        userId: state.userId,
        modelname: state.modelname,
        deviceConditions: state.deviceConditions,
        price: state.price,
        currentStep: state.currentStep,
      }),
    }
  )
)

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

// Feature Flags функции
export const useFeatureFlags = () => {
  const { telegramId } = useAppStore()

  return {
    hasFeature: (feature: FeatureFlag) =>
      hasFeature(feature, telegramId || ''),
    isTester: () => isTester(telegramId || ''),
    isAdmin: () => isAdmin(telegramId || ''),
    getActiveFeatures: () =>
      getActiveFeatures(telegramId || ''),
  }
}

// Обратная совместимость
export const useAuthStore = useAppStore
