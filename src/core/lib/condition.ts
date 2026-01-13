export interface ConditionOption {
  id: string
  label: string
  penalty: number
  image: string
}

export const frontConditions: ConditionOption[] = [
  {
    id: 'display_front_new',
    label: 'Новый',
    penalty: 0,
    image: 'display_front_new',
  },
  {
    id: 'display_front',
    label: 'Очень\nхорошее',
    penalty: -3,
    image: 'display_front',
  },
  {
    id: 'display_front_have_scratches',
    label: 'Заметные\nцарапины',
    penalty: -8,
    image: 'display_front_have_scratches',
  },
  {
    id: 'display_front_scratches',
    label: 'Трещины',
    penalty: -15,
    image: 'display_front_scratches',
  },
]

export const backConditions: ConditionOption[] = [
  {
    id: 'display_back_new',
    label: 'Новый',
    penalty: 0,
    image: 'display_back_new',
  },
  {
    id: 'display_back',
    label: 'Очень\nхорошее',
    penalty: -3,
    image: 'display_back',
  },
  {
    id: 'display_back_have_scratches',
    label: 'Заметные\nцарапины',
    penalty: -8,
    image: 'display_back_have_scratches',
  },
  {
    id: 'display_back_scratches',
    label: 'Трещины',
    penalty: -15,
    image: 'display_back_scratches',
  },
]

export const sideConditions: ConditionOption[] = [
  {
    id: 'display_side_new',
    label: 'Новый',
    penalty: 0,
    image: 'display_side_new',
  },
  {
    id: 'display_side',
    label: 'Очень\nхорошее',
    penalty: -3,
    image: 'display_side',
  },
  {
    id: 'display_side_have_scratches',
    label: 'Заметные\nцарапины',
    penalty: -8,
    image: 'display_side_have_scratches',
  },
  {
    id: 'display_side_scratches',
    label: 'Трещины',
    penalty: -15,
    image: 'display_side_scratches',
  },
]
