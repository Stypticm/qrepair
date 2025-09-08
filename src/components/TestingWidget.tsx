'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'running';
  duration?: number;
  error?: string;
}

export function TestingWidget() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState(0);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);

    try {
      const response = await fetch('/api/agents/testing/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (response.ok) {
        // Симуляция прогресса
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsRunning(false);
              return 100;
            }
            return prev + 10;
          });
        }, 200);

        // Загружаем результаты
        setTimeout(async () => {
          const statsResponse = await fetch('/api/agents/testing/stats');
          const statsData = await statsResponse.json();
          
          if (statsData.success) {
            setResults(statsData.stats.recentTests.map((test: any) => ({
              testName: test.testName,
              status: test.status,
              duration: test.duration,
              error: test.error
            })));
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Ошибка запуска тестов:', error);
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Автотестировщик
          {isRunning && <Badge className="bg-blue-100 text-blue-800">Запущен</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Запуск тестов...' : 'Запустить тесты'}
        </Button>

        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Прогресс</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Результаты тестов:</h4>
            <div className="space-y-1">
              {results.map((result, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm">{result.testName}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                    {result.duration && (
                      <span className="text-xs text-gray-500">
                        {result.duration}мс
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
