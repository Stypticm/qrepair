import { DeviceTest } from './interfaces'

// Конфигурация тестов для проверки устройства
export const DEVICE_TESTS: DeviceTest[] = [
  // Базовые тесты
  {
    id: 'power',
    name: 'Включение/выключение',
    description: 'Телефон включается и выключается',
    type: 'checkbox',
    required: true,
  },
  {
    id: 'volume_buttons',
    name: 'Кнопки громкости',
    description:
      'Кнопки увеличения/уменьшения громкости работают',
    type: 'checkbox',
    required: true,
  },
  {
    id: 'power_button',
    name: 'Кнопка питания',
    description: 'Кнопка включения/блокировки работает',
    type: 'checkbox',
    required: true,
  },
  {
    id: 'home_button',
    name: 'Кнопка Home',
    description:
      'Кнопка возврата на главный экран работает',
    type: 'checkbox',
    required: false,
  },

  // Тесты дисплея
  {
    id: 'display_red',
    name: 'Красный экран',
    description: 'Проверка красных пикселей',
    type: 'color',
    required: true,
  },
  {
    id: 'display_green',
    name: 'Зелёный экран',
    description: 'Проверка зелёных пикселей',
    type: 'color',
    required: true,
  },
  {
    id: 'display_blue',
    name: 'Синий экран',
    description: 'Проверка синих пикселей',
    type: 'color',
    required: true,
  },
  {
    id: 'display_white',
    name: 'Белый экран',
    description: 'Проверка белых пикселей',
    type: 'color',
    required: true,
  },
  {
    id: 'display_black',
    name: 'Чёрный экран',
    description: 'Проверка чёрных пикселей',
    type: 'color',
    required: true,
  },

  // Дополнительные тесты
  {
    id: 'camera_front',
    name: 'Фронтальная камера',
    description: 'Фронтальная камера работает',
    type: 'checkbox',
    required: false,
  },
  {
    id: 'camera_back',
    name: 'Основная камера',
    description: 'Основная камера работает',
    type: 'checkbox',
    required: false,
  },
  {
    id: 'speaker',
    name: 'Динамик',
    description: 'Динамик воспроизводит звук',
    type: 'checkbox',
    required: true,
  },
  {
    id: 'microphone',
    name: 'Микрофон',
    description: 'Микрофон записывает звук',
    type: 'checkbox',
    required: true,
  },
  {
    id: 'wifi',
    name: 'WiFi',
    description: 'WiFi модуль работает',
    type: 'checkbox',
    required: false,
  },
  {
    id: 'bluetooth',
    name: 'Bluetooth',
    description: 'Bluetooth модуль работает',
    type: 'checkbox',
    required: false,
  },
  {
    id: 'sim_slot',
    name: 'Слот SIM',
    description: 'Слот для SIM-карты работает',
    type: 'checkbox',
    required: true,
  },
  {
    id: 'sd_slot',
    name: 'Слот SD карты',
    description: 'Слот для SD карты работает',
    type: 'checkbox',
    required: false,
  },
  {
    id: 'battery',
    name: 'Аккумулятор',
    description: 'Аккумулятор держит заряд',
    type: 'checkbox',
    required: true,
  },
  {
    id: 'body_condition',
    name: 'Состояние корпуса',
    description: 'Оцените состояние корпуса',
    type: 'radio',
    options: [
      'Отличное',
      'Хорошее',
      'Удовлетворительное',
      'Плохое',
    ],
    required: true,
  },
  {
    id: 'screen_condition',
    name: 'Состояние экрана',
    description: 'Оцените состояние экрана',
    type: 'radio',
    options: [
      'Отличное',
      'Хорошее',
      'Удовлетворительное',
      'Плохое',
    ],
    required: true,
  },
]

// Функция для расчёта скидки на основе результатов тестов
export function calculatePriceAdjustment(
  testsResults: any[],
  basePrice: number
): number {
  let adjustment = 0

  testsResults.forEach((result) => {
    if (!result.passed) {
      switch (result.testId) {
        case 'power':
          adjustment -= basePrice * 0.3 // -30% если не включается
          break
        case 'display_red':
        case 'display_green':
        case 'display_blue':
        case 'display_white':
        case 'display_black':
          adjustment -= basePrice * 0.15 // -15% за каждый цвет
          break
        case 'volume_buttons':
        case 'power_button':
          adjustment -= basePrice * 0.1 // -10% за кнопки
          break
        case 'speaker':
        case 'microphone':
          adjustment -= basePrice * 0.05 // -5% за звук
          break
        case 'body_condition':
          if (result.value === 'Плохое')
            adjustment -= basePrice * 0.2
          else if (result.value === 'Удовлетворительное')
            adjustment -= basePrice * 0.1
          break
        case 'screen_condition':
          if (result.value === 'Плохое')
            adjustment -= basePrice * 0.25
          else if (result.value === 'Удовлетворительное')
            adjustment -= basePrice * 0.15
          break
      }
    }
  })

  return Math.max(adjustment, -basePrice * 0.8) // Максимум -80% от базовой цены
}
