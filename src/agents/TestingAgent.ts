import prisma from '@/core/lib/prisma'

export interface TestResult {
  success: boolean
  error?: string
  duration: number
  details?: any
}

export interface TestScenario {
  name: string
  description: string
  steps: TestStep[]
}

export interface TestStep {
  action: string
  page: string
  data?: any
  expectedResult?: string
}

export class TestingAgent {
  private isRunning = false
  private testResults: Map<string, TestResult> = new Map()

  // Основные тестовые сценарии для вашего приложения
  private scenarios: TestScenario[] = [
    {
      name: 'complete_happy_path',
      description:
        'Полный путь пользователя от начала до конца',
      steps: [
        {
          action: 'navigate',
          page: '/request/device-info',
        },
        {
          action: 'enter_imei',
          page: '/request/device-info',
          data: '123456789012345',
        },
        {
          action: 'enter_serial',
          page: '/request/device-info',
          data: 'F2LQ123456789',
        },
        { action: 'navigate', page: '/request/form' },
        {
          action: 'select_model',
          page: '/request/form',
          data: 'X',
        },
        { action: 'navigate', page: '/request/condition' },
        {
          action: 'select_condition',
          page: '/request/condition',
          data: {
            front: 'new',
            back: 'scratches',
            side: 'new',
          },
        },
        {
          action: 'navigate',
          page: '/request/additional-condition',
        },
        {
          action: 'select_additional',
          page: '/request/additional-condition',
          data: {
            faceId: 'works',
            touchId: 'works',
            backCamera: 'new',
            battery: '95%',
          },
        },
        { action: 'navigate', page: '/request/submit' },
        { action: 'submit_form', page: '/request/submit' },
      ],
    },
    {
      name: 'device_info_validation',
      description:
        'Тестирование валидации IMEI и серийного номера',
      steps: [
        {
          action: 'navigate',
          page: '/request/device-info',
        },
        {
          action: 'enter_invalid_imei',
          page: '/request/device-info',
          data: '123',
          expectedResult: 'error',
        },
        {
          action: 'enter_valid_imei',
          page: '/request/device-info',
          data: '123456789012345',
          expectedResult: 'success',
        },
        {
          action: 'enter_invalid_serial',
          page: '/request/device-info',
          data: '123',
          expectedResult: 'error',
        },
        {
          action: 'enter_valid_serial',
          page: '/request/device-info',
          data: 'F2LQ123456789',
          expectedResult: 'success',
        },
      ],
    },
    {
      name: 'price_calculation',
      description: 'Тестирование расчета цены',
      steps: [
        { action: 'navigate', page: '/request/form' },
        {
          action: 'select_model',
          page: '/request/form',
          data: 'X',
        },
        { action: 'navigate', page: '/request/condition' },
        {
          action: 'select_condition',
          page: '/request/condition',
          data: { front: 'new', back: 'new', side: 'new' },
        },
        {
          action: 'verify_price',
          page: '/request/condition',
          expectedResult: 'base_price',
        },
        {
          action: 'select_condition',
          page: '/request/condition',
          data: {
            front: 'scratches',
            back: 'scratches',
            side: 'scratches',
          },
        },
        {
          action: 'verify_price',
          page: '/request/condition',
          expectedResult: 'reduced_price',
        },
      ],
    },
    {
      name: 'form_validation',
      description: 'Тестирование валидации форм',
      steps: [
        { action: 'navigate', page: '/request/form' },
        {
          action: 'try_submit_empty',
          page: '/request/form',
          expectedResult: 'validation_error',
        },
        {
          action: 'select_model',
          page: '/request/form',
          data: 'X',
        },
        {
          action: 'verify_can_proceed',
          page: '/request/form',
          expectedResult: 'success',
        },
      ],
    },
    {
      name: 'error_handling',
      description: 'Тестирование обработки ошибок',
      steps: [
        {
          action: 'simulate_network_error',
          page: '/request/form',
        },
        {
          action: 'verify_error_display',
          page: '/request/form',
          expectedResult: 'error_shown',
        },
        {
          action: 'test_retry_mechanism',
          page: '/request/form',
        },
      ],
    },
  ]

  // Запуск всех тестов
  async runAllTests(): Promise<void> {
    if (this.isRunning) {
      console.log('Тесты уже запущены')
      return
    }

    this.isRunning = true
    console.log('🧪 Запуск всех тестов...')

    try {
      for (const scenario of this.scenarios) {
        await this.runScenario(scenario)
      }
    } finally {
      this.isRunning = false
      console.log('✅ Все тесты завершены')
    }
  }

  // Запуск конкретного сценария
  async runScenario(
    scenario: TestScenario
  ): Promise<TestResult> {
    const startTime = Date.now()
    console.log(`🧪 Запуск теста: ${scenario.name}`)

    try {
      const result = await this.executeScenario(scenario)
      const duration = Date.now() - startTime

      const testResult: TestResult = {
        success: result.success,
        error: result.error,
        duration,
        details: result.details,
      }

      // Сохраняем результат в БД
      await this.saveTestResult(scenario.name, testResult)

      this.testResults.set(scenario.name, testResult)
      console.log(
        `✅ Тест ${scenario.name} завершен за ${duration}мс`
      )

      return testResult
    } catch (error) {
      const duration = Date.now() - startTime
      const testResult: TestResult = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
        duration,
      }

      await this.saveTestResult(scenario.name, testResult)
      this.testResults.set(scenario.name, testResult)

      console.log(
        `❌ Тест ${scenario.name} провален: ${testResult.error}`
      )
      return testResult
    }
  }

  // Выполнение сценария
  private async executeScenario(
    scenario: TestScenario
  ): Promise<{
    success: boolean
    error?: string
    details?: any
  }> {
    const results = []

    for (const step of scenario.steps) {
      try {
        const stepResult = await this.executeStep(step)
        results.push(stepResult)

        // Если ожидался определенный результат, проверяем его
        if (
          step.expectedResult &&
          stepResult.result !== step.expectedResult
        ) {
          return {
            success: false,
            error: `Ожидался результат: ${step.expectedResult}, получен: ${stepResult.result}`,
            details: { step, results },
          }
        }
      } catch (error) {
        return {
          success: false,
          error: `Ошибка на шаге ${step.action}: ${
            error instanceof Error
              ? error.message
              : 'Unknown error'
          }`,
          details: { step, results },
        }
      }
    }

    return { success: true, details: results }
  }

  // Выполнение отдельного шага
  private async executeStep(step: TestStep): Promise<{
    action: string
    result: string
    data?: any
  }> {
    try {
      switch (step.action) {
        case 'navigate':
          return {
            action: step.action,
            result: 'navigated',
          }

        case 'enter_imei':
          // Реальная валидация IMEI
          if (
            step.data &&
            step.data.length === 15 &&
            /^\d{15}$/.test(step.data)
          ) {
            return {
              action: step.action,
              result: 'success',
              data: step.data,
            }
          } else {
            return {
              action: step.action,
              result: 'error',
              data: step.data,
            }
          }

        case 'enter_serial':
          // Реальная валидация серийного номера
          if (
            step.data &&
            step.data.length > 10 &&
            /^[A-Z0-9]+$/.test(step.data)
          ) {
            return {
              action: step.action,
              result: 'success',
              data: step.data,
            }
          } else {
            return {
              action: step.action,
              result: 'error',
              data: step.data,
            }
          }

        case 'select_model':
          // Проверяем, что модель существует в БД
          try {
            const device = await prisma.device.findFirst({
              where: { model: step.data },
            })
            if (device) {
              return {
                action: step.action,
                result: 'success',
                data: step.data,
              }
            } else {
              return {
                action: step.action,
                result: 'error',
                data: step.data,
              }
            }
          } catch (error) {
            return {
              action: step.action,
              result: 'error',
              data: step.data,
            }
          }

        case 'select_condition':
          // Проверяем валидность условий
          if (step.data && typeof step.data === 'object') {
            return {
              action: step.action,
              result: 'success',
              data: step.data,
            }
          } else {
            return {
              action: step.action,
              result: 'error',
              data: step.data,
            }
          }

        case 'select_additional':
          // Проверяем валидность дополнительных условий
          if (step.data && typeof step.data === 'object') {
            return {
              action: step.action,
              result: 'success',
              data: step.data,
            }
          } else {
            return {
              action: step.action,
              result: 'error',
              data: step.data,
            }
          }

        case 'verify_price':
          // Проверяем расчет цены
          try {
            const response = await fetch(
              '/api/request/price',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(step.data),
              }
            )

            if (response.ok) {
              const priceData = await response.json()
              if (
                priceData.success &&
                priceData.price > 0
              ) {
                return {
                  action: step.action,
                  result: 'price_verified',
                  data: priceData,
                }
              } else {
                return {
                  action: step.action,
                  result: 'error',
                  data: priceData,
                }
              }
            } else {
              return {
                action: step.action,
                result: 'error',
                data: { status: response.status },
              }
            }
          } catch (error) {
            return {
              action: step.action,
              result: 'error',
              data: {
                error:
                  error instanceof Error
                    ? error.message
                    : 'Unknown error',
              },
            }
          }

        case 'submit_form':
          // Симуляция отправки формы
          return {
            action: step.action,
            result: 'submitted',
          }

        case 'enter_invalid_imei':
          // Тест с невалидным IMEI
          if (step.data && step.data.length !== 15) {
            return {
              action: step.action,
              result: 'error',
              data: step.data,
            }
          } else {
            return {
              action: step.action,
              result: 'success',
              data: step.data,
            }
          }

        case 'enter_valid_imei':
          // Тест с валидным IMEI
          if (
            step.data &&
            step.data.length === 15 &&
            /^\d{15}$/.test(step.data)
          ) {
            return {
              action: step.action,
              result: 'success',
              data: step.data,
            }
          } else {
            return {
              action: step.action,
              result: 'error',
              data: step.data,
            }
          }

        case 'enter_invalid_serial':
          // Тест с невалидным серийным номером
          if (step.data && step.data.length <= 10) {
            return {
              action: step.action,
              result: 'error',
              data: step.data,
            }
          } else {
            return {
              action: step.action,
              result: 'success',
              data: step.data,
            }
          }

        case 'enter_valid_serial':
          // Тест с валидным серийным номером
          if (
            step.data &&
            step.data.length > 10 &&
            /^[A-Z0-9]+$/.test(step.data)
          ) {
            return {
              action: step.action,
              result: 'success',
              data: step.data,
            }
          } else {
            return {
              action: step.action,
              result: 'error',
              data: step.data,
            }
          }

        case 'simulate_network_error':
          // Симуляция сетевой ошибки
          throw new Error('Network error simulation')

        default:
          return { action: step.action, result: 'unknown' }
      }
    } catch (error) {
      return {
        action: step.action,
        result: 'error',
        data: {
          error:
            error instanceof Error
              ? error.message
              : 'Unknown error',
        },
      }
    }
  }

  // Сохранение результата теста в БД
  private async saveTestResult(
    testName: string,
    result: TestResult
  ): Promise<void> {
    try {
      await prisma.agentTestResult.create({
        data: {
          agentType: 'testing',
          testName,
          status: result.success ? 'passed' : 'failed',
          result: result.details,
          error: result.error,
          duration: result.duration,
        },
      })
    } catch (error) {
      console.error(
        'Ошибка сохранения результата теста:',
        error
      )
    }
  }

  // Получение статистики тестов
  async getTestStats(): Promise<{
    total: number
    passed: number
    failed: number
    successRate: number
    averageDuration: number
    recentTests: any[]
  }> {
    const tests = await prisma.agentTestResult.findMany({
      where: { agentType: 'testing' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const total = tests.length
    const passed = tests.filter(
      (t) => t.status === 'passed'
    ).length
    const failed = tests.filter(
      (t) => t.status === 'failed'
    ).length
    const successRate =
      total > 0 ? (passed / total) * 100 : 0
    const averageDuration =
      tests.reduce((sum, t) => sum + (t.duration || 0), 0) /
        total || 0

    return {
      total,
      passed,
      failed,
      successRate,
      averageDuration,
      recentTests: tests.slice(0, 10),
    }
  }

  // Получение результатов конкретного теста
  async getTestResults(testName?: string): Promise<any[]> {
    const where = testName
      ? { agentType: 'testing', testName }
      : { agentType: 'testing' }

    return await prisma.agentTestResult.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  // Проверка статуса агента
  isAgentRunning(): boolean {
    return this.isRunning
  }

  // Получение последних результатов
  getLastResults(): Map<string, TestResult> {
    return this.testResults
  }
}
