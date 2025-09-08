import { NextRequest, NextResponse } from 'next/server';
import { TestingAgent } from '@/agents/TestingAgent';

export async function POST(request: NextRequest) {
  try {
    const { testName } = await request.json();
    const testingAgent = new TestingAgent();

    if (testName) {
      // Запуск конкретного теста
      const scenario = testingAgent['scenarios'].find(s => s.name === testName);
      if (!scenario) {
        return NextResponse.json(
          { success: false, error: 'Test not found' },
          { status: 404 }
        );
      }

      const result = await testingAgent.runScenario(scenario);
      return NextResponse.json({
        success: true,
        result
      });
    } else {
      // Запуск всех тестов
      await testingAgent.runAllTests();
      return NextResponse.json({
        success: true,
        message: 'All tests completed'
      });
    }
  } catch (error) {
    console.error('Error running tests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run tests' },
      { status: 500 }
    );
  }
}
