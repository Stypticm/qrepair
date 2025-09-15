'use client';

export default function Loading() {
  return (
    <div className="p-6 w-full max-w-md mx-auto">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="h-10 w-full bg-gray-200 rounded" />
        <div className="h-10 w-full bg-gray-200 rounded" />
        <div className="h-10 w-full bg-gray-200 rounded" />
        <div className="h-10 w-full bg-gray-200 rounded" />
      </div>
    </div>
  );
}


