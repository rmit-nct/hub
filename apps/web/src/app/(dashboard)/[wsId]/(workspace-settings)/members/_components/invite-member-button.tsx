'use client';

import SelectUserForm from '@/components/forms/SelectUserForm';
import { UserPlusIcon } from '@heroicons/react/24/solid';
import { openModal } from '@mantine/modals';

interface Props {
  wsId?: string;
  label?: string;
}

export default function InviteMemberButton({ wsId, label }: Props) {
  const showSelectUserForm = () => {
    if (!wsId) return;
    openModal({
      title: <div className="font-semibold">{label}</div>,
      centered: true,
      children: <SelectUserForm wsId={wsId} />,
    });
  };

  return (
    <button
      onClick={showSelectUserForm}
      className="flex h-fit items-center justify-center gap-1 rounded border border-blue-500/10 bg-blue-500/10 px-4 py-2 font-semibold text-blue-600 transition hover:bg-blue-500/20 dark:border-blue-300/10 dark:bg-blue-300/10 dark:text-blue-300 dark:hover:bg-blue-300/20"
    >
      {label}
      <UserPlusIcon className="h-4 w-4" />
    </button>
  );
}