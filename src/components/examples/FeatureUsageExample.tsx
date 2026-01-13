import React from 'react';
import { FeatureGate, useFeature } from '@/components/FeatureGate';
import { useFeatureFlags } from '@/stores/authStore';

// Пример 1: Условный рендеринг компонента
export const NewUIExample = () => {
  return (
    <FeatureGate feature="NEW_UI">
      <div className="bg-blue-100 p-4 rounded-lg">
        <h3>Новый интерфейс</h3>
        <p>Этот компонент виден только тестерам!</p>
      </div>
    </FeatureGate>
  );
};

// Пример 2: Условный рендеринг с fallback
export const BetaFeatureExample = () => {
  return (
    <FeatureGate 
      feature="BETA_FEATURES" 
      fallback={<div>Функция в разработке</div>}
    >
      <div className="bg-green-100 p-4 rounded-lg">
        <h3>Бета-функция</h3>
        <p>Доступна только для тестеров!</p>
      </div>
    </FeatureGate>
  );
};

// Пример 3: Использование хука
export const DebugInfoExample = () => {
  const showDebug = useFeature('DEBUG_MODE');
  
  return (
    <div>
      <h3>Основной контент</h3>
      {showDebug && (
        <div className="mt-4 p-2 bg-yellow-100 text-xs">
          <p>Debug info: {new Date().toISOString()}</p>
          <p>User ID: {window.location.href}</p>
        </div>
      )}
    </div>
  );
};

// Пример 4: Получение всех активных флагов
export const ActiveFeaturesExample = () => {
  const { getActiveFeatures, isTester, isAdmin } = useFeatureFlags();
  const activeFeatures = getActiveFeatures();
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3>Активные функции</h3>
      <p>Тестер: {isTester() ? 'Да' : 'Нет'}</p>
      <p>Админ: {isAdmin() ? 'Да' : 'Нет'}</p>
      <ul>
        {activeFeatures.map(feature => (
          <li key={feature}>- {feature}</li>
        ))}
      </ul>
    </div>
  );
};
