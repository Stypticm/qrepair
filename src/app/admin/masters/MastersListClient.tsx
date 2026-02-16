'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { createMaster as createMasterApi, assignMasterToPoint as assignMasterToPointApi } from '@/lib/api';
import { useAppStore } from '@/stores/authStore';
import { usePoints } from './PointsProvider';

interface Master {
  id: string;
  telegramId: string;
  username: string;
  name: string | null;
  isActive: boolean;
  pointId: number | null;
  point: {
    id: number;
    address: string;
    workingHours: string;
    name: string;
  } | null;
}

interface MastersListClientProps {
  masters: Master[];
}

export function MastersListClient({ masters: initialMasters }: MastersListClientProps) {
  const { telegramId } = useAppStore();
  const { points } = usePoints();
  const [masters, setMasters] = useState(initialMasters);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMaster, setNewMaster] = useState({
    telegramId: '',
    username: '',
    name: '',
    pointId: '',
  });

  const createMasterMutation = useMutation({
    mutationFn: createMasterApi,
    onSuccess: () => {
      setNewMaster({
        telegramId: '',
        username: '',
        name: '',
        pointId: '',
      });
      setShowAddForm(false);
      window.location.reload();
    },
    onError: (err) => {
      alert(`❌ Ошибка при создании мастера: ${err.message}`);
    },
  });

  const assignMasterMutation = useMutation({
    mutationFn: assignMasterToPointApi,
    onSuccess: (data, variables) => {
      const master = masters.find((m) => m.id === variables.masterId);
      const point = points.find((p) => p.id === variables.pointId);
      if (master && point) {
        alert(`✅ Мастер ${master.name} успешно назначен на точку "${point.address}"`);
      }
      window.location.reload();
    },
    onError: (err) => {
      alert(`❌ Ошибка при назначении мастера на точку: ${err.message}`);
    },
  });

  const handleCreateMaster = () => {
    if (!newMaster.telegramId || !newMaster.username || !newMaster.name) {
      alert('❌ Пожалуйста, заполните все обязательные поля');
      return;
    }
    const currentTelegramId =
      telegramId ||
      (typeof window !== 'undefined' ? sessionStorage.getItem('telegramId') : null);

    if (!currentTelegramId) {
      alert('❌ Ошибка: не найден Telegram ID');
      return;
    }

    createMasterMutation.mutate({
      adminTelegramId: currentTelegramId,
      telegramId: newMaster.telegramId,
      username: newMaster.username,
      name: newMaster.name,
      pointId: newMaster.pointId ? parseInt(newMaster.pointId) : null,
    });
  };

  const handleAssignMasterToPoint = (masterId: string, pointId: number) => {
    const currentTelegramId =
      telegramId ||
      (typeof window !== 'undefined' ? sessionStorage.getItem('telegramId') : null);

    if (!currentTelegramId) {
      alert('❌ Ошибка: не найден Telegram ID');
      return;
    }

    assignMasterMutation.mutate({ masterId, pointId, adminTelegramId: currentTelegramId });
  };

  const handleInputChange = (field: string, value: string) => {
    setNewMaster((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 w-fit"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>{showAddForm ? 'Отменить' : 'Добавить мастера'}</span>
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Добавить нового мастера</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID *</label>
              <input
                type="text"
                value={newMaster.telegramId}
                onChange={(e) => handleInputChange('telegramId', e.target.value)}
                placeholder="Например: 123456789"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
              <input
                type="text"
                value={newMaster.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Например: john_doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Имя мастера *</label>
              <input
                type="text"
                value={newMaster.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Например: Иван Петров"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Точка (опционально)</label>
              <select
                value={newMaster.pointId}
                onChange={(e) => handleInputChange('pointId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Не назначена</option>
                {points.map((point) => (
                  <option key={point.id} value={point.id}>
                    {point.name} ({point.address})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Отменить
            </button>
            <button
              onClick={handleCreateMaster}
              disabled={createMasterMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {createMasterMutation.isPending ? 'Создание...' : 'Создать мастера'}
            </button>
          </div>
        </div>
      )}

      {masters.map((master) => (
        <div key={master.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{master.name || 'Без имени'}</h3>
                  <p className="text-gray-500 text-sm">Мастер</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${master.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
              >
                {master.isActive ? 'Активен' : 'Неактивен'}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H8z" />
                </svg>
                <div>
                  <p className="text-gray-700 font-medium">{master.telegramId}</p>
                  <p className="text-gray-500 text-sm">User ID</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <p className="text-gray-700 font-medium">@{master.username}</p>
                  <p className="text-gray-500 text-sm">Username</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-gray-700 font-medium">{master.point ? master.point.address : 'Не назначена'}</p>
                  <p className="text-gray-500 text-sm">Текущая точка</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Назначить на точку</label>
              <div className="flex gap-2">
                <select
                  value={master.pointId || ''}
                  onChange={(e) => handleAssignMasterToPoint(master.id, parseInt(e.target.value))}
                  className="flex-grow p-2 border border-gray-300 rounded-lg text-sm"
                  disabled={assignMasterMutation.isPending}
                >
                  <option value="">Не назначена</option>
                  {points.map((point) => (
                    <option key={point.id} value={point.id}>
                      {point.name} ({point.address})
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => handleAssignMasterToPoint(master.id, master.pointId || 0)}
                  disabled={!master.pointId || assignMasterMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {assignMasterMutation.isPending ? 'Назначается...' : 'Сохранить'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
