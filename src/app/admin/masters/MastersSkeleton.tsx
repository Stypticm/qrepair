import { Skeleton } from '@/components/ui/skeleton';

export function MastersSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <Skeleton className="w-12 h-12 rounded-xl mr-4" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <Skeleton className="w-5 h-5 mr-3 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex items-start">
                <Skeleton className="w-5 h-5 mr-3 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-start">
                <Skeleton className="w-5 h-5 mr-3 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
