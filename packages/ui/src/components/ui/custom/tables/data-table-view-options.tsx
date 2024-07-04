'use client';

import { Button } from '../../button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../../dropdown-menu';
import { ScrollArea } from '../../scroll-area';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { UserCog } from 'lucide-react';
import { Fragment } from 'react';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  extraColumns?: any[];
  namespace: string;
  t?: any;
}

export function DataTableViewOptions<TData>({
  t,
  namespace,
  table,
  extraColumns,
}: DataTableViewOptionsProps<TData>) {
  const isShowingAll = table
    .getAllColumns()
    .every((column) => column.getIsVisible());

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto h-8 w-full md:w-fit"
        >
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          {t?.('common.view-options') || 'View Options'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          {t?.('common.toggle-columns') || 'Toggle Columns'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-36">
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== 'undefined' && column.getCanHide()
            )
            .map((column, idx) => {
              return (
                <Fragment key={column.id}>
                  {/* If this item is the last system column before the extra
                  columns start (if there is any), add a separator */}
                  {extraColumns?.length &&
                  extraColumns[0].id === column.id &&
                  idx !== 0 ? (
                    <DropdownMenuSeparator key={`${column.id}-separator`} />
                  ) : null}

                  <DropdownMenuCheckboxItem
                    key={`${column.id}-checkbox`}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(value)}
                  >
                    {extraColumns?.some(
                      (extraColumn) => extraColumn.id === column.id
                    ) ? (
                      <UserCog className="mr-2 h-4 w-4" />
                    ) : undefined}

                    {/* @ts-expect-error */}
                    {extraColumns?.findLast(
                      (extraColumn: { id: string; name?: string }) =>
                        extraColumn.id === column.id
                    )?.name || t?.(`${namespace}.${column.id}`)}
                  </DropdownMenuCheckboxItem>
                </Fragment>
              );
            })}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>
          <Button
            className="w-full"
            size="sm"
            onClick={() => {
              table
                .getAllColumns()
                .forEach((column) => column.toggleVisibility(!isShowingAll));
            }}
          >
            {isShowingAll
              ? t?.('common.hide-all') || 'Hide All'
              : t?.('common.show-all') || 'Show All'}
          </Button>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
