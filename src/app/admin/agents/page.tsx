'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bot, BarChart3, RefreshCw, Mic, MicOff, Volume2, ArrowLeft } from 'lucide-react';

interface TestStats {
  total: number;
  passed: number;
  failed: number;
  successRate: number;
  averageDuration: number;
  recentTests: any[];
}

interface UXStats {
  totalSessions: number;
  completionRate: number;
  averageSessionDuration: number;
  topDropOffPages: Array<{ page: string; count: number }>;
  errorRate: number;
}

interface Recommendation {
  id: string;
  priority: string;
  category: string;
  title: string;
  description: string;
  solution: string;
  status: string;
  page?: string;
  createdAt: string;
}

export default function AgentsAdminPage() {
  const router = useRouter();
  const [testStats, setTestStats] = useState<TestStats | null>(null);
  const [uxStats, setUxStats] = useState<UXStats | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningTests, setRunningTests] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceHistory, setVoiceHistory] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Загружаем статистику тестов
      const testResponse = await fetch('/api/agents/testing/stats');
      const testData = await testResponse.json();
      if (testData.success) {
        setTestStats(testData.stats);
      }

      // Загружаем статистику UX
      const uxResponse = await fetch('/api/agents/ux/stats');
      const uxData = await uxResponse.json();
      if (uxData.success) {
        setUxStats(uxData.stats);
      }

      // Загружаем рекомендации
      const recResponse = await fetch('/api/agents/recommendations');
      const recData = await recResponse.json();
      if (recData.success) {
        setRecommendations(recData.recommendations);
      }

      // Загружаем историю голосовых команд
      const voiceResponse = await fetch('/api/agents/voice/history');
      const voiceData = await voiceResponse.json();
      if (voiceData.success) {
        setVoiceHistory(voiceData.history);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setRunningTests(true);
    try {
      const response = await fetch('/api/agents/testing/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        await loadData(); // Перезагружаем данные
      }
    } catch (error) {
      console.error('Ошибка запуска тестов:', error);
    } finally {
      setRunningTests(false);
    }
  };

  const toggleVoiceAgent = async () => {
    try {
      if (voiceListening) {
        const response = await fetch('/api/agents/voice/stop', {
          method: 'POST',
        });
        if (response.ok) {
          setVoiceListening(false);
        }
      } else {
        const response = await fetch('/api/agents/voice/start', {
          method: 'POST',
        });
        if (response.ok) {
          setVoiceListening(true);
        }
      }
    } catch (error) {
      console.error('Ошибка управления голосовым агентом:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка данных агентов...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок с навигацией */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/admin')}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад к админке
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Bot className="w-6 h-6 text-green-500" />
                  ИИ Агенты
                </h1>
                <p className="text-gray-600">Мониторинг тестировщика, UX аналитики и других агентов</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Активен
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">

        {/* Кнопки управления */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button 
            onClick={runAllTests} 
            disabled={runningTests}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            size="sm"
          >
            <Bot className="w-4 h-4" />
            {runningTests ? 'Запуск...' : 'Запустить тесты'}
          </Button>
          <Button 
            onClick={loadData} 
            variant="outline"
            className="flex items-center gap-2"
            size="sm"
          >
            <RefreshCw className="w-4 h-4" />
            Обновить
          </Button>
          <Button 
            onClick={toggleVoiceAgent}
            className={`flex items-center gap-2 ${voiceListening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            size="sm"
          >
            {voiceListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {voiceListening ? 'Остановить' : 'Голос'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Статистика тестировщика */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧪 Тестировщик Агент
                <Badge variant="outline">Активен</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Всего тестов</p>
                      <p className="text-2xl font-bold">{testStats.total}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Успешных</p>
                      <p className="text-2xl font-bold text-green-600">{testStats.passed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Проваленных</p>
                      <p className="text-2xl font-bold text-red-600">{testStats.failed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Среднее время</p>
                      <p className="text-2xl font-bold">{testStats.averageDuration.toFixed(0)}мс</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Процент успеха</p>
                    <Progress value={testStats.successRate} className="h-2" />
                    <p className="text-sm text-gray-600 mt-1">{testStats.successRate.toFixed(1)}%</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Последние тесты</p>
                    <div className="space-y-2">
                      {testStats.recentTests.slice(0, 5).map((test, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{test.testName}</span>
                          <Badge 
                            className={test.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {test.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Нет данных о тестах</p>
              )}
            </CardContent>
          </Card>

          {/* Статистика UX аналитики */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 UX Аналитик Агент
                <Badge variant="outline">Активен</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uxStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Всего сессий</p>
                      <p className="text-2xl font-bold">{uxStats.totalSessions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Завершенных</p>
                      <p className="text-2xl font-bold text-green-600">{uxStats.completionRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Среднее время</p>
                      <p className="text-2xl font-bold">{(uxStats.averageSessionDuration / 1000).toFixed(1)}с</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ошибок</p>
                      <p className="text-2xl font-bold text-red-600">{uxStats.errorRate.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Топ страниц выхода</p>
                    <div className="space-y-1">
                      {uxStats.topDropOffPages.map((page, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{page.page}</span>
                          <Badge variant="outline">{page.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Нет данных о UX</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Голосовой агент */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎤 Голосовой Агент
              <Badge variant="outline" className={voiceListening ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {voiceListening ? 'Слушает' : 'Остановлен'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm">Команд выполнено: {voiceHistory.length}</span>
                </div>
                <Button 
                  onClick={toggleVoiceAgent}
                  size="sm"
                  className={voiceListening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                >
                  {voiceListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                  {voiceListening ? 'Остановить' : 'Начать слушать'}
                </Button>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Доступные команды:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span>• &quot;показать статистику&quot;</span>
                  <span>• &quot;запустить тесты&quot;</span>
                  <span>• &quot;показать рекомендации&quot;</span>
                  <span>• &quot;обновить данные&quot;</span>
                  <span>• &quot;показать ошибки&quot;</span>
                  <span>• &quot;помощь&quot;</span>
                </div>
              </div>

              {voiceHistory.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Последние команды:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {voiceHistory.slice(0, 5).map((cmd, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                        <span>{cmd.command}</span>
                        <span className="text-gray-500">
                          {new Date(cmd.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Рекомендации */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💡 Рекомендации агентов
              <Badge variant="outline">{recommendations.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                        <Badge className={getStatusColor(rec.status)}>
                          {rec.status}
                        </Badge>
                        <span className="text-sm text-gray-500">{rec.category}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-1">{rec.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                      <strong>Решение:</strong> {rec.solution}
                    </p>
                    {rec.page && (
                      <p className="text-xs text-gray-500 mt-1">Страница: {rec.page}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Нет рекомендаций</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
