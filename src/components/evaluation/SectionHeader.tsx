"use client";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="px-5 sm:px-6 pt-4 pb-2">
      <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      ) : null}
    </div>
  );
}


