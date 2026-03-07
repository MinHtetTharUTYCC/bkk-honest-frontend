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

export function SearchFilters({
  categoryId,
  sort = 'popular',
  onCategoryChange,
  onSortChange,
  className,
}: SearchFiltersProps) {
  const [isClient, setIsClient] = useState(false);
  const { data: categoriesResponse } = useCategories();
  // @ts-ignore
  const categories = categoriesResponse?.data || categoriesResponse || [];

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const categoryOptions = [
    { id: '', name: 'All Categories' },
    ...categories.map((cat: any) => ({ id: cat.id, name: cat.name })),
  ];

  const sortOptions = [
    { id: 'popular', name: 'Most Popular' },
    { id: 'newest', name: 'Newest First' },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <Dropdown
        label="Category"
        options={categoryOptions}
        value={categoryId || ''}
        onChange={(value) => onCategoryChange(value || undefined)}
        placeholder="All Categories"
      />

      <Dropdown
        label="Sort By"
        options={sortOptions}
        value={sort}
        onChange={(value: any) => onSortChange(value)}
      />
    </div>
  );
}
