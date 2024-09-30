import { PostEmailStatus } from './post';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui/components/ui/alert-dialog';
import { Button } from '@repo/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/ui/dialog';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { Separator } from '@repo/ui/components/ui/separator';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { toast } from '@repo/ui/hooks/use-toast';
import { cn } from '@repo/ui/lib/utils';
import { format } from 'date-fns';
import { BookPlus, Clock, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface UserGroupPost {
  id?: string;
  group_name?: string;
  title: string | null;
  content: string | null;
  notes: string | null;
  created_at?: string;
}

export default function UserGroupPosts({
  wsId,
  groupId,
  selectedPostId,
  posts,
  onClick,
}: {
  wsId: string;
  groupId?: string;
  selectedPostId?: string;
  posts: UserGroupPost[];
  onClick?: (id: string) => void;
}) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<UserGroupPost | undefined>();

  const handleOpenDialog = (post?: UserGroupPost) => {
    setCurrentPost(
      post || {
        title: '',
        content: '',
        notes: '',
      }
    );
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setCurrentPost(undefined);
    setIsDialogOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (currentPost) {
      setCurrentPost({ ...currentPost, [e.target.name]: e.target.value });
    }
  };

  const submitPost = async () => {
    if (!currentPost || !groupId) return;

    const method = currentPost.id ? 'PUT' : 'POST';
    const url = `/api/v1/workspaces/${wsId}/user-groups/${groupId}/posts${currentPost.id ? `/${currentPost.id}` : ''}`;

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentPost),
    });

    if (res.ok) {
      handleCloseDialog();
      router.refresh();
    } else {
      toast({
        title: 'Error',
        content: 'An error occurred while saving the post.',
      });
    }
  };

  const deletePost = async (postId: string) => {
    if (!groupId) return;

    const res = await fetch(
      `/api/v1/workspaces/${wsId}/user-groups/${groupId}/posts/${postId}`,
      {
        method: 'DELETE',
      }
    );

    if (res.ok) {
      handleCloseDialog();
      router.refresh();
    } else {
      toast({
        title: 'Error',
        content: 'An error occurred while deleting the post.',
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Posts</div>
        {groupId && (
          <Button onClick={() => handleOpenDialog()}>
            <BookPlus className="mr-1 h-5 w-5" />
            Add Post
          </Button>
        )}
      </div>
      <Separator className="mt-4 w-full" />
      <div className="flex max-h-96 flex-col gap-2 overflow-y-auto py-4">
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {currentPost?.id ? 'Edit Post' : 'Add New Post'}
              </DialogTitle>
              <DialogDescription>
                {currentPost?.id
                  ? 'Make changes to your post here.'
                  : 'Create a new post.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid items-center gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder='e.g. "Meeting Notes"'
                  value={currentPost?.title || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid items-center gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder='e.g. "Today we discussed the upcoming event."'
                  value={currentPost?.content || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid items-center gap-2">
                <Label htmlFor="created_at">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder='e.g. "Remember to follow up with the team."'
                  value={currentPost?.notes || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={submitPost}>
                {currentPost?.id ? 'Save changes' : 'Create post'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {posts.length > 0 ? (
          posts.map((post) => (
            <Link
              href={
                groupId
                  ? `/${wsId}/users/groups/${groupId}/posts/${post.id}`
                  : '#'
              }
              key={post.id}
              className={cn(
                'hover:border-foreground hover:bg-foreground/10 flex flex-col gap-2 rounded border p-2 transition duration-300',
                selectedPostId === post.id &&
                  'border-foreground bg-foreground/10',
                groupId || 'cursor-pointer'
              )}
              onClick={() => post.id && onClick && onClick(post.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold">{post.title}</div>
                  <div className="flex flex-wrap items-center gap-2 font-semibold">
                    {post?.group_name && (
                      <div className="bg-foreground text-background flex w-fit items-center gap-0.5 rounded px-2 py-1 text-xs">
                        {post?.group_name}
                      </div>
                    )}
                    {post.created_at && (
                      <div className="flex items-center gap-0.5 text-xs opacity-70">
                        <Clock className="h-3 w-3" />
                        {format(new Date(post.created_at), 'HH:mm, dd/MM/yyyy')}
                      </div>
                    )}
                  </div>
                </div>
                {groupId && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(post)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove your data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => post.id && deletePost(post.id)}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
              {post.content && (
                <div className="whitespace-pre-line text-sm opacity-70">
                  {post.content}
                </div>
              )}
              {groupId && post.id && (
                <PostEmailStatus groupId={groupId} postId={post.id} />
              )}
            </Link>
          ))
        ) : (
          <div className="text-center text-sm opacity-50">
            No posts to show.
          </div>
        )}
      </div>
    </>
  );
}
