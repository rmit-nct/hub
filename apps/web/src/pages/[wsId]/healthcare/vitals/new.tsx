import { ReactElement, useEffect, useState } from 'react';
import HeaderX from '../../../../components/metadata/HeaderX';
import { PageWithLayoutProps } from '../../../../types/PageWithLayoutProps';
import { enforceHasWorkspaces } from '../../../../utils/serverless/enforce-has-workspaces';
import NestedLayout from '../../../../components/layouts/NestedLayout';
import { Divider, TextInput } from '@mantine/core';
import { openModal } from '@mantine/modals';
import VitalCreateModal from '../../../../components/loaders/vitals/VitalCreateModal';
import { useSegments } from '../../../../hooks/useSegments';
import { useWorkspaces } from '../../../../hooks/useWorkspaces';

export const getServerSideProps = enforceHasWorkspaces;

const NewVitalPage: PageWithLayoutProps = () => {
  const { setRootSegment } = useSegments();
  const { ws } = useWorkspaces();

  useEffect(() => {
    setRootSegment(
      ws
        ? [
            {
              content: ws?.name || 'Tổ chức không tên',
              href: `/${ws.id}`,
            },
            { content: 'Khám bệnh', href: `/${ws.id}/healthcare` },
            {
              content: 'Chỉ số',
              href: `/${ws.id}/healthcare/vitals`,
            },
            {
              content: 'Tạo mới',
              href: `/${ws.id}/healthcare/vitals/new`,
            },
          ]
        : []
    );

    return () => setRootSegment([]);
  }, [ws, setRootSegment]);

  const [name, setName] = useState<string>('');
  const [unit, setUnit] = useState<string>('');

  const hasRequiredFields = () => name.length > 0;

  const showLoaderModal = () => {
    if (!ws) return;
    openModal({
      title: <div className="font-semibold">Tạo chỉ số mới</div>,
      centered: true,
      closeOnEscape: false,
      closeOnClickOutside: false,
      withCloseButton: false,
      children: <VitalCreateModal wsId={ws.id} vital={{ name, unit }} />,
    });
  };

  return (
    <>
      <HeaderX label="Chỉ số mới - Khám bệnh" />
      <div className="mt-2 flex min-h-full w-full flex-col ">
        <div className="grid gap-x-8 gap-y-4 xl:gap-x-16">
          <div className="flex items-end justify-end">
            <button
              className={`rounded border border-blue-300/10 bg-blue-300/10 px-4 py-1 font-semibold text-blue-300 transition ${
                hasRequiredFields()
                  ? 'hover:bg-blue-300/20'
                  : 'cursor-not-allowed opacity-50'
              }`}
              onClick={hasRequiredFields() ? showLoaderModal : undefined}
            >
              Tạo mới
            </button>
          </div>
        </div>

        <Divider className="my-4" />
        <div className="grid h-fit gap-x-4 gap-y-2 md:grid-cols-2">
          <div className="col-span-full">
            <div className="text-2xl font-semibold">Thông tin cơ bản</div>
            <Divider className="my-2" variant="dashed" />
          </div>

          <TextInput
            label="Tên chỉ số"
            placeholder='Ví dụ: "Nhiệt độ", "Huyết áp", "Huyết đường", "Cholesterol", "Triglyceride", "Creatinine"'
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />

          <div />

          <TextInput
            label="Đơn vị tính"
            placeholder='Ví dụ: "°C", "mmHg", "mg/dl", "mg", "ml", "mg/kg"'
            value={unit}
            onChange={(e) => setUnit(e.currentTarget.value)}
          />
        </div>
      </div>
    </>
  );
};

NewVitalPage.getLayout = function getLayout(page: ReactElement) {
  return <NestedLayout noTabs>{page}</NestedLayout>;
};

export default NewVitalPage;
