'use client';

// import { UserRowActions } from './row-actions';
import { EmailHistoryEntry } from '@/types/db';
import { DataTableColumnHeader } from '@repo/ui/components/ui/custom/tables/data-table-column-header';
import { ColumnDef } from '@tanstack/react-table';
import 'dayjs/locale/vi';
import moment from 'moment';

export const getEmailColumns = (
  t: any,
  namespace: string
  // extraData?: any
): ColumnDef<EmailHistoryEntry>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader
        t={t}
        column={column}
        title={t(`${namespace}.id`)}
      />
    ),
    cell: ({ row }) => (
      <div className="line-clamp-1 min-w-[8rem]">{row.getValue('id')}</div>
    ),
  },
  {
    accessorKey: 'recipient',
    header: ({ column }) => (
      <DataTableColumnHeader
        t={t}
        column={column}
        title={t(`${namespace}.recipient`)}
      />
    ),
    cell: ({ row }) => <div>{row.getValue('recipient') || '-'}</div>,
  },
  {
    accessorKey: 'sender',
    header: ({ column }) => (
      <DataTableColumnHeader
        t={t}
        column={column}
        title={t(`${namespace}.sender`)}
      />
    ),
    cell: ({ row }) => <div>{row.getValue('sender') || '-'}</div>,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader
        t={t}
        column={column}
        title={t(`${namespace}.email`)}
      />
    ),
    cell: ({ row }) => <div>{row.getValue('email') || '-'}</div>,
  },
  {
    accessorKey: 'subject',
    header: ({ column }) => (
      <DataTableColumnHeader
        t={t}
        column={column}
        title={t(`${namespace}.subject`)}
      />
    ),
    cell: ({ row }) => <div>{row.getValue('subject') || '-'}</div>,
  },
  {
    accessorKey: 'source_name',
    header: ({ column }) => (
      <DataTableColumnHeader
        t={t}
        column={column}
        title={t(`${namespace}.source_name`)}
      />
    ),
    cell: ({ row }) => <div>{row.getValue('source_name') || '-'}</div>,
  },
  {
    accessorKey: 'source_email',
    header: ({ column }) => (
      <DataTableColumnHeader
        t={t}
        column={column}
        title={t(`${namespace}.source_email`)}
      />
    ),
    cell: ({ row }) => <div>{row.getValue('source_email') || '-'}</div>,
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader
        t={t}
        column={column}
        title={t(`${namespace}.created_at`)}
      />
    ),
    cell: ({ row }) => (
      <div className="min-w-[8rem]">
        {moment(row.getValue('created_at')).format('DD/MM/YYYY')}
      </div>
    ),
  },
];