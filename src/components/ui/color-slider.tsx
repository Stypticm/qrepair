"use client"

import { useState, useEffect } from 'react'
import { Button } from './button'
import { Checkbox } from './checkbox'
import { Label } from './label'

interface ColorSliderProps {
  onResult: (testId: string, passed: boolean, notes?: string) => void
  onComplete: () => void
}

const colorTests = [
  { id: 'display_red', name: 'Красный экран', color: 'red' },
  { id: 'display_green', name: 'Зелёный экран', color: 'green' },
  { id: 'display_blue', name: 'Синий экран', color: 'blue' },
  { id: 'display_white', name: 'Белый экран', color: 'white' },
  { id: 'display_black', name: 'Чёрный экран', color: 'black' },
]

const colorStyles = {
  red: 'bg-red-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  white: 'bg-white',
  black: 'bg-black'
}

export function ColorSlider({ onResult, onComplete }: ColorSliderProps): JSX.Element {
  const [currentColorIndex, setCurrentColorIndex] = useState(0)
  const [results, setResults] = useState<Record<string, { passed: boolean | null, notes: string }>>({})
  const [notes, setNotes] = useState('')

  const currentColor = colorTests[currentColorIndex]

  // Сброс состояния при изменении цвета
  useEffect(() => {
    setNotes('')
  }, [currentColorIndex])

  const handleResult = (passed: boolean) => {
    const newResults = {
      ...results,
      [currentColor.id]: { passed, notes }
    }
    setResults(newResults)
    onResult(currentColor.id, passed, notes)

    // Если это последний цвет, завершаем
    if (currentColorIndex === colorTests.length - 1) {
      onComplete()
    } else {
      // Переходим к следующему цвету
      setCurrentColorIndex(currentColorIndex + 1)
    }
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentColorIndex < colorTests.length - 1) {
      setCurrentColorIndex(currentColorIndex + 1)
    } else if (direction === 'right' && currentColorIndex > 0) {
      setCurrentColorIndex(currentColorIndex - 1)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 border border-gray-600 rounded-lg bg-gray-800 min-h-screen">
      <h3 className="text-lg font-semibold text-center text-white">
        Тест: {currentColor.name}
      </h3>
      
      <div 
        className={`w-full h-screen rounded-lg border-2 border-gray-300 ${colorStyles[currentColor.color as keyof typeof colorStyles]}`}
        style={{ backgroundColor: currentColor.color === 'white' ? '#ffffff' : currentColor.color === 'black' ? '#000000' : undefined }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <span className={`text-lg font-bold ${currentColor.color === 'white' || currentColor.color === 'black' ? 'text-gray-600' : 'text-white'}`}>
            {currentColor.name.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        <Label className="text-sm font-medium text-white">
          Проверьте экран на наличие дефектов пикселей
        </Label>
        
        <div className="flex gap-4 justify-center">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${currentColor.id}-pass`}
              checked={results[currentColor.id]?.passed === true}
              onCheckedChange={(checked) => {
                if (checked === true) {
                  handleResult(true)
                }
              }}
            />
            <Label htmlFor={`${currentColor.id}-pass`} className="text-white">Работает</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${currentColor.id}-fail`}
              checked={results[currentColor.id]?.passed === false}
              onCheckedChange={(checked) => {
                if (checked === true) {
                  handleResult(false)
                }
              }}
            />
            <Label htmlFor={`${currentColor.id}-fail`} className="text-white">Не работает</Label>
          </div>
        </div>

        <div className="mt-2">
          <Label htmlFor={`${currentColor.id}-notes`} className="text-sm text-white">
            Заметки (необязательно)
          </Label>
          <textarea
            id={`${currentColor.id}-notes`}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value)
              if (results[currentColor.id]?.passed !== null) {
                onResult(currentColor.id, results[currentColor.id].passed!, e.target.value)
              }
            }}
            className="w-full mt-1 p-2 border border-gray-600 rounded text-sm bg-gray-700 text-white"
            placeholder="Опишите найденные дефекты..."
            rows={2}
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={() => handleSwipe('right')}
            disabled={currentColorIndex === 0}
            variant="outline"
            className="border-gray-600 text-black hover:bg-gray-700"
          >
            ← Предыдущий
          </Button>
          
          <span className="text-sm text-white">
            {currentColorIndex + 1} / {colorTests.length}
          </span>
          
          <Button
            onClick={() => handleSwipe('left')}
            disabled={currentColorIndex === colorTests.length - 1}
            variant="outline"
            className="border-gray-600 text-black hover:bg-gray-700"
          >
            Следующий →
          </Button>
        </div>
      </div>
    </div>
  )
}
