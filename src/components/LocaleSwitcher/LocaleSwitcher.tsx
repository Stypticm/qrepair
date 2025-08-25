'use client';

import { Select } from '@telegram-apps/telegram-ui';
import { FC, useState, useEffect } from 'react';

import { localesMap } from '@/core/i18n/config';
import { setLocale } from '@/core/i18n/locale';
import { Locale } from '@/core/i18n/types';

export const LocaleSwitcher: FC = () => {
  const [locale, setCurrentLocale] = useState('en');

  useEffect(() => {
    // Получаем текущую локаль из localStorage или cookie
    const savedLocale = localStorage.getItem('NEXT_LOCALE') || 'en';
    setCurrentLocale(savedLocale);
  }, []);

  const onChange = (value: string) => {
    const newLocale = value as Locale;
    setCurrentLocale(newLocale);
    localStorage.setItem('NEXT_LOCALE', newLocale);
    setLocale(newLocale);
  };

  return (
    <Select value={locale} onChange={({ target }) => onChange(target.value)}>
      {localesMap.map((locale) => (
        <option key={locale.key} value={locale.key}>{locale.title}</option>
      ))}
    </Select>
  );
};
