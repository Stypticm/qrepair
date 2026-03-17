export interface ColorInfo {
  name: string
  hex: string
}

export const IPHONE_COLOR_MAP: Record<string, ColorInfo> = {
  'G': { name: 'Золотой', hex: '#FFD700' },
  'R': { name: 'Красный', hex: '#FF0000' },
  'Bl': { name: 'Синий', hex: '#007AFF' },
  'Wh': { name: 'Белый', hex: '#FFFFFF' },
  'C': { name: 'Чёрный', hex: '#000000' },
  'Gold': { name: 'Золотой', hex: '#FFD700' },
  'Red': { name: 'Красный', hex: '#FF0000' },
  'Blue': { name: 'Синий', hex: '#007AFF' },
  'White': { name: 'Белый', hex: '#FFFFFF' },
  'Black': { name: 'Чёрный', hex: '#000000' },
  'Space Gray': { name: 'Серый космос', hex: '#1C1C1E' },
  'Silver': { name: 'Серебряный', hex: '#C0C0C0' },
  'Natural Titanium': { name: 'Натуральный титан', hex: '#8E8E93' },
  'Blue Titanium': { name: 'Синий титан', hex: '#007AFF' },
  'White Titanium': { name: 'Белый титан', hex: '#F2F2F7' },
  'Black Titanium': { name: 'Черный титан', hex: '#1C1C1E' },
  'Desert Titanium': { name: 'Пустынный титан', hex: '#C5B4A2' },
  'Ultramarine': { name: 'Ультрамарин', hex: '#3C5B9E' },
  'Teal': { name: 'Бирюзовый', hex: '#86A9A8' },
  'Pink': { name: 'Розовый', hex: '#FADADD' },
}

export const getDeviceColor = (color: string): ColorInfo => {
  return IPHONE_COLOR_MAP[color] || { name: color, hex: '#808080' }
}
