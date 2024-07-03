'use client';

import { WorkspaceUserReport } from '@/types/db';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Button } from '@repo/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/ui/dropdown-menu';
import { Row } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface UserReportRowActionsProps {
  row: Row<WorkspaceUserReport>;
}

export function UserReportRowActions({ row }: UserReportRowActionsProps) {
  // const router = useRouter();
  const t = useTranslations();

  const report = row.original;

  const deleteUserReport = async () => {
    // const res = await fetch(
    //   `/api/v1/workspaces/${report.ws_id}/reports/${report.id}`,
    //   {
    //     method: 'DELETE',
    //   }
    // );
    // if (res.ok) {
    //   router.refresh();
    // } else {
    //   const data = await res.json();
    //   toast({
    //     title: 'Failed to delete workspace user group tag',
    //     description: data.message,
    //   });
    // }
  };

  // const [showEditDialog, setShowEditDialog] = useState(false);

  // if (!report.id || !report.ws_id) return null;
  if (!report.id) return null;

  return (
    <div className="flex items-center justify-end gap-2">
      {report.href && (
        <Link href={report.href}>
          <Button>
            <Eye className="mr-1 h-5 w-5" />
            {t('common.view')}
          </Button>
        </Link>
      )}

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={deleteUserReport}>
            {t('common.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
