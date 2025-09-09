'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, BarChart3 } from 'lucide-react';
import { Page } from '@/components/Page';

export default function AdminPage() {
  const router = useRouter();

  const adminSections = [
    {
      id: 'masters',
      title: 'Управление мастерами',
      description: 'Добавление, редактирование и удаление мастеров',
      icon: Users,
      color: 'bg-teal-500'
    },
    {
      id: 'requests',
      title: 'Заявки',
      description: 'Просмотр и управление заявками',
      icon: BarChart3,
      color: 'bg-purple-500'
    }
  ];

  const handleSectionClick = (sectionId: string) => {
    if (sectionId === 'masters') {
      router.push('/admin/masters');
    } else if (sectionId === 'requests') {
      router.push('/admin/requests');
    }
  };

  return (
    <Page back={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Заголовок */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Админ-панель</h1>
                  <p className="text-gray-600">Управление системой</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Админ
              </Badge>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="max-w-4xl mx-auto p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Управление системой</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {adminSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <Card
                      key={section.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                      onClick={() => handleSectionClick(section.id)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${section.color} text-white shadow-lg`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold text-gray-900">{section.title}</CardTitle>
                            <p className="text-gray-600 text-sm mt-1">{section.description}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Нажмите для перехода</span>
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}