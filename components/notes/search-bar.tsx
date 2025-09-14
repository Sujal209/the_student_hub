'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string, filters: any) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch,
  placeholder = "Search notes, subjects, tags..." 
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query, {});
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10"
          />
        </div>
        <Button type="submit" size="default">
          Search
        </Button>
        <Button type="button" variant="outline" size="default">
          <Filter className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};