export default function Loading() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 bg-gray-100 rounded w-64 mb-10"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Image Slider Skeleton */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-4">
            <div className="w-full aspect-[4/3] bg-gray-50 rounded-3xl"></div>
            <div className="flex gap-4">
              <div className="w-20 h-24 bg-gray-50 rounded-2xl"></div>
              <div className="w-20 h-24 bg-gray-50 rounded-2xl"></div>
              <div className="w-20 h-24 bg-gray-50 rounded-2xl"></div>
            </div>
          </div>
          
          {/* Product details skeleton */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col pt-10">
            <div className="h-8 bg-gray-100 rounded w-3/4 mb-4"></div>
            <div className="h-12 bg-gray-100 rounded w-1/3 mb-12"></div>
            
            <div className="h-4 bg-gray-100 rounded w-20 mb-4"></div>
            <div className="flex gap-2 mb-8">
              <div className="w-20 h-10 bg-gray-50 rounded-xl"></div>
              <div className="w-20 h-10 bg-gray-50 rounded-xl"></div>
            </div>
            
            <div className="h-4 bg-gray-100 rounded w-20 mb-4"></div>
            <div className="flex gap-3 mb-10">
              <div className="w-8 h-8 rounded-full bg-gray-50"></div>
              <div className="w-8 h-8 rounded-full bg-gray-50"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
