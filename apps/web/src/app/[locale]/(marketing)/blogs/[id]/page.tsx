import { blogsData } from '../data';
import BlogDetailClient from './client';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return blogsData.map((blog) => ({
    id: blog.id,
  }));
}

export default async function BlogDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const blog = blogsData.find((b) => b.id === id);

  if (!blog) {
    notFound();
  }

  return <BlogDetailClient blog={blog} />;
}
