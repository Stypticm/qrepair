import {
  frontConditions,
  backConditions,
  sideConditions,
} from './condition'
import {
  faceIdConditions,
  backCameraConditions,
  batteryConditions,
} from './additionalCondition'

// Получаем все изображения для страницы condition
export function getConditionImages(): string[] {
  const allConditions = [
    ...frontConditions,
    ...backConditions,
    ...sideConditions,
  ]

  return allConditions.map((condition) => condition.image)
}

// Получаем все изображения для страницы additional-condition
export function getAdditionalConditionImages(): string[] {
  const allConditions = [
    ...faceIdConditions,
    ...backCameraConditions,
    ...batteryConditions,
  ]

  return allConditions.map((condition) => condition.image)
}

// Получаем все изображения для обеих страниц
export function getAllConditionImages(): string[] {
  return [
    ...getConditionImages(),
    ...getAdditionalConditionImages(),
  ]
}

// Получаем изображения по приоритету (сначала самые важные)
export function getPriorityImages(): string[] {
  // Сначала загружаем самые часто используемые изображения
  return [
    'display_front_new',
    'display_front',
    'display_back_new',
    'display_back',
    'face_id_work',
    'battery_95',
  ]
}

// Получаем изображения для предзагрузки на главной странице
export function getHomePagePreloadImages(): string[] {
  return getPriorityImages()
}
