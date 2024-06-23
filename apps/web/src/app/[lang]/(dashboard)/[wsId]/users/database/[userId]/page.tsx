import UserMonthAttendance from '../../attendance/user-month-attendance';
import { CustomDataTable } from '@/components/custom-data-table';
import { invoiceColumns } from '@/data/columns/invoices';
import { verifyHasSecrets } from '@/lib/workspace-helper';
import { WorkspaceUserReport } from '@/types/db';
import { Invoice } from '@/types/primitives/Invoice';
import { WorkspaceUser } from '@/types/primitives/WorkspaceUser';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@repo/ui/components/ui/button';
import { Separator } from '@repo/ui/components/ui/separator';
import { TicketCheck, Users } from 'lucide-react';
import moment from 'moment';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  params: {
    wsId: string;
    userId: string;
  };
  searchParams: {
    q: string;
    page: string;
    pageSize: string;
  };
}

export default async function WorkspaceUserDetailsPage({
  params: { wsId, userId },
  searchParams,
}: Props) {
  await verifyHasSecrets(wsId, ['ENABLE_USERS'], `/${wsId}`);

  const { t } = useTranslation('user-data-table');

  const data = await getData({ wsId, userId });

  const { data: groups, count: groupCount } = await getGroupData({
    wsId,
    userId,
  });

  const { data: reports, count: reportCount } = await getReportData({
    wsId,
    userId,
  });

  const { data: coupons, count: couponCount } = await getCouponData({
    wsId,
    userId,
  });

  const { data: invoiceData, count: invoiceCount } = await getInvoiceData(
    wsId,
    userId,
    searchParams
  );

  return (
    <div className="flex min-h-full w-full flex-col">
      {data.avatar_url && (
        <div className="mb-2 flex flex-col items-center justify-center gap-2 text-lg font-semibold">
          <Image
            width={128}
            height={128}
            src={data.avatar_url}
            alt="Avatar"
            className="aspect-square min-w-[8rem] rounded-lg object-cover"
          />
          {data.full_name && <div>{data.full_name}</div>}
        </div>
      )}

      <div className="grid h-fit gap-4 md:grid-cols-2">
        <div className="grid gap-4">
          <div className="grid h-fit gap-2 rounded-lg border p-4">
            <div className="text-lg font-semibold">Thông tin cơ bản</div>
            <Separator />
            {data.display_name && (
              <div>
                <span className="opacity-60">{t('display_name')}:</span>{' '}
                {data.display_name}
              </div>
            )}
            {data.birthday && (
              <div>
                <span className="opacity-60">{t('birthday')}:</span>{' '}
                {t(data.birthday)}
              </div>
            )}
            {data.email && (
              <div>
                <span className="opacity-60">{t('email')}:</span> {data.email}
              </div>
            )}
            {data.phone && (
              <div>
                <span className="opacity-60">{t('phone')}:</span> {data.phone}
              </div>
            )}
            {data.gender && (
              <div>
                <span className="opacity-60">{t('gender')}:</span>{' '}
                {t(data.gender)}
              </div>
            )}
            <div className="flex gap-1">
              <span className="opacity-60">{t('created_at')}:</span>{' '}
              {data.created_at
                ? moment(data.created_at).format('DD/MM/YYYY, HH:mm:ss')
                : '-'}
            </div>
          </div>

          <UserMonthAttendance
            wsId={wsId}
            user={{
              id: data.id,
              full_name: data.full_name,
              href: `/${wsId}/users/database/${data.id}`,
            }}
          />
        </div>

        <div className="grid gap-4">
          <div className="h-full rounded-lg border p-4">
            <div className="grid gap-2">
              <div className="text-lg font-semibold">
                Nhóm đã tham gia ({groupCount})
              </div>
              <Separator />
              <div className="grid gap-2 2xl:grid-cols-2">
                {groups && groups.length ? (
                  groups.map((group) => (
                    <Link
                      key={group.id}
                      href={`/${wsId}/users/groups/${group.id}`}
                    >
                      <Button
                        className="flex w-full items-center gap-2"
                        variant="secondary"
                      >
                        <Users className="inline-block h-6 w-6" />
                        {group.name}
                      </Button>
                    </Link>
                  ))
                ) : (
                  <div className="text-center text-opacity-60">
                    {t('no_groups')}.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-full rounded-lg border p-4">
            <div className="grid gap-2">
              <div className="text-lg font-semibold">
                Báo cáo ({reportCount})
              </div>
              <Separator />
              <div className="grid gap-2 2xl:grid-cols-2">
                {reports && reports.length ? (
                  reports.map((report) => (
                    <Link
                      key={report.id}
                      href={`/${wsId}/users/reports/${report.id}`}
                    >
                      <Button
                        className="flex w-full items-center gap-2"
                        variant="secondary"
                      >
                        <Users className="inline-block h-6 w-6" />
                        {report.title}
                      </Button>
                    </Link>
                  ))
                ) : (
                  <div className="text-center text-opacity-60">
                    {t('no_reports')}.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-full rounded-lg border p-4">
            <div className="grid gap-2">
              <div className="text-lg font-semibold">
                Mã giảm giá liên kết ({couponCount})
              </div>
              <Separator />
              <div className="grid gap-2">
                {coupons && coupons.length ? (
                  coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="border-border bg-foreground/5 flex items-center gap-2 rounded border p-2"
                    >
                      <TicketCheck className="inline-block h-6 w-6" />
                      {coupon.name}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-opacity-60">
                    {t('no_coupons')}.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-2 mt-4 text-lg font-semibold">
        Hoá đơn ({invoiceCount})
      </div>
      <CustomDataTable
        data={invoiceData}
        columnGenerator={invoiceColumns}
        namespace="invoice-data-table"
        count={invoiceCount}
        defaultVisibility={{
          id: false,
          customer: false,
          customer_id: false,
          price: false,
          total_diff: false,
          note: false,
        }}
      />
    </div>
  );
}

async function getData({ wsId, userId }: { wsId: string; userId: string }) {
  const supabase = createClient();

  const queryBuilder = supabase
    .from('workspace_users')
    .select(
      '*, linked_users:workspace_user_linked_users(platform_user_id, users(display_name, workspace_members!inner(user_id, ws_id)))'
    )
    .eq('ws_id', wsId)
    .eq('id', userId)
    .eq('linked_users.users.workspace_members.ws_id', wsId)
    .single();

  const { data: rawData, error } = await queryBuilder;
  if (error) throw error;

  const data = {
    ...rawData,
    linked_users: rawData.linked_users
      .map(
        ({
          platform_user_id,
          users,
        }: {
          platform_user_id: string;
          users: {
            display_name: string | null;
          } | null;
        }) =>
          users
            ? { id: platform_user_id, display_name: users.display_name || '' }
            : null
      )
      .filter((v: WorkspaceUser | null) => v),
  };

  return data as WorkspaceUser;
}

async function getGroupData({
  wsId,
  userId,
}: {
  wsId: string;
  userId: string;
}) {
  const supabase = createClient();

  const queryBuilder = supabase
    .from('workspace_user_groups')
    .select('*, workspace_user_groups_users!inner(user_id)', {
      count: 'exact',
    })
    .eq('ws_id', wsId)
    .eq('workspace_user_groups_users.user_id', userId);

  const { data, count, error } = await queryBuilder;
  if (error) throw error;

  return { data, count };
}

async function getReportData({
  wsId,
  userId,
}: {
  wsId: string;
  userId: string;
}) {
  const supabase = createClient();

  const queryBuilder = supabase
    .from('external_user_monthly_reports')
    .select('*, user:workspace_users!user_id!inner(ws_id)', {
      count: 'exact',
    })
    .eq('user_id', userId)
    .eq('user.ws_id', wsId)
    .order('created_at', { ascending: false });

  const { data: rawData, count, error } = await queryBuilder;
  if (error) throw error;

  const data = rawData.map((rowData) => {
    const preprocessedData: {
      user?: any;
      [key: string]: any;
    } = {
      ...rowData,
    };

    delete preprocessedData.user;
    return preprocessedData as WorkspaceUserReport;
  });

  return { data, count } as { data: WorkspaceUserReport[]; count: number };
}

async function getCouponData({
  wsId,
  userId,
}: {
  wsId: string;
  userId: string;
}) {
  const supabase = createClient();

  const queryBuilder = supabase
    .from('workspace_promotions')
    .select('*, user_linked_promotions!inner(user_id)', {
      count: 'exact',
    })
    .eq('ws_id', wsId)
    .eq('user_linked_promotions.user_id', userId);

  const { data, count, error } = await queryBuilder;
  if (error) throw error;

  return { data, count };
}

async function getInvoiceData(
  wsId: string,
  userId: string,
  {
    q,
    page = '1',
    pageSize = '10',
  }: { q?: string; page?: string; pageSize?: string }
) {
  const supabase = createClient();

  const queryBuilder = supabase
    .from('finance_invoices')
    .select('*, customer:workspace_users!customer_id(full_name)', {
      count: 'exact',
    })
    .eq('ws_id', wsId)
    .eq('customer_id', userId)
    .order('created_at', { ascending: false });

  if (q) queryBuilder.ilike('name', `%${q}%`);

  if (page && pageSize) {
    const parsedPage = parseInt(page);
    const parsedSize = parseInt(pageSize);
    const start = (parsedPage - 1) * parsedSize;
    const end = parsedPage * parsedSize;
    queryBuilder.range(start, end).limit(parsedSize);
  }

  const { data: rawData, error, count } = await queryBuilder;
  if (error) throw error;

  const data = rawData.map(({ customer, ...rest }) => ({
    ...rest,
    // @ts-expect-error
    customer: customer?.full_name || '-',
  }));

  return { data, count } as { data: Invoice[]; count: number };
}
