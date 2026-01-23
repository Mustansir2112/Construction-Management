export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="text-center">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-96 mx-auto mt-2 animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-4">
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded w-12 mx-auto animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto mt-2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <div className="flex-1 h-10 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="flex-1 h-10 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="space