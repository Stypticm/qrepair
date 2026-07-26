'use client';

import { Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export const SearchBar = () => {
  const router = useRouter();
  const [scope, setScope] = useState<'all' | 'catalog'>('all');
  const [isFocused, setIsFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (!query.trim()) return;

    // Redirect to catalog with search query
    const params = new URLSearchParams();
    params.set('q', query);
    if (scope === 'catalog') {
      params.set('scope', 'catalog');
    }
    router.push(`/catalog?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={cn(
      "relative flex items-center w-full h-12 bg-input rounded-apple-lg border-2 border-transparent transition-all duration-200 dark:bg-transparent",
      isFocused ? "border-accent bg-surface-elevated dark:bg-transparent ring-4 ring-accent/15" : "hover:bg-surface dark:hover:bg-white/5"
    )}>
      <Search className={cn(
        "w-5 h-5 ml-4 mr-3 transition-colors",
        isFocused ? "text-accent-deep" : "text-muted"
      )} />

      <input
        type="text"
        placeholder="Поиск товаров (например, iPhone 15 Pro)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-foreground placeholder:text-muted h-full"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      <div className="hidden lg:block h-6 w-px bg-border mx-2"></div>

      <div className="hidden lg:block relative h-full">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
          className="flex items-center gap-2 px-4 h-full text-xs font-semibold text-muted hover:text-accent-deep sm:w-[140px] justify-between transition-colors"
        >
          <span>{scope === 'all' ? 'По всему сайту' : 'По каталогу'}</span>
          <ChevronDown className={cn(
            "w-3.5 h-3.5 opacity-50 transition-transform",
            isDropdownOpen && "rotate-180"
          )} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-40 bg-surface-elevated border border-border rounded-xl shadow-lg overflow-hidden z-50">
            <button
              onClick={() => {
                setScope('all');
                setIsDropdownOpen(false);
              }}
              className={cn(
                "w-full px-4 py-2.5 text-left text-sm font-medium transition-colors",
                scope === 'all' ? "bg-accent/15 text-accent-deep" : "text-foreground hover:bg-surface"
              )}
            >
              По всему сайту
            </button>
            <button
              onClick={() => {
                setScope('catalog');
                setIsDropdownOpen(false);
              }}
              className={cn(
                "w-full px-4 py-2.5 text-left text-sm font-medium transition-colors",
                scope === 'catalog' ? "bg-accent/15 text-accent-deep" : "text-foreground hover:bg-surface"
              )}
            >
              По каталогу
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleSearch}
        className="hidden lg:block h-[calc(100%-8px)] mr-1 px-6 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
      >
        Найти
      </button>
    </div>
  );
};
