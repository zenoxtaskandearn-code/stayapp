import { motion } from 'framer-motion';

const PropertyCardSkeleton = () => {
  return (
    <div className="card-premium">
      <div className="skeleton-shimmer h-48 w-full" />
      <div className="p-5">
        <div className="skeleton-shimmer h-6 w-3/4 mb-2 rounded" />
        <div className="skeleton-shimmer h-4 w-1/2 mb-3 rounded" />
        <div className="flex gap-4">
          <div className="skeleton-shimmer h-4 w-16 rounded" />
          <div className="skeleton-shimmer h-4 w-16 rounded" />
          <div className="skeleton-shimmer h-4 w-20 rounded" />
        </div>
      </div>
    </div>
  );
};

export const PropertyGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default PropertyCardSkeleton;
