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
      "relative flex items-center w-full h-12 bg-gray-100 rounded-apple-lg border-2 transition-all duration-200",
      isFocused ? "border-teal-500 bg-white ring-4 ring-teal-500/10" : "border-transparent hover:bg-gray-50"
    )}>
      <Search className={cn(
        "w-5 h-5 ml-4 mr-3 transition-colors",
        isFocused ? "text-teal-500" : "text-gray-400"
      )} />

      <input
        type="text"
        placeholder="Поиск товаров (например, iPhone 15 Pro)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400 h-full"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      <div className="h-6 w-[1px] bg-gray-300 mx-2"></div>

      <div className="relative h-full">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
          className="flex items-center gap-2 px-4 h-full text-xs font-semibold text-gray-600 hover:text-teal-600 sm:w-[140px] justify-between transition-colors"
        >
          <span>{scope === 'all' ? 'По всему сайту' : 'По каталогу'}</span>
          <ChevronDown className={cn(
            "w-3.5 h-3.5 opacity-50 transition-transform",
            isDropdownOpen && "rotate-180"
          )} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
            <button
              onClick={() => {
                setScope('all');
                setIsDropdownOpen(false);
              }}
              className={cn(
                "w-full px-4 py-2.5 text-left text-sm font-medium transition-colors",
                scope === 'all' ? "bg-teal-50 text-teal-600" : "text-gray-700 hover:bg-gray-50"
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
                scope === 'catalog' ? "bg-teal-50 text-teal-600" : "text-gray-700 hover:bg-gray-50"
              )}
            >
              По каталогу
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleSearch}
        className="h-[calc(100%-8px)] mr-1 px-6 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
      >
        Найти
      </button>
    </div>
  );
};
