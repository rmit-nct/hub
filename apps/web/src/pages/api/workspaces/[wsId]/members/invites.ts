import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { wsId } = req.query;

    if (!wsId || typeof wsId !== 'string') throw new Error('Invalid wsId');

    switch (req.method) {
      case 'GET':
        return await fetchInvites(req, res, wsId);

      default:
        throw new Error(
          `The HTTP ${req.method} method is not supported at this route.`
        );
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: {
        message: 'Something went wrong',
      },
    });
  }
};

export default handler;

const fetchInvites = async (
  req: NextApiRequest,
  res: NextApiResponse,
  wsId: string
) => {
  const supabase = createServerSupabaseClient({ req, res });

  const { data, error } = await supabase
    .from('workspace_invites')
    .select('created_at, users(id, handle, display_name, avatar_url, email)')
    .eq('ws_id', wsId);

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json(
    data.map((member) => ({
      ...member.users,
      created_at: member.created_at,
    }))
  );
};