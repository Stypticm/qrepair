export const repairSteps = [
  { path: '/repair/brand', currentStep: 0 },
  { path: '/repair/crash', currentStep: 1 },
  { path: '/repair/photos', currentStep: 2 },
  { path: '/repair/summary', currentStep: 3 },
]

export const crashOptions = [
  {
    value: 'displayCrash',
    label: 'Поломка дисплея',
    checked: false,
  },
  {
    value: 'batteryCrash',
    label: 'Поломка батареи',
    checked: false,
  },
  {
    value: 'cameraCrash',
    label: 'Поломка камеры',
    checked: false,
  },
  {
    value: 'waterCrash',
    label: 'Поломка от воды',
    checked: false,
  },
]

export const pictures = [
  {
    name: 'Фото 1',
    alt: 'picture1',
  },
  {
    name: 'Фото 2',
    alt: 'picture2',
  },
]
