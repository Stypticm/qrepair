"use client"

import { useState } from 'react'
import { Button } from './button'
import { Checkbox } from './checkbox'
import { Label } from './label'

interface ColorScreenTestProps {
  testId: string
  color: string
  colorName: string
  onResult: (testId: string, passed: boolean, notes?: string) => void
  required?: boolean
}

const colorStyles = {
  red: 'bg-red-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  white: 'bg-white',
  black: 'bg-black'
}

export function ColorScreenTest({ testId, color, colorName, onResult, required = false }: ColorScreenTestProps) {
  const [passed, setPassed] = useState<boolean | null>(null)
  const [notes, setNotes] = useState('')

  const handleResult = (value: boolean) => {
    setPassed(value)
    onResult(testId, value, notes)
  }

  const handleFail = () => {
    setPassed(false)
    onResult(testId, false, notes)
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold text-center">
        Тест: {colorName} экран
      </h3>
      
      <div 
        className={`w-64 h-48 rounded-lg border-2 border-gray-300 ${colorStyles[color as keyof typeof colorStyles]}`}
        style={{ backgroundColor: color === 'white' ? '#ffffff' : color === 'black' ? '#000000' : undefined }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <span className={`text-lg font-bold ${color === 'white' || color === 'black' ? 'text-gray-600' : 'text-white'}`}>
            {colorName.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        <Label className="text-sm font-medium">
          Проверьте экран на наличие дефектов пикселей
        </Label>
        
        <div className="flex gap-4 justify-center">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${testId}-pass`}
              checked={passed === true}
              onCheckedChange={(checked) => handleResult(checked === true)}
            />
            <Label htmlFor={`${testId}-pass`}>Работает</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${testId}-fail`}
              checked={passed === false}
              onCheckedChange={(checked) => {
                if (checked === true) {
                  handleFail()
                }
              }}
            />
            <Label htmlFor={`${testId}-fail`}>Не работает</Label>
          </div>
        </div>

        {required && (
          <p className="text-xs text-red-500 text-center">
            * Обязательный тест
          </p>
        )}

        <div className="mt-2">
          <Label htmlFor={`${testId}-notes`} className="text-sm">
            Заметки (необязательно)
          </Label>
          <textarea
            id={`${testId}-notes`}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value)
              if (passed !== null) {
                onResult(testId, passed, e.target.value)
              }
            }}
            className="w-full mt-1 p-2 border rounded text-sm"
            placeholder="Опишите найденные дефекты..."
            rows={2}
          />
        </div>
      </div>
    </div>
  )
}


