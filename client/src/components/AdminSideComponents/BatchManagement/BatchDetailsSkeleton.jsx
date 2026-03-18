import React from 'react'

const BatchDetailsSkeleton = () => {
  return (
    <div className="py-5 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
          <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner Skeleton */}
          <div className="h-80 bg-gray-200 rounded-tl-3xl rounded-br-3xl"></div>

          {/* Description Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="h-6 w-40 bg-gray-200 rounded mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>

          {/* Courses Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                  <div>
                    <div className="h-6 w-24 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="h-10 w-32 bg-gray-300 rounded-lg"></div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 border-2 border-gray-100 rounded-xl">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 flex gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                        <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-16 h-9 bg-gray-200 rounded-lg"></div>
                      <div className="w-20 h-9 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6 sticky top-20 h-fit">
          {/* Info Card Skeleton */}
          <div className="bg-gray-200 rounded-tl-3xl rounded-br-3xl p-6">
            <div className="h-6 w-40 bg-gray-300 rounded mb-6"></div>
            <div className="space-y-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-300/50 rounded-xl p-4 flex gap-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-20 bg-gray-300 rounded"></div>
                    <div className="h-5 w-32 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timestamps Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="h-5 w-28 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BatchDetailsSkeleton