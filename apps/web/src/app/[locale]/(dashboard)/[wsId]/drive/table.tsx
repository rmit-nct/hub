'use client';

import { storageObjectsColumns } from './columns';
import { StorageObjectForm } from './form';
import { CustomDataTable } from '@/components/custom-data-table';
import { StorageObject } from '@/types/primitives/StorageObject';
import { Dialog } from '@repo/ui/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface Props {
  wsId: string;
  data: StorageObject[];
  count: number;
}

export default function StorageObjectsTable({ wsId, data, count }: Props) {
  const t = useTranslations('common');

  const [storageObj, setStorageObject] = useState<StorageObject>();

  const onComplete = () => {
    setStorageObject(undefined);
  };

  return (
    <Dialog
      open={!!storageObj}
      onOpenChange={(open) =>
        setStorageObject(open ? storageObj || {} : undefined)
      }
    >
      <CustomDataTable
        data={data}
        columnGenerator={(t: any, namespace: string) =>
          storageObjectsColumns(t, namespace, setStorageObject, wsId)
        }
        namespace="storage-object-data-table"
        count={count}
        defaultVisibility={{
          id: false,
        }}
        newObjectTitle={t('upload')}
        editContent={
          <StorageObjectForm
            wsId={wsId}
            onComplete={onComplete}
            submitLabel={storageObj?.id ? t('edit') : t('upload')}
          />
        }
      />
    </Dialog>
  );
}
