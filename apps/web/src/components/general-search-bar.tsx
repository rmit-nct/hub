'use client';

import useSearchParams from '@/hooks/useSearchParams';
import SearchBar from '@ncthub/ui/custom/search-bar';
import { cn } from '@ncthub/utils/format';
import { useTranslations } from 'next-intl';

interface Props {
  resetPage?: boolean;
  className?: string;
}

const GeneralSearchBar = ({ resetPage = true, className }: Props) => {
  const t = useTranslations();
  const searchParams = useSearchParams();

  return (
    <SearchBar
      t={t}
      className={cn('w-full', className)}
      defaultValue=""
      onSearch={(q: string) =>
        searchParams.set({ q, page: resetPage ? '1' : undefined })
      }
    />
  );
};

export default GeneralSearchBar;
