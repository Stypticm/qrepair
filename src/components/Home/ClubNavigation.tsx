'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Boxes, House, MessageCircle, UserRound, Settings } from 'lucide-react';
import { useAppStore } from '@/stores/authStore';
import { isAdminTelegramId } from '@/core/lib/admin';

export function ClubNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const openChat = () => window.dispatchEvent(new CustomEvent('toggleChat'));

  const isActive = (path: string) => pathname === path;
  const isStartsWith = (prefix: string) => pathname?.startsWith(prefix);

  const telegramId = useAppStore(state => state.telegramId);
  const role = useAppStore(state => state.role);
  const isAdmin = isAdminTelegramId(telegramId) || role === 'master';

  return (
    <nav className="club-home__nav" aria-label="Основная навигация">
      <Link href="/" className={isActive('/') ? 'is-active' : ''} aria-label="Главная"><House size={20} /><span>Главная</span></Link>
      <Link href="/catalog" className={isStartsWith('/catalog') ? 'is-active' : ''} aria-label="Каталог"><Boxes size={20} /><span>Каталог</span></Link>
      <div className="club-home__nav-logo" aria-label="Логотип Qoqos"><span>QØ</span></div>
      <Link href="#" onClick={(e) => { e.preventDefault(); openChat(); }} className="" aria-label="Чат">
        <MessageCircle size={20} /><span>Чат</span>
      </Link>
      <Link
        href={isAdmin ? "/admin" : "/my-devices"}
        className={isStartsWith(isAdmin ? '/admin' : '/my-devices') ? 'is-active' : ''}
        aria-label={isAdmin ? "Админ" : "Профиль"}
      >
        {isAdmin ? <Settings size={20} /> : <UserRound size={20} />}
        <span>{isAdmin ? "Админ" : "Профиль"}</span>
      </Link>
    </nav>
  );
}
