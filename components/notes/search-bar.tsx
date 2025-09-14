'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { debounce } from '@/lib/utils';

interface SearchBarProps {
  onSearch?: (query: string, filters: any) => void;
  placeholder?: string;
  auto?: boolean; // if true, triggers search on typing with debounce
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch,
  placeholder = "Search notes, subjects, tags...",
  auto = true,
}) => {
  const [query, setQuery] = useState('');

  const debouncedSearch = useMemo(
    () => debounce((q: string) => onSearch?.(q, {}), 300),
    [onSearch]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query, {});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (auto) debouncedSearch(q);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={handleChange}
            placeholder={placeholder}
            className="pl-10"
          />
        </div>
        <Button type="submit" size="default">
          Search
        </Button>
      </form>
    </div>
  );
};
