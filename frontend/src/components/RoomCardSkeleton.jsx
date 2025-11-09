import React from 'react';

/**
 * RoomCardSkeleton Component
 *
 * Skeleton loading placeholder for RoomCard while data is being fetched.
 * Matches the structure of RoomCard for smooth loading transition.
 */
const RoomCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse">
      {/* Skeleton Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start mb-2">
          {/* Room number skeleton */}
          <div className="h-7 w-20 bg-gray-300 rounded"></div>
          {/* Status badge skeleton */}
          <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
        </div>
        {/* Room type skeleton */}
        <div className="h-4 w-24 bg-gray-200 rounded mt-2"></div>
      </div>

      {/* Skeleton Body */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Floor & Capacity row */}
          <div className="flex justify-between">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>

          {/* Price skeleton */}
          <div className="pt-2">
            <div className="h-8 w-32 bg-gray-300 rounded"></div>
            <div className="h-3 w-16 bg-gray-200 rounded mt-1"></div>
          </div>

          {/* Button skeleton */}
          <div className="pt-2">
            <div className="h-10 w-full bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCardSkeleton;
