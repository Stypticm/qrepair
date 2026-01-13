'use client'

import { useState, useEffect } from 'react'

// Интерфейс для тестовых данных устройства
export interface TestDeviceData {
  id: string
  name: string
  serial: string
  data: any
  normalized: any
  createdAt: string
}

// Хук для управления тестовыми данными
export function useTestDevices() {
  const [testDevices, setTestDevices] = useState<
    TestDeviceData[]
  >([])
  const [isLoading, setIsLoading] = useState(false)

  // Загружаем тестовые данные при инициализации
  useEffect(() => {
    console.log(
      '🔄 useTestDevices: Загружаем тестовые устройства...'
    )
    loadTestDevices()
  }, [])

  // Загружаем все доступные тестовые устройства
  const loadTestDevices = async () => {
    try {
      setIsLoading(true)

      // Загружаем основной iphoneMisha.json
      console.log('📱 Загружаем iphoneMisha.json...')
      const iphoneMishaResponse = await fetch(
        '/iphoneMisha.json'
      )
      console.log(
        '📱 iphoneMisha.json статус:',
        iphoneMishaResponse.status
      )

      if (iphoneMishaResponse.ok) {
        const iphoneMishaData =
          await iphoneMishaResponse.json()
        console.log(
          '📱 iphoneMisha.json данные:',
          iphoneMishaData
        )

        const mishaDevice: TestDeviceData = {
          id: 'iphone-misha',
          name: 'iPhone XR',
          serial:
            iphoneMishaData.data?.properties?.serial ||
            'DX3DQ2S1KXK6',
          data: iphoneMishaData,
          normalized: iphoneMishaData.normalized,
          createdAt: new Date().toISOString(),
        }

        setTestDevices((prev) => {
          const exists = prev.find(
            (d) => d.id === 'iphone-misha'
          )
          if (!exists) {
            console.log(
              '✅ Добавляем iPhone XR в список тестовых устройств'
            )
            return [mishaDevice, ...prev]
          }
          return prev
        })
      } else {
        console.error(
          '❌ Не удалось загрузить iphoneMisha.json:',
          iphoneMishaResponse.status
        )
      }

      // Загружаем дополнительные тестовые файлы
      await loadAdditionalTestDevices()

      // Финальная статистика
      console.log('📊 === ИТОГОВАЯ СТАТИСТИКА ЗАГРУЗКИ ===')
      console.log(
        `📱 Всего тестовых устройств загружено: ${testDevices.length}`
      )
      console.log(
        '📱 Список устройств:',
        testDevices.map((d) => ({
          id: d.id,
          name: d.name,
          serial: d.serial,
        }))
      )
    } catch (error) {
      console.error('Error loading test devices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Загружаем дополнительные тестовые устройства
  const loadAdditionalTestDevices = async () => {
    try {
      console.log(
        '🔍 Загружаем дополнительные тестовые устройства...'
      )

      // Ищем файлы с паттерном testDevice_*.json
      const testDeviceFiles = [
        'testDevice_friend.json',
        'testDevice_admin.json',
        'testDevice_sample.json',
      ]

      let loadedCount = 0

      for (const filename of testDeviceFiles) {
        try {
          console.log(`📁 Проверяем файл: ${filename}`)
          const response = await fetch(`/${filename}`)

          if (response.ok) {
            console.log(
              `✅ Файл ${filename} найден, загружаем...`
            )
            const data = await response.json()
            const deviceId = filename
              .replace('.json', '')
              .replace('testDevice_', '')

            // Извлекаем название модели из deviceName
            const deviceName =
              data.normalized?.deviceName ||
              data.data?.properties?.deviceName ||
              ''
            const modelName =
              deviceName.match(
                /iPhone\s+([^0-9\s]+(?:\s+[^0-9\s]+)*)/
              )?.[1] || `Test Device ${deviceId}`

            const testDevice: TestDeviceData = {
              id: deviceId,
              name: modelName,
              serial: data.data?.properties?.serial || '',
              data: data,
              normalized: data.normalized,
              createdAt: new Date().toISOString(),
            }

            setTestDevices((prev) => {
              const exists = prev.find(
                (d) => d.id === deviceId
              )
              if (!exists) {
                loadedCount++
                console.log(
                  `✅ Добавлено тестовое устройство: ${modelName}`
                )
                return [...prev, testDevice]
              }
              return prev
            })
          } else {
            console.log(
              `❌ Файл ${filename} не найден (статус: ${response.status})`
            )
          }
        } catch (error) {
          // Файл не существует, пропускаем
          console.log(
            `❌ Ошибка загрузки файла ${filename}:`,
            error
          )
        }
      }

      console.log(
        `📊 Загружено дополнительных устройств: ${loadedCount}`
      )

      // Также загружаем из localStorage (для динамически созданных устройств)
      console.log(
        '🔍 Проверяем localStorage на наличие тестовых устройств...'
      )
      const localStorageKeys = Object.keys(
        localStorage
      ).filter((key) => key.startsWith('testDevice_'))

      console.log(
        `📱 Найдено в localStorage: ${localStorageKeys.length} устройств`
      )

      for (const key of localStorageKeys) {
        try {
          const data = JSON.parse(
            localStorage.getItem(key) || '{}'
          )
          const deviceId = key.replace('testDevice_', '')

          // Извлекаем название модели из deviceName
          const deviceName =
            data.normalized?.deviceName ||
            data.data?.properties?.deviceName ||
            ''
          const modelName =
            deviceName.match(
              /iPhone\s+([^0-9\s]+(?:\s+[^0-9\s]+)*)/
            )?.[1] || `Test Device ${deviceId}`

          const testDevice: TestDeviceData = {
            id: deviceId,
            name: modelName,
            serial: data.data?.properties?.serial || '',
            data: data,
            normalized: data.normalized,
            createdAt: new Date().toISOString(),
          }

          setTestDevices((prev) => {
            const exists = prev.find(
              (d) => d.id === deviceId
            )
            if (!exists) {
              return [...prev, testDevice]
            }
            return prev
          })
        } catch (error) {
          console.error(
            `Error loading test device from localStorage ${key}:`,
            error
          )
        }
      }

      console.log(
        `📊 Итого загружено из localStorage: ${localStorageKeys.length} устройств`
      )
    } catch (error) {
      console.error(
        'Error loading additional test devices:',
        error
      )
    }
  }

  // Проверяем, есть ли тестовые данные для серийного номера
  const findTestDeviceBySerial = (
    serial: string
  ): TestDeviceData | null => {
    return (
      testDevices.find(
        (device) =>
          device.serial.toLowerCase() ===
          serial.toLowerCase()
      ) || null
    )
  }

  // Создаем новый тестовый файл для серийного номера
  const createTestDeviceForSerial = async (
    serial: string,
    deviceData: any
  ): Promise<TestDeviceData | null> => {
    try {
      // Генерируем уникальный ID для нового устройства
      const deviceId = `device_${Date.now()}`
      const filename = `testDevice_${deviceId}.json`

      // Создаем структуру данных аналогичную iphoneMisha.json
      const testDeviceData = {
        ok: true,
        provider: 'test-device',
        data: {
          id: deviceId,
          type: 'test',
          status: 'successful',
          orderId: null,
          service: {
            id: 999,
            title: 'Test Device Data',
          },
          amount: '0.00',
          deviceId: serial,
          processedAt: Math.floor(Date.now() / 1000),
          properties: {
            deviceName:
              deviceData.deviceName || 'Test iPhone',
            image:
              deviceData.image ||
              'https://sources.imeicheck.net/images/64664f0891ea173f2986918043423f9e.png',
            imei: deviceData.imei || '',
            serial: serial,
            estPurchaseDate:
              deviceData.estPurchaseDate ||
              Math.floor(Date.now() / 1000),
            simLock: deviceData.simLock || false,
            fmiOn: deviceData.fmiOn || false,
            warrantyStatus:
              deviceData.warrantyStatus ||
              'Out Of Warranty',
            repairCoverage:
              deviceData.repairCoverage || false,
            technicalSupport:
              deviceData.technicalSupport || false,
            'apple/modelName':
              deviceData.modelName || 'iPhone Test',
            lostMode: deviceData.lostMode || false,
            usaBlockStatus:
              deviceData.usaBlockStatus || 'Clean',
            network: deviceData.network || 'Global',
          },
        },
        normalized: {
          deviceName:
            deviceData.deviceName || 'Test iPhone',
          image:
            deviceData.image ||
            'https://sources.imeicheck.net/images/64664f0891ea173f2986918043423f9e.png',
          imei: deviceData.imei || '',
          serial: serial,
          estPurchaseDate:
            deviceData.estPurchaseDate ||
            Math.floor(Date.now() / 1000),
          simLock: deviceData.simLock || false,
          warrantyStatus:
            deviceData.warrantyStatus || 'Out Of Warranty',
          repairCoverage:
            deviceData.repairCoverage || false,
          technicalSupport:
            deviceData.technicalSupport || false,
          modelDesc: deviceData.modelDesc || '',
          purchaseCountry: deviceData.purchaseCountry || '',
          region: deviceData.region || '',
          fmiOn: deviceData.fmiOn || false,
          lostMode: deviceData.lostMode || false,
          usaBlockStatus:
            deviceData.usaBlockStatus || 'Clean',
          network: deviceData.network || 'Global',
        },
      }

      // Сохраняем в localStorage для демонстрации (в реальном проекте это было бы на сервере)
      const testDevice: TestDeviceData = {
        id: deviceId,
        name: testDeviceData.normalized.deviceName,
        serial: serial,
        data: testDeviceData,
        normalized: testDeviceData.normalized,
        createdAt: new Date().toISOString(),
      }

      // Добавляем в список тестовых устройств
      setTestDevices((prev) => [...prev, testDevice])

      // Сохраняем в localStorage
      localStorage.setItem(
        `testDevice_${deviceId}`,
        JSON.stringify(testDeviceData)
      )

      return testDevice
    } catch (error) {
      console.error('Error creating test device:', error)
      return null
    }
  }

  // Получаем данные устройства для тестирования
  const getTestDeviceData = (deviceId: string) => {
    return testDevices.find(
      (device) => device.id === deviceId
    )
  }

  return {
    testDevices,
    isLoading,
    loadTestDevices,
    findTestDeviceBySerial,
    createTestDeviceForSerial,
    getTestDeviceData,
  }
}
