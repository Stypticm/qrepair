'use client';

import { Bot, DollarSign, Wrench } from 'lucide-react';

type SectionKey = 'ai-evaluation' | 'ai-buyout' | 'repair';

export interface SectionTopBarProps {
  section: SectionKey;
  title: string;
  subtitle?: string;
  variant?: 'small' | 'large';
  align?: 'left' | 'center';
  topPaddingClassName?: string;
}

const iconBySection: Record<SectionKey, React.ComponentType<{ className?: string }>> = {
  'ai-evaluation': Bot,
  'ai-buyout': DollarSign,
  'repair': Wrench,
};

const colorBySection: Record<SectionKey, string> = {
  'ai-evaluation': 'text-blue-600',
  'ai-buyout': 'text-green-600',
  'repair': 'text-yellow-600',
};

export function SectionTopBar({ section, title, subtitle, variant = 'small', align = 'left', topPaddingClassName }: SectionTopBarProps) {
  const Icon = iconBySection[section];
  const color = colorBySection[section];

  return (
    <div className={`fixed top-0 left-0 right-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur-md ${topPaddingClassName || ''}`}>
      <div className={variant === 'large' ? 'mx-auto px-4 py-4' : 'mx-auto px-4 py-3'}>
        {variant === 'large' ? (
          <div className={align === 'center' ? 'flex items-center justify-center gap-3 text-center' : 'flex items-center gap-3'}>
            <Icon className={`w-10 h-10 ${color}`} />
            <div className="min-w-0">
              <div className={align === 'center' ? 'text-3xl font-bold text-gray-900 leading-tight truncate' : 'text-3xl font-bold text-gray-900 leading-tight truncate'}>{title}</div>
              {subtitle ? (
                <div className={align === 'center' ? 'text-lg text-gray-600 truncate' : 'text-lg text-gray-600 truncate'}>{subtitle}</div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${color}`} />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">{title}</div>
              {subtitle ? (
                <div className="text-[11px] text-gray-500 truncate">{subtitle}</div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SectionTopBar;


