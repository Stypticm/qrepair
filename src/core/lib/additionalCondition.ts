export interface AdditionalConditionOption {
  id: string
  label: string
  penalty: number
  image: string
}

// Face ID условия (работает/не работает)
export const faceIdConditions: AdditionalConditionOption[] = [
  {
    id: 'face_id_work',
    label: 'Работает',
    penalty: 0,
    image: 'face_id_work',
  },
  {
    id: 'face_id_not_work',
    label: 'Не работает',
    penalty: -10,
    image: 'face_id_not_work',
  },
]

// Touch ID условия (работает/не работает)
export const touchIdConditions: AdditionalConditionOption[] = [
  {
    id: 'touch_id_work',
    label: 'Работает',
    penalty: 0,
    image: 'touch_id_work',
  },
  {
    id: 'touch_id_not_work',
    label: 'Не работает',
    penalty: -8,
    image: 'touch_id_not_work',
  },
]

// Задняя камера условия (4 уровня как в condition)
export const backCameraConditions: AdditionalConditionOption[] = [
  {
    id: 'back_camera_new',
    label: 'Новая',
    penalty: 0,
    image: 'back_camera_new',
  },
  {
    id: 'back_camera',
    label: 'Очень\nхорошее',
    penalty: -2,
    image: 'back_camera',
  },
  {
    id: 'back_camera_have_scratches',
    label: 'Заметные\nцарапины',
    penalty: -5,
    image: 'back_camera_have_scratches',
  },
  {
    id: 'back_camera_scratches',
    label: 'Сильные\nповреждения',
    penalty: -12,
    image: 'back_camera_scratches',
  },
]

// Батарея условия (проценты)
export const batteryConditions: AdditionalConditionOption[] = [
  {
    id: 'battery_95',
    label: '95%',
    penalty: 0,
    image: 'battery_95',
  },
  {
    id: 'battery_90',
    label: '90%',
    penalty: -2,
    image: 'battery_90',
  },
  {
    id: 'battery_85',
    label: '85%',
    penalty: -5,
    image: 'battery_85',
  },
  {
    id: 'battery_75',
    label: '75%',
    penalty: -10,
    image: 'battery_75',
  },
]

// Функция для получения текстового описания состояния
export const getAdditionalConditionText = (conditionId: string): string => {
  const allConditions = [
    ...faceIdConditions,
    ...touchIdConditions,
    ...backCameraConditions,
    ...batteryConditions,
  ];
  
  const condition = allConditions.find(c => c.id === conditionId);
  return condition ? condition.label : conditionId;
};

// Функция для получения penalty по conditionId
export const getAdditionalConditionPenalty = (conditionId: string): number => {
  const allConditions = [
    ...faceIdConditions,
    ...touchIdConditions,
    ...backCameraConditions,
    ...batteryConditions,
  ];
  
  const condition = allConditions.find(c => c.id === conditionId);
  return condition ? condition.penalty : 0;
};
