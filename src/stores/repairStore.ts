import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RepairState {
  category: string
  selectedIssues: string[]
  series: string
  deviceModel: string
  issueDescription: string
  issuePhotos: string[]
  deliveryMethod: 'self' | 'courier'
  appointmentDate: string | null
  appointmentTime: string | null
  contact: string
  address: string
  
  setCategory: (cat: string) => void
  setSelectedIssues: (issues: string[]) => void
  toggleIssue: (issue: string) => void
  setSeries: (series: string) => void
  setDeviceModel: (model: string) => void
  setIssueDescription: (desc: string) => void
  addIssuePhoto: (photoBase64: string) => void
  removeIssuePhoto: (index: number) => void
  setDeliveryMethod: (method: 'self' | 'courier') => void
  setAppointment: (date: string, time: string) => void
  setContact: (contact: string) => void
  setAddress: (address: string) => void
  reset: () => void
}

const initialState = {
  category: '',
  selectedIssues: [] as string[],
  series: '',
  deviceModel: '',
  issueDescription: '',
  issuePhotos: [] as string[],
  deliveryMethod: 'self' as const,
  appointmentDate: null,
  appointmentTime: null,
  contact: '',
  address: '',
}

export const useRepairStore = create<RepairState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setCategory: (category) =>
        set({
          category,
          selectedIssues: category ? [category] : [],
        }),
      setSelectedIssues: (selectedIssues) =>
        set({
          selectedIssues,
          category: selectedIssues.join(', '),
        }),
      toggleIssue: (issue) =>
        set((state) => {
          const exists = state.selectedIssues.includes(issue)
          const nextIssues = exists
            ? state.selectedIssues.filter((i) => i !== issue)
            : [...state.selectedIssues, issue]
          return {
            selectedIssues: nextIssues,
            category: nextIssues.join(', '),
          }
        }),
      setSeries: (series) => set({ series }),
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
      setContact: (contact) => set({ contact }),
      setAddress: (address: string) => set({ address }),
      reset: () => set(initialState),
    }),
    {
      name: 'qoqos_repair_store',
    }
  )
)
