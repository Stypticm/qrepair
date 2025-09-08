'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bot, BarChart3, Settings, Users, Database } from 'lucide-react';
import { AdminAgentsWidget } from '@/components/AdminAgentsWidget';
import VoiceAgentWidget from '@/components/VoiceAgentWidget';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const adminSections = [
    {
      id: 'overview',
      title: 'Обзор',
      description: 'Общая статистика и быстрый доступ',
      icon: BarChart3,
      color: 'bg-blue-500'
    },
    {
      id: 'agents',
      title: 'ИИ Агенты',
      description: 'Тестировщик, UX аналитика, мониторинг',
      icon: Bot,
      color: 'bg-green-500'
    },
    {
      id: 'users',
      title: 'Пользователи',
      description: 'Управление пользователями и заявками',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      id: 'database',
      title: 'База данных',
      description: 'Просмотр данных и статистики',
      icon: Database,
      color: 'bg-orange-500'
    },
    {
      id: 'settings',
      title: 'Настройки',
      description: 'Конфигурация системы',
      icon: Settings,
      color: 'bg-gray-500'
    }
  ];

  const handleSectionClick = (sectionId: string) => {
    if (sectionId === 'agents') {
      router.push('/admin/agents');
    } else {
      setActiveTab(sectionId);
    }
  };

  const goBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={goBack}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Админ-панель</h1>
                <p className="text-gray-600">Управление системой и мониторинг</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Админ
            </Badge>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Быстрый доступ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <Card
                      key={section.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleSectionClick(section.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${section.color} text-white`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm">{section.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Виджет агентов */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">ИИ Агенты</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdminAgentsWidget />
                <VoiceAgentWidget />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Дополнительная статистика */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      Системная статистика
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Статус системы</span>
                      <Badge className="bg-green-100 text-green-800">Онлайн</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Время работы</span>
                      <span className="text-sm text-gray-600">24/7</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Последнее обновление</span>
                      <span className="text-sm text-gray-600">Только что</span>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Быстрые действия */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-green-500" />
                      Быстрые действия
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={() => router.push('/admin/agents')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      Управление агентами
                    </Button>
                    <Button 
                      onClick={() => window.location.reload()}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Обновить данные
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Управление пользователями</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">Функционал управления пользователями будет добавлен позже.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">База данных</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">Функционал просмотра базы данных будет добавлен позже.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Настройки системы</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">Функционал настроек будет добавлен позже.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}