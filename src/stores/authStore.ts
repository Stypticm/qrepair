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
import { isAdminTelegramId } from '@/core/lib/admin'

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
  isManualLogout: boolean

  // Form data
  formData: FormData

  // User data
  username: string | null
  telegramId: string | null
  userPhotoUrl: string | null
  guestId: string | null

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

  // Logout
  logout: () => void

  // Debug functions
  addDebugInfo: (message: string) => void
  clearDebugInfo: () => void

  // Telegram initialization
  initializeTelegram: (initDataState?: any) => void
}

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

// Создаем кастомное хранилище на базе localStorage для надежности в PWA
const storage = createJSONStorage(() => {
  if (typeof window !== 'undefined') {
    return localStorage;
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      role: 'client',
      userId: null,
      modalOpen: false,
      isManualLogout: false,
      guestId: null,

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
        set({ telegramId, isManualLogout: false })
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
        // Не позволяем попадать в тестовую линию (evaluation-mode) из ручной оценки
        if (currentStep === 'device-info') {
          if (typeof window !== 'undefined') {
            if (router) {
              router.push('/')
            } else {
              window.location.href = '/'
            }
          }
          set({ currentStep: null })
          return
        }

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

        // Очищаем debug info если нужно, но не стор, так как это resetAllStates (обычно внутри сессии)
      },

      // Clear session storage - deprecated, handled by persist/logout
      clearSessionStorage: () => {
        // no-op, use logout
      },

      // Logout
      // Logout
      logout: () => {
        console.log('🚪 Logging out...');
        
        // 1. Сбрасываем стейт Zustand + ставим флаг ручного выхода
        set({
          telegramId: null,
          username: null,
          userPhotoUrl: null,
          role: 'client',
          userId: null,
          currentStep: null,
          isManualLogout: true, // ВАЖНО: предотвращает авто-логин при следующем заходе
          formData: {
            sn: '',
            model: '',
            pointId: 1,
            requestId: '',
          },
          guestId: null
        });
        
        // 2. Очищаем персистентное хранилище
        if (typeof window !== 'undefined') {
          try {
            // Удаляем точечные ключи
            localStorage.removeItem('telegramId');
            localStorage.removeItem('telegramUsername');
            localStorage.removeItem('app-store'); // ПОЛНАЯ ОЧИСТКА для уверенности
            sessionStorage.clear();
            
            console.log('✅ Auth storage cleared fully');
          } catch (e) {
            console.error('❌ Error clearing storage:', e);
          }
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

      // Инициализация Telegram: только из TWA или уже восстановленного persist стейта
      initializeTelegram: (initDataState?: any) => {
        const { addDebugInfo, telegramId } = get()

        addDebugInfo('Инициализация Telegram Auth...')

        // 1. Если у нас уже есть telegramId (восстановлен через persist), проверяем валидность
        if (telegramId) {
            addDebugInfo(`✅ Восстановлена сессия для ID: ${telegramId}`);
            return;
        }

        // 2. Если мы на localhost, можем авто-залогиниться под дев-юзером
        const { isManualLogout } = get();
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            const devId = process.env.NEXT_PUBLIC_DEV_TELEGRAM_ID || '531360988';
            
            // Если мы разлогинились вручную, не авто-логинимся до следующего явного действия
            if (isManualLogout) {
                addDebugInfo('ℹ️ Localhost: Пропуск авто-логина (был ручной выход)');
                return;
            }

            if (!telegramId || !isAdminTelegramId(telegramId)) {
                 addDebugInfo(`🔧 Dev Mode: Авто-логин для localhost (${devId})`);
                 set({ 
                    telegramId: devId,
                    username: process.env.NEXT_PUBLIC_DEV_TELEGRAM_USERNAME || 'qoqos_app',
                    role: isAdminTelegramId(devId) ? 'master' : 'client',
                    userId: parseInt(devId),
                    isManualLogout: false
                 });
                 return;
            }
        }

        // 3. Если мы в TWA (Telegram Mini App), берем данные оттуда
        if (initDataState?.user) {
          addDebugInfo('✅ TWA: Получены данные из initData');
          const user = initDataState.user;
          const tgId = user.id.toString();
          
          set({
            telegramId: tgId,
            username: user.username || null,
            userPhotoUrl: user.photo_url || null,
            role: isAdminTelegramId(user.id) ? 'master' : 'client',
            userId: user.id,
            isManualLogout: false // Сбрасываем флаг, если мы явно получили данные (хотя тут спорно, если TWA всегда дает данные)
          });
          return;
        } 
        
        // 3. Fallback для TWA (старая версия API)
        const webApp = (window as any).Telegram?.WebApp;
        const unsafeUser = webApp?.initDataUnsafe?.user;
        
        if (unsafeUser?.id) {
           const tgId = unsafeUser.id.toString();
           set({
             telegramId: tgId,
             username: unsafeUser.username || null,
             userPhotoUrl: unsafeUser.photo_url || null,
             role: isAdminTelegramId(unsafeUser.id) ? 'master' : 'client',
             userId: unsafeUser.id,
             isManualLogout: false
           });
        } else {
            addDebugInfo('ℹ️ Нет данных TWA, ожидание виджета входа...');
        }
      },
    }),
    {
      name: 'app-store',
      // Используем наше localStorage-based хранилище
      storage: storage, 
      partialize: (state) => ({
        telegramId: state.telegramId,
        username: state.username,
        userPhotoUrl: state.userPhotoUrl,
        role: state.role,
        userId: state.userId,
        // Сохраняем черновик формы
        formData: state.formData,
        // Сохраняем состояние ui
        currentStep: state.currentStep,
        // Сохраняем флаг ручного выхода
        isManualLogout: state.isManualLogout,
        // Сохраняем гостевой ID
        guestId: state.guestId,
      }),
    }
  )
)

// Функция для проверки роли мастера
export const isMaster = (
  userId: number | null
): boolean => {
  if (!userId) return false
  return isAdminTelegramId(userId)
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
