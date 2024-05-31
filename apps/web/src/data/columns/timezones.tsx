'use client';

import { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/ui/custom/tables/data-table-column-header';
import moment from 'moment';
import { Translate } from 'next-translate';
import { Timezone, TimezoneStatus } from '@/types/primitives/Timezone';
import { TimezoneRowActions } from '@/components/row-actions/timezones';
import { Check, Clock, RefreshCw, RefreshCwOff, X } from 'lucide-react';

export const timezoneColumns = (t: Translate): ColumnDef<Timezone>[] => [
  // {
  //   id: 'select',
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={table.getIsAllPageRowsSelected()}
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: 'value',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('value')} />
    ),
    cell: ({ row }) => (
      <div className="line-clamp-3 max-w-[12rem] break-words">
        {row.getValue('value')}
      </div>
    ),
  },
  {
    accessorKey: 'abbr',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('abbr')} />
    ),
    cell: ({ row }) => (
      <div className="line-clamp-1 max-w-[4rem] break-words">
        {row.getValue('abbr') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'offset',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('offset')} />
    ),
    cell: ({ row }) => (
      <div className="line-clamp-1 max-w-[4rem] break-words">
        {Intl.NumberFormat('en-US', {
          signDisplay: 'exceptZero',
        }).format(row.getValue('offset'))}
      </div>
    ),
  },
  {
    accessorKey: 'isdst',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('isdst')} />
    ),
    cell: ({ row }) => (
      <div className="line-clamp-1 max-w-[4rem] break-words">
        {Boolean(row.getValue('isdst')) ? <Check /> : <X />}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('status')} />
    ),
    cell: ({ row }) => {
      const status = row.getValue<TimezoneStatus>('status');

      return (
        <div className="line-clamp-1 max-w-[4rem] break-words">
          {status === 'synced' ? (
            <Check />
          ) : status === 'outdated' ? (
            <RefreshCwOff />
          ) : status === 'pending' ? (
            <RefreshCw />
          ) : status === 'error' ? (
            <X />
          ) : (
            '-'
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'text',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('text')} />
    ),
    cell: ({ row }) => (
      <div className="line-clamp-3 max-w-[12rem] break-words">
        {row.getValue('text') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'utc',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('utc')} />
    ),
    cell: ({ row }) => (
      <div className="line-clamp-1 flex max-w-[8rem] items-center gap-1 break-words">
        <span>
          {((row.getValue('utc') as Array<string>) || [])?.length || '-'}
        </span>
        <Clock className="h-4 w-4" />
      </div>
    ),
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('created_at')} />
    ),
    cell: ({ row }) => (
      <div className="line-clamp-2 max-w-[8rem] break-words">
        {row.getValue('created_at')
          ? moment(row.getValue('created_at')).format('DD/MM/YYYY, HH:mm:ss')
          : '-'}
      </div>
    ),
  },
  {
    id: 'actions',
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => <TimezoneRowActions row={row} />,
  },
];
