import { toast } from 'sonner'

export function useNotifications() {
  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) => {
    switch (type) {
      case 'success':
        toast.success(message)
        break
      case 'error':
        toast.error(message)
        break
      case 'warning':
        toast.warning(message)
        break
      default:
        toast.info(message)
        break
    }
  }

  const showMasterNotification = (message: string) => {
    toast.info(message, {
      description: 'Новое уведомление для мастера',
      duration: 5000,
    })
  }

  const showRequestNotification = (
    requestId: string,
    clientName: string
  ) => {
    toast.info(`Новая заявка #${requestId}`, {
      description: `От клиента @${clientName}`,
      duration: 8000,
      action: {
        label: 'Посмотреть',
        onClick: () => {
          // Здесь можно добавить навигацию к заявке
          console.log(`Navigate to request ${requestId}`)
        },
      },
    })
  }

  return {
    showNotification,
    showMasterNotification,
    showRequestNotification,
  }
}
