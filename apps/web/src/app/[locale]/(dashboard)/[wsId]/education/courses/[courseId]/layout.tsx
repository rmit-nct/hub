import { createClient } from '@ncthub/supabase/next/server';
import type { UserGroup } from '@ncthub/types/primitives/UserGroup';
import FeatureSummary from '@ncthub/ui/custom/feature-summary';
import { GraduationCap } from '@ncthub/ui/icons';
import { Separator } from '@ncthub/ui/separator';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  params: Promise<{
    locale: string;
    wsId: string;
    courseId: string;
  }>;
}

export default async function CourseDetailsLayout({ children, params }: Props) {
  const t = await getTranslations();
  const { wsId, courseId } = await params;
  const data = await getData(wsId, courseId);

  return (
    <>
      <FeatureSummary
        title={
          <h1 className="flex w-full items-center gap-2 font-bold text-2xl">
            <div className="flex items-center gap-2 rounded-lg border border-dynamic-blue/20 bg-dynamic-blue/10 px-2 text-dynamic-blue text-lg max-md:hidden">
              <GraduationCap className="h-6 w-6" />
              {t('ws-courses.singular')}
            </div>
            <Link
              href={`/${wsId}/courses/${courseId}`}
              className="line-clamp-1 font-bold text-lg hover:underline md:text-2xl"
            >
              {data.name || t('common.unknown')}
            </Link>
          </h1>
        }
      />
      <Separator className="my-4" />
      {children}
    </>
  );
}

async function getData(wsId: string, courseId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('workspace_courses')
    .select('*')
    .eq('ws_id', wsId)
    .eq('id', courseId)
    .maybeSingle();

  if (error) throw error;
  if (!data) notFound();

  return data as UserGroup;
}
