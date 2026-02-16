'use client';

import { Search, MapPin, Phone, Heart, Scale, ShoppingCart, Menu, X, User, Settings, Smartphone, Hammer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SearchBar } from '@/components/features/search/SearchBar';
import { MegaMenu } from '@/components/layout/MegaMenu';
import { useRouter } from 'next/navigation';
import { useSafeArea } from '@/hooks/useSafeArea';
import { AuthModal } from '@/components/MobileApp/AuthModal';
import { useAppStore } from '@/stores/authStore';
import Link from 'next/link';
import { useState } from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';
import { isAdminTelegramId } from '@/core/lib/admin';
import Image from 'next/image';
import { useEffect } from 'react';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { useVersionCheck } from '@/hooks/useVersionCheck';

const CATEGORIES = [
  { name: 'Смартфоны', slug: 'smartphones', active: true },
  { name: 'Планшеты', slug: 'tablets', active: false },
  { name: 'Ноутбуки', slug: 'laptops', active: false },
  { name: 'Часы', slug: 'watches', active: false },
  { name: 'Наушники', slug: 'headphones', active: false },
  { name: 'Гаджеты', slug: 'gadgets', active: false },
  { name: 'Аксессуары', slug: 'accessories', active: false },
];

export const Header = () => {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { favorites } = useFavorites();
  const { getTotalItems } = useCart();
  const { username, userPhotoUrl, telegramId, logout, role } = useAppStore();
  const { count: adminNotifs } = useAdminNotifications();
  const { count: orderNotifs } = useOrderNotifications();
  const { needsUpdate, performUpdate } = useVersionCheck();
  const { isStandalone } = useSafeArea();
  const sourceParam = isStandalone ? '?source=pwa' : '';
  const router = useRouter();

  // Force check for LH admin if store seems empty but we are on LH
  useEffect(() => {
    if (typeof window !== 'undefined' && !telegramId && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      useAppStore.getState().initializeTelegram();
    }
  }, [telegramId]);

  return (
    <header className="w-full bg-white z-50 sticky top-0 shadow-sm">
      {/* Top Bar */}
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="container mx-auto px-4 h-9 flex items-center justify-between text-xs text-gray-500 font-medium relative">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 hover:text-teal-600 transition-colors">
              <MapPin className="w-3.5 h-3.5" />
              <span>Москва</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span>Магазины открыты</span>
            </div>
          </div>

          {needsUpdate && (
            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2">
              <button
                onClick={performUpdate}
                className="flex items-center gap-2 text-teal-700 hover:text-teal-800 transition-colors bg-teal-100/80 hover:bg-teal-200 px-4 py-1.5 rounded-full animate-pulse shadow-sm border border-teal-200"
              >
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                <span className="font-bold text-xs sm:text-sm tracking-wide uppercase">Доступно обновление</span>
              </button>
            </div>
          )}
          <div className="flex items-center gap-6">
            <a href="tel:+79998887766" className="flex items-center gap-1.5 hover:text-teal-600 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              <span>+7 (999) 888-77-66</span>
            </a>
            <div className="hidden sm:flex gap-4">
              <Link href="/about" className="hover:text-teal-600">О компании</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href={`/${sourceParam}`} className="flex-shrink-0">
            <div className="text-3xl font-bold tracking-tighter text-gray-900 select-none">
              QOQOS
              <span className="text-teal-500">.</span>
            </div>
          </Link>

          {/* Catalog Button */}
          <div
            className="relative"
            onMouseEnter={() => setIsCatalogOpen(true)}
            onMouseLeave={() => setIsCatalogOpen(false)}
          >
            <Button
              variant="default"
              size="lg"
              className={cn(
                "hidden lg:flex items-center gap-2 font-medium rounded-apple-lg px-6 h-12 transition-all",
                isCatalogOpen ? "bg-gray-900 hover:bg-gray-800 text-white" : "bg-teal-500 hover:bg-teal-600 text-white"
              )}
            >
              {isCatalogOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span>Каталог</span>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <SearchBar />
          </div>

          {/* Auth */}
          <div className="hidden lg:flex items-center mr-4">
            {telegramId ? (
              <div
                className="flex items-center gap-2 bg-gray-50 pl-3 pr-2 py-1.5 rounded-full border border-gray-200"
              >
                {userPhotoUrl ? (
                  <Image
                    src={userPhotoUrl}
                    alt={username || 'User'}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {(username?.[0] || telegramId?.[0] || 'U').toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                  {username || telegramId || 'Пользователь'}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    logout();
                  }}
                  className="ml-1 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  title="Выйти"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            {(!isAdminTelegramId(telegramId) && role !== 'master') ? (
              <>
                <div onClick={() => !telegramId && setShowAuthModal(true)} className="flex items-center">
                  <ActionButton
                    icon={Smartphone}
                    label="Заказы"
                    href={telegramId ? "/my-devices" : undefined}
                    count={orderNotifs}
                    badge
                  />
                </div>
                <ActionButton icon={Scale} label="Сравнить" count={0} disabled tooltip="Скоро" />
                <ActionButton icon={Heart} label="Избранное" count={favorites.length} href="/favorites" />
                <ActionButton icon={ShoppingCart} label="Корзина" count={getTotalItems()} href="/cart" badge />
              </>
            ) : (
              <ActionButton icon={Settings} label="Админ" href="/admin" count={adminNotifs} badge />
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-gray-100 hidden lg:block relative z-30 bg-white">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-8 h-12 text-sm font-medium text-gray-700">
            {CATEGORIES.map((category) => (
              category.active ? (
                <Link
                  key={category.slug}
                  href="/catalog"
                  className="hover:text-teal-600 transition-colors py-1 relative group"
                >
                  {category.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 transition-all group-hover:w-full"></span>
                </Link>
              ) : (
                <div key={category.slug} className="relative group">
                  <span className="text-gray-400 cursor-not-allowed py-1">
                    {category.name}
                  </span>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Скоро
                    </div>
                  </div>
                </div>
              )
            ))}
            <div className="ml-auto relative group">
              <span className="text-gray-400 cursor-not-allowed">Блог</span>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Скоро
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Mega Menu Overlay */}
      <div
        onMouseEnter={() => setIsCatalogOpen(true)}
        onMouseLeave={() => setIsCatalogOpen(false)}
      >
        <MegaMenu isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>
  );
};

interface ActionButtonProps {
  icon: any;
  label: string;
  count?: number;
  badge?: boolean;
  disabled?: boolean;
  tooltip?: string;
  href?: string;
}

const ActionButton = ({ icon: Icon, label, count, badge, disabled, tooltip, href }: ActionButtonProps) => {
  const content = (
    <div className="relative group">
      <div className={cn(
        "flex flex-col items-center justify-center w-16 gap-1",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      )}>
        <div className="relative">
          <Icon className={cn(
            "w-6 h-6 transition-colors",
            disabled ? "text-gray-400" : "text-gray-700 group-hover:text-teal-600"
          )} strokeWidth={1.5} />
          {count !== undefined && count > 0 && (
            <span className={cn(
              "absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white",
              badge ? "bg-teal-500" : "bg-gray-400 group-hover:bg-teal-500"
            )}>
              {count}
            </span>
          )}
        </div>
        <span className={cn(
          "text-[10px] font-medium transition-colors",
          disabled ? "text-gray-400" : "text-gray-500 group-hover:text-teal-600"
        )}>{label}</span>
      </div>
      {tooltip && disabled && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {tooltip}
          </div>
        </div>
      )}
    </div>
  );

  if (href && !disabled) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};
