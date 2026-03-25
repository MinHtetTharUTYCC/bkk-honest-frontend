'use client';

import { useEffect, useState } from 'react';
import { useCategories } from '@/hooks/use-api';
import { Dropdown } from '@/components/ui/dropdown';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  categoryId?: string;
  sort?: 'newest' | 'popular';
  onCategoryChange: (categoryId?: string) => void;
  onSortChange: (sort: 'newest' | 'popular') => void;
  className?: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

export function SearchFilters({
  categoryId,
  sort = 'popular',
  onCategoryChange,
  onSortChange,
  className,
}: SearchFiltersProps) {
  const [isClient, setIsClient] = useState(false);
  const { data: categoriesResponse } = useCategories();
  const categories = (Array.isArray(categoriesResponse) ? categoriesResponse : []) as CategoryOption[];

  useEffect(() => { setTimeout(() => setIsClient(true), 0); }, []);

  if (!isClient) return null;

  const categoryOptions = [
    { id: '', name: 'All Categories' },
    ...categories.map((cat) => ({ id: cat.id, name: cat.name })),
  ];

  const sortOptions = [
    { id: 'popular', name: 'Most Popular' },
    { id: 'newest', name: 'Newest First' },
  ];

  return (
    <div className={cn('flex flex-row justify-between gap-3 md:gap-4 lg:flex-col lg:gap-0 lg:space-y-4', className)}>
      <div className="flex-1 min-w-0">
        <Dropdown
          label="Category"
          options={categoryOptions}
          value={categoryId || ''}
          onChange={(value) => onCategoryChange(value || undefined)}
          placeholder="All Categories"
        />
      </div>

      <div className="flex-1 min-w-0">
        <Dropdown
          label="Sort By"
          options={sortOptions}
          value={sort}
          onChange={(value) => {
            if (value === 'newest' || value === 'popular') {
              onSortChange(value);
            }
          }}
        />
      </div>
    </div>
  );
}
