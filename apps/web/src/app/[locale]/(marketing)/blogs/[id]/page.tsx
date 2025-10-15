import { blogsData } from '../data';
import BlogDetailClient from './client';
import { notFound } from 'next/navigation';

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  const { blogId } = await params;

  const blog = blogsData.find((b) => b.id === blogId);

  if (!blog) {
    notFound();
  }

  return <BlogDetailClient blog={blog} />;
}
