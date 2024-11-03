'use client';

import { TailwindAdvancedEditor } from '../../../../../../documents/advanced-editor';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';
import { JSONContent } from 'novel';
import { useEffect, useState } from 'react';

export function ModuleContentEditor({
  courseId,
  moduleId,
}: {
  courseId: string;
  moduleId: string;
}) {
  const t = useTranslations();

  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<JSONContent | undefined>(undefined);

  useEffect(() => {
    getContent(courseId, moduleId).then((data) => {
      setContent(data as JSONContent);
      setLoading(false);
    });
  }, [courseId, moduleId]);

  const onSave = async (data: JSONContent) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('workspace_course_modules')
      .update({ content: data })
      .eq('id', moduleId)
      .eq('course_id', courseId);

    if (error) {
      console.error('error', error);
    }
  };

  if (loading) {
    return <div>{t('common.loading')}...</div>;
  }

  return (
    <>
      <TailwindAdvancedEditor
        content={content as JSONContent | undefined}
        onSave={onSave}
        disableLocalStorage
      />
    </>
  );
}

const getContent = async (courseId: string, moduleId: string) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('workspace_course_modules')
    .select('content')
    .eq('id', moduleId)
    .eq('course_id', courseId)
    .single();

  if (error) {
    console.error('error', error);
  }

  return data?.content;
};
