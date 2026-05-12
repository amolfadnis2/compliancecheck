'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function navigate(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    router.push(`/blog?${params.toString()}`);
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Blog pagination" className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Prev
      </Button>

      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => navigate(page)}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
          className={cn(page === currentPage && 'bg-green-700 hover:bg-green-800 text-white border-green-700')}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}
