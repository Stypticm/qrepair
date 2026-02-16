import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  hasFeature,
  isTester,
  isAdmin,
  getActiveFeatures,
  type FeatureFlag,
} from '@/lib/featureFlags'
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

interface User {
  id: string
  telegramId: string
  role: string
}

interface AppState {
  // Auth
  user: User | null
  authToken: string | null
  role: 'master' | 'client'
  userId: string | number | null
  modalOpen: boolean
  isManualLogout: boolean

  // Form data
  formData: FormData

  // User data (legacy, kept for compatibility)
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

  // Auth Actions
  login: (login: string, password: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<void>
  setUser: (user: User | null) => void

  // Legacy Actions
  setRole: (role: 'master' | 'client', userId: number) => void
  setModalOpen: (open: boolean) => void
  setFormData: (data: Partial<FormData>) => void
  generateRequestId: () => string
  setUsername: (username: string | null) => void
  setTelegramId: (telegramId: string | null) => void
  setUserPhotoUrl: (url: string | null) => void
  setModel: (model: string) => void
  setComment: (comment: string) => void
  setImei: (imei: string | null) => void
  setSerialNumber: (sn: string | null) => void
  setPrice: (price: number | null) => void
  setUserEvaluation: (evaluation: string | null) => void
  setDamagePercent: (percent: number) => void
  setDeviceConditions: (conditions: Partial<DeviceConditions>) => void
  setAdditionalConditions: (conditions: Partial<AdditionalConditions>) => void
  setShowQuestionsSuccess: (show: boolean) => void
  setCurrentStep: (step: string | null) => void
  goToPreviousStep: (router?: any) => void
  goToNextStep: () => void
  clearCurrentStep: () => void
  resetAllStates: () => void
  clearSessionStorage: () => void
  addDebugInfo: (message: string) => void
  clearDebugInfo: () => void
  initializeTelegram: (initDataState?: any) => void
  setAuthData: (data: { user: User, token: string }) => void
}

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

const storage = createJSONStorage(() => {
  if (typeof window !== 'undefined') {
    return localStorage
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }
})

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      authToken: null,
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

      // Auth Actions
      login: async (login: string, password: string) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, password }),
          })

          if (!res.ok) {
            return false
          }

          const data = await res.json()

          set({
            user: data.user,
            authToken: data.token,
            telegramId: data.user.telegramId,
            username: data.user.telegramId,
            role: data.user.role === 'ADMIN' || data.user.role === 'MASTER' ? 'master' : 'client',
            userId: data.user.telegramId,
            isManualLogout: false,
          })

          return true
        } catch (error) {
          console.error('Login error:', error)
          return false
        }
      },

      logout: () => {
        console.log('🚪 Logging out...')

        set({
          user: null,
          authToken: null,
          telegramId: null,
          username: null,
          userPhotoUrl: null,
          role: 'client',
          userId: null,
          currentStep: null,
          isManualLogout: true,
          formData: {
            sn: '',
            model: '',
            pointId: 1,
            requestId: '',
          },
          guestId: null,
        })

        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
            localStorage.removeItem('telegramId')
            localStorage.removeItem('telegramUsername')
            sessionStorage.clear()
            console.log('✅ Auth storage cleared')
          } catch (e) {
            console.error('❌ Error clearing storage:', e)
          }
        }
      },

      checkAuth: async () => {
        const { authToken } = get()

        if (!authToken) {
          return
        }

        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })

          if (!res.ok) {
            // Token invalid, logout
            get().logout()
            return
          }

          const data = await res.json()

          set({
            user: data.user,
            telegramId: data.user.telegramId,
            role: data.user.role === 'ADMIN' || data.user.role === 'MASTER' ? 'master' : 'client',
            userId: data.user.telegramId,
          })
        } catch (error) {
          console.error('Check auth error:', error)
          get().logout()
        }
      },

      setUser: (user: User | null) => set({ user }),

      // Legacy actions (kept for compatibility)
      setRole: (role, userId) => set({ role, userId }),
      setModalOpen: (open) => set({ modalOpen: open }),
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
      setUsername: (username) => set({ username }),
      setTelegramId: (telegramId) => {
        set({ telegramId, isManualLogout: false })
      },
      setUserPhotoUrl: (userPhotoUrl) => set({ userPhotoUrl }),
      setModel: (modelname) => set({ modelname }),
      setComment: (comment) => set({ comment }),
      setImei: (imei) => set({ imei }),
      setSerialNumber: (serialNumber) => set({ serialNumber }),
      setPrice: (price) => set({ price }),
      setUserEvaluation: (userEvaluation) => set({ userEvaluation }),
      setDamagePercent: (damagePercent) => set({ damagePercent }),
      setDeviceConditions: (conditions) =>
        set((state) => ({
          deviceConditions: {
            ...state.deviceConditions,
            ...conditions,
          },
          additionalConditions: {
            ...state.additionalConditions,
            ...(conditions.faceId !== undefined ? { faceId: conditions.faceId } : {}),
            ...(conditions.touchId !== undefined ? { touchId: conditions.touchId } : {}),
            ...(conditions.backCamera !== undefined ? { backCamera: conditions.backCamera } : {}),
            ...(conditions.battery !== undefined ? { battery: conditions.battery } : {}),
          },
        })),
      setAdditionalConditions: (conditions) =>
        set((state) => ({
          deviceConditions: {
            ...state.deviceConditions,
            ...(conditions.faceId !== undefined ? { faceId: conditions.faceId } : {}),
            ...(conditions.touchId !== undefined ? { touchId: conditions.touchId } : {}),
            ...(conditions.backCamera !== undefined ? { backCamera: conditions.backCamera } : {}),
            ...(conditions.battery !== undefined ? { battery: conditions.battery } : {}),
          },
          additionalConditions: {
            ...state.additionalConditions,
            ...conditions,
          },
        })),
      setShowQuestionsSuccess: (showQuestionsSuccess) => set({ showQuestionsSuccess }),
      setCurrentStep: (currentStep) => {
        set({ currentStep })
      },
      goToPreviousStep: (router?: any) => {
        const { currentStep } = get()
        if (!currentStep) {
          if (typeof window !== 'undefined') {
            if (router) {
              router.push('/')
            } else {
              window.location.href = '/'
            }
          }
          return
        }

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
          set({ currentStep: 'delivery-options' })
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('currentStep', 'delivery-options')
            if (router) {
              router.push('/request/delivery-options')
            } else {
              window.location.href = '/request/delivery-options'
            }
          }
          return
        }

        if (currentStep === 'pickup-points') {
          set({ currentStep: 'delivery-options' })
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('currentStep', 'delivery-options')
            if (router) {
              router.push('/request/delivery-options')
            } else {
              window.location.href = '/request/delivery-options'
            }
          }
          return
        }

        const currentIndex = stepOrder.indexOf(currentStep)
        if (currentIndex > 0) {
          const previousStep = stepOrder[currentIndex - 1]
          set({ currentStep: previousStep })
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('currentStep', previousStep)
            if (router) {
              router.push(`/request/${previousStep}`)
            } else {
              window.location.href = `/request/${previousStep}`
            }
          }
        } else {
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
      },
      clearSessionStorage: () => {
        // no-op, use logout
      },
      addDebugInfo: (message: string) => {
        const timestamp = new Date().toLocaleTimeString()
        const debugMessage = `[${timestamp}] ${message}`
        set((state) => ({
          debugInfo: [...state.debugInfo.slice(-9), debugMessage],
        }))
      },
      clearDebugInfo: () => {
        set({ debugInfo: [] })
      },
      initializeTelegram: () => {
        if (typeof window !== 'undefined') {
          // 1. Try to get data from Telegram WebApp
          const tg = (window as any).Telegram?.WebApp;
          if (tg?.initDataUnsafe?.user) {
            const tgUser = tg.initDataUnsafe.user;
            const tgId = tgUser.id.toString();
            console.log('📱 Telegram WebApp: Syncing user', tgId);
            
            set({
              telegramId: tgId,
              username: tgUser.username || tgUser.first_name || 'User',
              role: isAdminTelegramId(tgId) ? 'master' : 'client',
              userId: tgId,
              isManualLogout: false
            });
            return;
          }

          // 2. Local Dev Mode Fallback
          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          const devId = process.env.NEXT_PUBLIC_DEV_TELEGRAM_ID;
          const devUser = process.env.NEXT_PUBLIC_DEV_TELEGRAM_USERNAME;

          if (isLocal && devId && !get().telegramId && !get().isManualLogout) {
            console.log('🛠️ Local Dev Mode: Auto-authenticating as Admin', devId);
            set({
              telegramId: devId,
              username: devUser || 'DevAdmin',
              role: isAdminTelegramId(devId) ? 'master' : 'client',
              userId: devId,
              isManualLogout: false
            });
          }
        }
      },
      setAuthData: (data) => {
        set({
          user: data.user,
          authToken: data.token,
          telegramId: data.user.telegramId,
          username: data.user.telegramId,
          role: data.user.role === 'ADMIN' || data.user.role === 'MASTER' ? 'master' : 'client',
          userId: data.user.telegramId,
          isManualLogout: false,
        })
      },
    }),
    {
      name: 'app-store',
      storage: storage,
      partialize: (state) => ({
        user: state.user,
        authToken: state.authToken,
        telegramId: state.telegramId,
        username: state.username,
        userPhotoUrl: state.userPhotoUrl,
        role: state.role,
        userId: state.userId,
        formData: state.formData,
        currentStep: state.currentStep,
        isManualLogout: state.isManualLogout,
        guestId: state.guestId,
      }),
    }
  )
)

export const isMaster = (userId: string | number | null): boolean => {
  if (!userId) return false
  return isAdminTelegramId(userId)
}

export const useUserData = () => useAppStore((state) => state.telegramId)
export const useDeviceData = () => useAppStore((state) => state.modelname)
export const useConditions = () => useAppStore((state) => state.deviceConditions)
export const useNavigation = () => useAppStore((state) => state.currentStep)

export const useFeatureFlags = () => {
  const { telegramId } = useAppStore()

  return {
    hasFeature: (feature: FeatureFlag) => hasFeature(feature, telegramId || ''),
    isTester: () => isTester(telegramId || ''),
    isAdmin: () => isAdmin(telegramId || ''),
    getActiveFeatures: () => getActiveFeatures(telegramId || ''),
  }
}

export const useAuthStore = useAppStore
