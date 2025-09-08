'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, BarChart3, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface QuickStats {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalSessions: number;
  completionRate: number;
  recommendations: number;
}

export function AdminAgentsWidget() {
  const router = useRouter();
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuickStats();
  }, []);

  const loadQuickStats = async () => {
    try {
      // Загружаем статистику тестов
      const testResponse = await fetch('/api/agents/testing/stats');
      const testData = await testResponse.json();
      
      // Загружаем статистику UX
      const uxResponse = await fetch('/api/agents/ux/stats');
      const uxData = await uxResponse.json();
      
      // Загружаем рекомендации
      const recResponse = await fetch('/api/agents/recommendations');
      const recData = await recResponse.json();

      setStats({
        totalTests: testData.success ? testData.stats.total : 0,
        passedTests: testData.success ? testData.stats.passed : 0,
        failedTests: testData.success ? testData.stats.failed : 0,
        totalSessions: uxData.success ? uxData.stats.totalSessions : 0,
        completionRate: uxData.success ? uxData.stats.completionRate : 0,
        recommendations: recData.success ? recData.recommendations.length : 0
      });
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (rate: number) => {
    if (rate >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (rate >= 60) return <Clock className="w-4 h-4 text-yellow-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-green-500" />
            ИИ Агенты
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Загрузка...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-green-500" />
            ИИ Агенты
          </CardTitle>
          <Button
            onClick={() => router.push('/admin/agents')}
            size="sm"
            variant="outline"
          >
            Открыть
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Статистика тестов */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Bot className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Тесты</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {stats?.totalTests || 0}
            </div>
            <div className="text-xs text-blue-600">
              {stats?.passedTests || 0} успешных
            </div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BarChart3 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">UX</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {stats?.totalSessions || 0}
            </div>
            <div className="text-xs text-green-600">
              {stats?.completionRate.toFixed(1) || 0}% завершено
            </div>
          </div>
        </div>

        {/* Статус системы */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(stats?.completionRate || 0)}
            <span className="text-sm font-medium">Статус системы</span>
          </div>
          <Badge 
            className={`${
              (stats?.completionRate || 0) >= 80 
                ? 'bg-green-100 text-green-800' 
                : (stats?.completionRate || 0) >= 60
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {(stats?.completionRate || 0) >= 80 ? 'Отлично' : 
             (stats?.completionRate || 0) >= 60 ? 'Хорошо' : 'Требует внимания'}
          </Badge>
        </div>

        {/* Рекомендации */}
        {stats && stats.recommendations > 0 && (
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                Рекомендаций
              </span>
            </div>
            <Badge className="bg-orange-100 text-orange-800">
              {stats.recommendations}
            </Badge>
          </div>
        )}

        {/* Быстрые действия */}
        <div className="flex gap-2">
          <Button
            onClick={() => router.push('/admin/agents')}
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Bot className="w-4 h-4 mr-1" />
            Управление
          </Button>
          <Button
            onClick={loadQuickStats}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Обновить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
