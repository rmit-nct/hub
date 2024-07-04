'use client';

import { TransactionCategoryRowActions } from './row-actions';
import { TransactionCategory } from '@/types/primitives/TransactionCategory';
import { DataTableColumnHeader } from '@repo/ui/components/ui/custom/tables/data-table-column-header';
import { ColumnDef } from '@tanstack/react-table';
import moment from 'moment';

export const transactionCategoryColumns = (
  t: any
): ColumnDef<TransactionCategory>[] => [
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
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader t={t} column={column} title={t('id')} />
    ),
    cell: ({ row }) => <div className="line-clamp-1">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader t={t} column={column} title={t('name')} />
    ),
    cell: ({ row }) => <div>{row.getValue('name') || '-'}</div>,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader t={t} column={column} title={t('amount')} />
    ),
    cell: ({ row }) => (
      <div className="font-semibold">{row.getValue('amount')}</div>
    ),
  },
  {
    accessorKey: 'is_expense',
    header: ({ column }) => (
      <DataTableColumnHeader t={t} column={column} title={t('type')} />
    ),
    cell: ({ row }) => (
      <div>
        {row.getValue('is_expense') ? (
          <div className="bg-dynamic-red/10 text-dynamic-red border-dynamic-red/20 w-fit rounded border px-1 font-semibold">
            {t('expense')}
          </div>
        ) : (
          <div className="bg-dynamic-green/10 text-dynamic-green border-dynamic-green/20 w-fit rounded border px-1 font-semibold">
            {t('income')}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader t={t} column={column} title={t('created_at')} />
    ),
    cell: ({ row }) => (
      <div>
        {row.getValue('created_at')
          ? moment(row.getValue('created_at')).format('DD/MM/YYYY, HH:mm:ss')
          : '-'}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <TransactionCategoryRowActions row={row} />,
  },
];
