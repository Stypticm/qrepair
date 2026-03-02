import { create } from 'zustand'

interface RepairState {
  category: string
  deviceModel: string
  issueDescription: string
  issuePhotos: string[]
  deliveryMethod: 'self' | 'courier'
  appointmentDate: string | null
  appointmentTime: string | null
  
  setCategory: (cat: string) => void
  setDeviceModel: (model: string) => void
  setIssueDescription: (desc: string) => void
  addIssuePhoto: (photoBase64: string) => void
  removeIssuePhoto: (index: number) => void
  setDeliveryMethod: (method: 'self' | 'courier') => void
  setAppointment: (date: string, time: string) => void
  reset: () => void
}

const initialState = {
  category: '',
  deviceModel: '',
  issueDescription: '',
  issuePhotos: [],
  deliveryMethod: 'self' as const,
  appointmentDate: null,
  appointmentTime: null,
}

export const useRepairStore = create<RepairState>((set) => ({
  ...initialState,
  
  setCategory: (category) => set({ category }),
  setDeviceModel: (deviceModel) => set({ deviceModel }),
  setIssueDescription: (issueDescription) => set({ issueDescription }),
  addIssuePhoto: (photoBase64) => 
    set((state) => ({ issuePhotos: [...state.issuePhotos, photoBase64] })),
  removeIssuePhoto: (index) => 
    set((state) => ({
      issuePhotos: state.issuePhotos.filter((_, i) => i !== index),
    })),
  setDeliveryMethod: (deliveryMethod) => set({ deliveryMethod }),
  setAppointment: (date, time) => 
    set({ appointmentDate: date, appointmentTime: time }),
  reset: () => set(initialState),
}))
