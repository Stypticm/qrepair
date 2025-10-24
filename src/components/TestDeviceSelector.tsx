'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { TestDeviceData } from '@/hooks/useTestDevices'
import { useIPhoneAdaptive } from '@/hooks/useIPhoneAdaptive'

interface TestDeviceSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectDevice: (device: TestDeviceData) => void
  testDevices: TestDeviceData[]
  isLoading: boolean
}

export function TestDeviceSelector({ 
  isOpen, 
  onClose, 
  onSelectDevice, 
  testDevices, 
  isLoading 
}: TestDeviceSelectorProps) {
  const { adaptiveSizes } = useIPhoneAdaptive()
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  // Отладочная информация
  console.log('🧪 TestDeviceSelector:', { 
    isOpen, 
    testDevicesCount: testDevices.length, 
    isLoading,
    testDevices: testDevices.map(d => ({ id: d.id, name: d.name, serial: d.serial }))
  })

  const handleSelectDevice = () => {
    if (!selectedDeviceId) return
    
    const device = testDevices.find(d => d.id === selectedDeviceId)
    if (device) {
      onSelectDevice(device)
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedDeviceId(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className={`bg-white border border-gray-200 w-[95vw] max-w-md mx-auto rounded-xl shadow-lg ${adaptiveSizes.dialogMaxHeight}`}
        showCloseButton={false}
      >
        <DialogTitle className={`text-center ${adaptiveSizes.titleSize} font-semibold text-gray-900 mb-4`}>
          🧪 Выберите тестовое устройство
        </DialogTitle>
        
        <div className={`${adaptiveSizes.elementSpacing} max-h-96 overflow-y-auto`}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Загрузка устройств...</span>
            </div>
          ) : testDevices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <p className="font-medium">Нет доступных тестовых устройств</p>
                <p className="text-sm mt-2 text-gray-400">
                  Убедитесь, что файл iphoneMisha.json находится в папке public/
                </p>
              </div>
            </div>
          ) : (
            testDevices.map((device, index) => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedDeviceId === device.id 
                      ? 'ring-2 ring-[#2dc2c6] bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedDeviceId(device.id)}
                >
                  <CardContent className={adaptiveSizes.cardPadding}>
                    <div className="flex items-center space-x-3">
                      {/* Изображение устройства */}
                      <div className="flex-shrink-0">
                        <Image
                          src={device.normalized?.image || '/placeholder-device.png'}
                          alt={device.name}
                          width={60}
                          height={60}
                          className="rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-device.png'
                          }}
                        />
                      </div>
                      
                      {/* Информация об устройстве */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`${adaptiveSizes.bodySize} font-semibold text-gray-900 truncate`}>
                          {device.name}
                        </h3>
                        <p className={`${adaptiveSizes.captionSize} text-gray-500 mt-1`}>
                          SN: {device.serial}
                        </p>
                        <p className={`${adaptiveSizes.captionSize} text-gray-400 mt-1`}>
                          {device.normalized?.warrantyStatus || 'Unknown Status'}
                        </p>
                      </div>
                      
                      {/* Индикатор выбора */}
                      <div className="flex-shrink-0">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedDeviceId === device.id 
                            ? 'border-[#2dc2c6] bg-[#2dc2c6]' 
                            : 'border-gray-300'
                        }`}>
                          {selectedDeviceId === device.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex space-x-3 mt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            className={`flex-1 ${adaptiveSizes.buttonHeight} ${adaptiveSizes.bodySize}`}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSelectDevice}
            disabled={!selectedDeviceId}
            className={`flex-1 bg-[#2dc2c6] hover:bg-[#25a8ac] text-white ${adaptiveSizes.buttonHeight} ${adaptiveSizes.bodySize} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Выбрать
          </Button>
        </div>

        {/* Подсказка */}
        <div className="mt-3 text-center">
          <p className={`${adaptiveSizes.captionSize} text-gray-500`}>
            💡 Выберите устройство для тестирования без реальных API запросов
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
