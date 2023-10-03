'use client';

import { useTheme } from 'next-themes';

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Check, Moon, Sparkle, Sun } from 'lucide-react';
import useTranslation from 'next-translate/useTranslation';

export function ThemeDropdownItems() {
  const { t } = useTranslation('common');
  const { setTheme } = useTheme();

  // get "theme" from localStorage
  const theme = localStorage.getItem('theme');

  return (
    <>
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => setTheme('light')}
        disabled={theme === 'light'}
      >
        {theme === 'light' ? (
          <Check className="mr-2 h-4 w-4" />
        ) : (
          <Sun className="mr-2 h-4 w-4" />
        )}
        {t('light')}
      </DropdownMenuItem>
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => setTheme('dark')}
        disabled={theme === 'dark'}
      >
        {theme === 'dark' ? (
          <Check className="mr-2 h-4 w-4" />
        ) : (
          <Moon className="mr-2 h-4 w-4" />
        )}
        {t('dark')}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => setTheme('system')}
        disabled={theme === 'system'}
      >
        {theme === 'system' ? (
          <Check className="mr-2 h-4 w-4" />
        ) : (
          <Sparkle className="mr-2 h-4 w-4" />
        )}
        {t('system')}
      </DropdownMenuItem>
    </>
  );
}