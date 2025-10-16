'use client';

import { createClient } from '@ncthub/supabase/next/client';
import { Badge } from '@ncthub/ui/badge';
import { Button } from '@ncthub/ui/button';
import { ArrowLeft, Calendar, Clock, User } from '@ncthub/ui/icons';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface BlogDetail {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date_published: string;
  category: string;
  image_url?: string;
  read_time: string;
  views_count?: number;
  likes_count?: number;
  tags?: string[];
  is_published?: boolean;
  slug?: string;
}

export default function BlogDetailPage() {
  const supabase = createClient();
  const params = useParams();

  const [blogDetail, setBlogDetail] = useState<BlogDetail[]>([]);

  const fetchBlogDetail = async () => {
    const { data, error } = await supabase
      .from('neo_blogs')
      .select('*')
      .eq('slug', params.slug)
      .eq('is_published', true)
      .single();

    if (error) {
      console.error('Error fetching blog:', error.message);
      return;
    }

    if (!data) {
      setBlogDetail(null);
      return;
    }

    // update views count
    await supabase
      .from('neo_blogs')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', data.id);

    setBlogDetail(data as BlogDetail);
  };

  useEffect(() => {
    if (params.slug) fetchBlogDetail();
  }, [params.slug]);

  if (!blogDetail) return null;

  console.log('blogDetail', blogDetail);
  
  return <BlogDetailClient blog={blog} />;

}
