import PostEmailTemplate from '@/app/[locale]/(dashboard)/[wsId]/mailbox/send/post-template';
import { UserGroupPost } from '@/app/[locale]/(dashboard)/[wsId]/users/groups/[groupId]/posts';
import { useState } from 'react';
import ReactDOMServer from 'react-dom/server';

const useEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sendEmail = async ({
    wsId,
    groupId,
    postId,
    post,
    users: rawUsers,
  }: {
    wsId: string;
    groupId: string;
    postId: string;
    post: UserGroupPost;
    users: {
      email: string;
      username: string;
      notes: string;
      is_completed: boolean;
    }[];
  }): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const users = rawUsers.map((user) => ({
      ...user,
      content: ReactDOMServer.renderToString(
        <PostEmailTemplate
          post={post}
          username={user.username}
          isHomeworkDone={user?.is_completed}
          notes={user?.notes || undefined}
        />
      ),
    }));

    const res = await fetch(
      `/api/v1/workspaces/${wsId}/user-groups/${groupId}/group-checks/${postId}/email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          users,
        }),
      }
    );

    if (!res.ok) {
      setError('Failed to send email');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return { sendEmail, loading, error, success };
};

export default useEmail;