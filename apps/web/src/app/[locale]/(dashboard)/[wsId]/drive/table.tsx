'use client';

import { storageObjectsColumns } from './columns';
import { CustomDataTable } from '@/components/custom-data-table';
import { StorageObject } from '@ncthub/types/primitives/StorageObject';
import { Dialog } from '@ncthub/ui/dialog';
import { useState } from 'react';

interface Props {
  wsId: string;
  data: StorageObject[];
  path?: string;
  count: number;
}

export default function StorageObjectsTable({
  wsId,
  data,
  path,
  count,
}: Props) {
  // const t = useTranslations('common');

  const [storageObj, setStorageObject] = useState<StorageObject>();

  // const onComplete = () => {
  //   setStorageObject(undefined);
  // };

  return (
    <Dialog
      open={!!storageObj}
      onOpenChange={(open) =>
        setStorageObject(open ? storageObj || {} : undefined)
      }
    >
      <CustomDataTable
        data={!path || path === '/' ? data : [{ name: '...' }, ...data]}
        columnGenerator={(t: any, namespace: string | undefined) =>
          storageObjectsColumns(t, namespace, setStorageObject, wsId, path)
        }
        namespace="storage-object-data-table"
        count={count}
        defaultVisibility={{
          id: false,
        }}
        // newObjectTitle={t('upload')}
        // editContent={
        //   <>
        //     <DialogTitle hidden />
        //     <StorageObjectForm
        //       wsId={wsId}
        //       onComplete={onComplete}
        //       uploadPath={path}
        //       submitLabel={storageObj?.id ? t('edit') : t('upload')}
        //     />
        //   </>
        // }
      />
    </Dialog>
  );
}
