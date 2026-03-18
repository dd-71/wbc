import React from "react";

const SkeletonBox = ({ className = "" }) => (
  <div
    className={`animate-pulse bg-gray-200 rounded-md ${className}`}
  />
);

const DashboardSkeleton = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* SIDEBAR SKELETON */}
      <aside className="w-72 bg-white border-r px-4 py-6 space-y-6">
        {/* Logo */}
        <SkeletonBox className="h-8 w-32 mx-auto" />

        {/* Menu */}
        <div className="space-y-3 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonBox className="h-6 w-6 rounded-full" />
              <SkeletonBox className="h-4 w-32" />
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* NAVBAR */}
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
          <SkeletonBox className="h-4 w-48" />

          <div className="flex items-center gap-4">
            <SkeletonBox className="h-8 w-8 rounded-full" />
            <SkeletonBox className="h-8 w-8 rounded-full" />
            <SkeletonBox className="h-9 w-9 rounded-full" />
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Page Title */}
          <div>
            <SkeletonBox className="h-6 w-40 mb-2" />
            <SkeletonBox className="h-4 w-64" />
          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBox key={i} className="h-28 w-full" />
            ))}
          </div>

          {/* CHART AREA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SkeletonBox className="h-80 col-span-2" />
            <SkeletonBox className="h-80" />
          </div>

          {/* TABLE / LIST */}
          <div className="bg-white border rounded-lg p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBox key={i} className="h-4 w-full" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
